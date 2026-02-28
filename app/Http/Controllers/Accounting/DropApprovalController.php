<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\DropRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DropApprovalController extends Controller
{
    /**
     * Display drop requests awaiting accounting approval.
     * Only shows requests that have been approved by registrar.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'pending');

        $query = DropRequest::with([
            'student:id,first_name,last_name,middle_name,suffix,lrn,email,program,year_level,section,student_photo_url,enrollment_status,department_id',
            'student.department:id,name,classification',
            'registrarApprovedBy:id,name',
            'accountingApprovedBy:id,name',
            'feeItems',
        ])
        ->where('registrar_status', 'approved'); // Only show registrar-approved

        // Filter by accounting status
        if ($tab && $tab !== 'all') {
            $query->where('accounting_status', $tab);
        }

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $requests = $query->latest()->paginate(20)->withQueryString();

        $requests->getCollection()->transform(function ($r) {
            return [
                'id' => $r->id,
                'reason' => $r->reason,
                'status' => $r->status,
                'registrar_status' => $r->registrar_status,
                'accounting_status' => $r->accounting_status,
                'semester' => $r->semester,
                'school_year' => $r->school_year,
                'registrar_remarks' => $r->registrar_remarks,
                'accounting_remarks' => $r->accounting_remarks,
                'fee_amount' => (float) $r->fee_amount,
                'is_paid' => $r->is_paid,
                'or_number' => $r->or_number,
                'registrar_approved_by' => $r->registrarApprovedBy ? [
                    'id' => $r->registrarApprovedBy->id,
                    'name' => $r->registrarApprovedBy->name,
                ] : null,
                'registrar_approved_at' => $r->registrar_approved_at?->format('M d, Y h:i A'),
                'accounting_approved_by' => $r->accountingApprovedBy ? [
                    'id' => $r->accountingApprovedBy->id,
                    'name' => $r->accountingApprovedBy->name,
                ] : null,
                'accounting_approved_at' => $r->accounting_approved_at?->format('M d, Y h:i A'),
                'created_at' => $r->created_at->format('M d, Y h:i A'),
                'fee_items' => $r->feeItems->map(fn($fi) => [
                    'id' => $fi->id,
                    'name' => $fi->name,
                    'amount' => (float) $fi->pivot->amount,
                ]),
                'student' => $r->student ? [
                    'id' => $r->student->id,
                    'full_name' => $r->student->full_name,
                    'lrn' => $r->student->lrn,
                    'email' => $r->student->email,
                    'program' => $r->student->program,
                    'year_level' => $r->student->year_level,
                    'section' => $r->student->section,
                    'student_photo_url' => $r->student->student_photo_url,
                    'enrollment_status' => $r->student->enrollment_status,
                    'classification' => $r->student->department?->classification,
                ] : null,
            ];
        });

        // Stats (only from registrar-approved requests)
        $stats = [
            'pending' => DropRequest::where('registrar_status', 'approved')->where('accounting_status', 'pending')->count(),
            'approved' => DropRequest::where('registrar_status', 'approved')->where('accounting_status', 'approved')->count(),
            'rejected' => DropRequest::where('registrar_status', 'approved')->where('accounting_status', 'rejected')->count(),
        ];

        return Inertia::render($this->viewPrefix() . '/drop-approvals/index', [
            'requests' => $requests,
            'stats' => $stats,
            'tab' => $tab,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Approve a drop request (accounting stage - final approval).
     */
    public function approve(Request $request, DropRequest $dropRequest): RedirectResponse
    {
        if ($dropRequest->registrar_status !== 'approved') {
            return back()->with('error', 'This request has not been approved by the registrar yet.');
        }

        if ($dropRequest->accounting_status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        $validated = $request->validate([
            'accounting_remarks' => 'nullable|string|max:1000',
            'or_number' => 'nullable|string|max:100',
        ]);

        $dropRequest->approveByAccounting(
            Auth::id(),
            $validated['accounting_remarks'] ?? null,
            $validated['or_number'] ?? null,
        );

        return back()->with('success', 'Drop request approved. Student has been marked as dropped and deactivated.');
    }

    /**
     * Reject a drop request (accounting stage).
     */
    public function reject(Request $request, DropRequest $dropRequest): RedirectResponse
    {
        if ($dropRequest->registrar_status !== 'approved') {
            return back()->with('error', 'This request has not been approved by the registrar yet.');
        }

        if ($dropRequest->accounting_status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $validated = $request->validate([
            'accounting_remarks' => 'required|string|max:1000',
        ]);

        $dropRequest->rejectByAccounting(
            Auth::id(),
            $validated['accounting_remarks']
        );

        return back()->with('success', 'Drop request rejected.');
    }
}
