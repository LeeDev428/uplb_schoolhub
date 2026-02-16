<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentPaymentController extends Controller
{
    /**
     * Display a listing of payments.
     */
    public function index(Request $request): Response
    {
        $query = StudentPayment::with(['student', 'recordedBy']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($q2) use ($search) {
                      $q2->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%")
                         ->orWhere('lrn', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($from = $request->input('from')) {
            $query->whereDate('payment_date', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('payment_date', '<=', $to);
        }

        // Filter by payment type
        if ($paymentFor = $request->input('payment_for')) {
            $query->where('payment_for', $paymentFor);
        }

        // Filter by department
        if ($departmentId = $request->input('department_id')) {
            $query->whereHas('student', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        // Filter by classification
        if ($classification = $request->input('classification')) {
            $query->whereHas('student.department', function ($q) use ($classification) {
                $q->where('classification', $classification);
            });
        }

        $payments = $query->latest('payment_date')
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        // Calculate total for filtered results
        $total = $query->sum('amount');

        // Get all students with their fees
        $students = Student::orderBy('last_name')->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'lrn' => $student->lrn,
                    'full_name' => $student->full_name,
                ];
            });

        // Get all fees grouped by student
        $studentFees = StudentFee::with('student')
            ->where('balance', '>', 0)
            ->get()
            ->groupBy('student_id')
            ->map(function ($fees) {
                return $fees->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'school_year' => $fee->school_year,
                        'total_amount' => $fee->total_amount,
                        'total_paid' => $fee->total_paid,
                        'balance' => $fee->balance,
                    ];
                });
            });

        // Get departments and classifications
        $departments = Department::orderBy('name')->get(['id', 'name', 'code', 'classification']);
        $classifications = Department::distinct()->pluck('classification')->filter()->sort()->values();

        return Inertia::render('accounting/payments/index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'from', 'to', 'payment_for', 'department_id', 'classification']),
            'total' => $total,
            'students' => $students,
            'studentFees' => $studentFees,
            'departments' => $departments,
            'classifications' => $classifications,
        ]);
    }

    /**
     * Export payments data.
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'excel');
        
        // For now, return a simple response
        // Later implement with Laravel Excel or similar
        return response()->json([
            'message' => 'Export functionality - implement with Laravel Excel package',
            'type' => $type,
        ]);
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'student_fee_id' => 'required|exists:student_fees,id',
            'payment_date' => 'required|date',
            'or_number' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_for' => 'nullable|in:registration,tuition,misc,books,other',
            'notes' => 'nullable|string',
        ]);

        $validated['recorded_by'] = auth()->id();

        StudentPayment::create($validated);

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, StudentPayment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'or_number' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_for' => 'nullable|in:registration,tuition,misc,books,other',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return redirect()->back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified payment.
     */
    public function destroy(StudentPayment $payment): RedirectResponse
    {
        $payment->delete();

        return redirect()->back()->with('success', 'Payment deleted successfully.');
    }

    /**
     * Show payment form for a specific student.
     */
    public function create(Request $request): Response
    {
        $studentId = $request->input('student_id');
        $student = null;
        $fees = collect();

        if ($studentId) {
            $student = \App\Models\Student::with('fees')->findOrFail($studentId);
            $fees = $student->fees;
        }

        return Inertia::render('accounting/payments/create', [
            'student' => $student,
            'fees' => $fees,
        ]);
    }

    /**
     * Show payment processing page for a specific student.
     */
    public function process(Student $student): Response
    {
        // Load student with all related data
        $student->load([
            'program', 
            'yearLevel', 
            'section',
        ]);

        // Get all fees for this student with detailed breakdown
        $fees = StudentFee::where('student_id', $student->id)
            ->with(['feeItems.feeItem.category'])
            ->orderBy('school_year', 'desc')
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'school_year' => $fee->school_year,
                    'total_amount' => (float) $fee->total_amount,
                    'grant_discount' => (float) $fee->grant_discount,
                    'total_paid' => (float) $fee->total_paid,
                    'balance' => (float) $fee->balance,
                    'status' => $fee->is_fully_paid ? 'paid' : ($fee->is_overdue ? 'overdue' : 'pending'),
                    'is_overdue' => $fee->is_overdue,
                    'due_date' => $fee->due_date,
                    'items' => $fee->feeItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->feeItem->name ?? 'Fee',
                            'category' => $item->feeItem->category->name ?? 'Other',
                            'amount' => (float) $item->amount,
                            'is_optional' => $item->feeItem->is_optional ?? false,
                        ];
                    }),
                ];
            });

        // Get all payments
        $payments = StudentPayment::where('student_id', $student->id)
            ->with(['recordedBy'])
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date,
                    'or_number' => $payment->or_number,
                    'amount' => (float) $payment->amount,
                    'payment_for' => $payment->payment_for,
                    'notes' => $payment->notes,
                    'recorded_by' => $payment->recordedBy?->name,
                    'created_at' => $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        // Get promissory notes
        $promissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
            ->with(['studentFee', 'reviewer'])
            ->orderBy('submitted_date', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'student_fee_id' => $note->student_fee_id,
                    'submitted_date' => $note->submitted_date->format('Y-m-d'),
                    'due_date' => $note->due_date->format('Y-m-d'),
                    'amount' => (float) $note->amount,
                    'reason' => $note->reason,
                    'status' => $note->status,
                    'school_year' => $note->studentFee?->school_year,
                    'reviewed_by' => $note->reviewer?->name,
                    'reviewed_at' => $note->reviewed_at?->format('Y-m-d H:i'),
                    'review_notes' => $note->review_notes,
                ];
            });

        // Calculate summary stats
        $summary = [
            'total_fees' => $fees->sum('total_amount'),
            'total_discount' => $fees->sum('grant_discount'),
            'total_paid' => $payments->sum('amount'),
            'total_balance' => $fees->sum('balance'),
        ];

        // Get grants/scholarships for this student
        $grants = \App\Models\GrantRecipient::where('student_id', $student->id)
            ->with('grant')
            ->get()
            ->map(function ($recipient) {
                return [
                    'id' => $recipient->id,
                    'name' => $recipient->grant->name,
                    'amount' => (float) $recipient->amount,
                    'school_year' => $recipient->school_year,
                    'status' => $recipient->status,
                ];
            });

        return Inertia::render('accounting/payments/process', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'email' => $student->email,
                'program' => $student->program?->name,
                'year_level' => $student->yearLevel?->name,
                'section' => $student->section?->name,
            ],
            'fees' => $fees,
            'payments' => $payments,
            'promissoryNotes' => $promissoryNotes,
            'grants' => $grants,
            'summary' => $summary,
        ]);
    }
}
