<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\RefundRequest;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RefundController extends Controller
{
    /**
     * List all refund/void requests for accounting.
     */
    public function index(Request $request): Response
    {
        $query = RefundRequest::with([
            'student:id,first_name,last_name,lrn,student_photo_url,program,year_level',
            'studentFee:id,school_year,total_amount,total_paid,balance',
            'processedBy:id,name',
        ]);

        // Filter by status (default to pending)
        $status = $request->input('status', 'pending');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        $refunds = $query->latest()->paginate(20)->withQueryString();

        $refunds->getCollection()->transform(function ($r) {
            return [
                'id'               => $r->id,
                'type'             => $r->type,
                'amount'           => (float) $r->amount,
                'reason'           => $r->reason,
                'status'           => $r->status,
                'accounting_notes' => $r->accounting_notes,
                'processed_by'     => $r->processedBy?->name,
                'processed_at'     => $r->processed_at?->format('M d, Y h:i A'),
                'created_at'       => $r->created_at->format('M d, Y h:i A'),
                'school_year'      => $r->studentFee?->school_year,
                'student' => [
                    'id'                => $r->student->id,
                    'full_name'         => $r->student->full_name,
                    'lrn'               => $r->student->lrn,
                    'program'           => $r->student->program,
                    'year_level'        => $r->student->year_level,
                    'student_photo_url' => $r->student->student_photo_url,
                ],
            ];
        });

        // Summary stats
        $stats = [
            'pending'  => RefundRequest::where('status', 'pending')->count(),
            'approved' => RefundRequest::where('status', 'approved')->count(),
            'rejected' => RefundRequest::where('status', 'rejected')->count(),
            'total_approved_amount' => (float) RefundRequest::where('status', 'approved')->sum('amount'),
        ];

        return Inertia::render('accounting/refunds/index', [
            'refunds' => $refunds,
            'stats'   => $stats,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Get students for creating a refund request (search by name/LRN).
     */
    public function searchStudents(Request $request)
    {
        $search = $request->input('search', '');
        
        if (strlen($search) < 2) {
            return response()->json([]);
        }

        $students = Student::where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            })
            ->with(['fees' => function ($q) {
                $q->where('balance', '>', 0)
                  ->orWhere('total_paid', '>', 0);
            }])
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'full_name' => $s->full_name,
                'lrn' => $s->lrn,
                'program' => $s->program,
                'year_level' => $s->year_level,
                'fees' => $s->fees->map(fn ($f) => [
                    'id' => $f->id,
                    'school_year' => $f->school_year,
                    'total_amount' => (float) $f->total_amount,
                    'total_paid' => (float) $f->total_paid,
                    'balance' => (float) $f->balance,
                ]),
            ]);

        return response()->json($students);
    }

    /**
     * Store a new refund request created by accounting (for walk-in/physical requests).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'student_fee_id' => 'required|exists:student_fees,id',
            'type' => 'required|in:refund,void',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
        ]);

        // Verify fee belongs to student
        $fee = StudentFee::where('id', $validated['student_fee_id'])
            ->where('student_id', $validated['student_id'])
            ->firstOrFail();

        // For refunds, amount cannot exceed total_paid
        if ($validated['type'] === 'refund' && $validated['amount'] > $fee->total_paid) {
            return back()->withErrors([
                'amount' => 'Refund amount cannot exceed the total amount paid (₱' . number_format($fee->total_paid, 2) . ').',
            ]);
        }

        RefundRequest::create([
            'student_id' => $validated['student_id'],
            'student_fee_id' => $validated['student_fee_id'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Refund request created successfully.');
    }

    /**
     * Approve a refund/void request.
     * For refund: decrease total_paid and increase balance on the student fee.
     * For void:   same accounting effect — reverses an erroneous payment.
     */
    public function approve(Request $request, RefundRequest $refund): RedirectResponse
    {
        abort_if($refund->status !== 'pending', 422, 'Only pending requests can be approved.');

        $validated = $request->validate([
            'accounting_notes' => 'nullable|string|max:1000',
        ]);

        $refund->update([
            'status'           => 'approved',
            'processed_by'     => Auth::id(),
            'processed_at'     => now(),
            'accounting_notes' => $validated['accounting_notes'] ?? null,
        ]);

        // Adjust the student fee record if one is attached
        if ($refund->student_fee_id) {
            $fee = StudentFee::find($refund->student_fee_id);
            if ($fee) {
                $fee->total_paid = max(0, (float) $fee->total_paid - (float) $refund->amount);
                $fee->balance    = (float) $fee->total_amount - (float) $fee->total_paid;
                $fee->save();
            }
        }

        return back()->with('success', 'Refund/void request approved and fees adjusted.');
    }

    /**
     * Reject a refund/void request.
     */
    public function reject(Request $request, RefundRequest $refund): RedirectResponse
    {
        abort_if($refund->status !== 'pending', 422, 'Only pending requests can be rejected.');

        $validated = $request->validate([
            'accounting_notes' => 'nullable|string|max:1000',
        ]);

        $refund->update([
            'status'           => 'rejected',
            'processed_by'     => Auth::id(),
            'processed_at'     => now(),
            'accounting_notes' => $validated['accounting_notes'] ?? null,
        ]);

        return back()->with('success', 'Refund/void request rejected.');
    }
}
