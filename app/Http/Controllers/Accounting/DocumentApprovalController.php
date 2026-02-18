<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentApprovalController extends Controller
{
    /**
     * Display document requests awaiting accounting approval.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'pending');
        
        $query = DocumentRequest::with([
            'student:id,first_name,last_name,lrn,program,year_level',
            'documentFeeItem:id,name,category,price,processing_days',
            'registrarApprovedBy:id,name',
        ]);

        // Only show requests that have been approved by registrar
        $query->where('registrar_status', 'approved');

        // Apply tab filter
        if ($tab === 'pending') {
            $query->where('accounting_status', 'pending');
        } elseif ($tab === 'approved') {
            $query->where('accounting_status', 'approved');
        } elseif ($tab === 'rejected') {
            $query->where('accounting_status', 'rejected');
        }

        // Search filter
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Document type filter
        if ($documentType = $request->input('document_type')) {
            $query->where('document_type', $documentType);
        }

        $requests = $query->latest('registrar_approved_at')->paginate(20)->withQueryString();

        // Transform for frontend
        $requests->through(function ($request) {
            return [
                'id' => $request->id,
                'student' => [
                    'id' => $request->student->id,
                    'full_name' => $request->student->full_name,
                    'lrn' => $request->student->lrn,
                    'program' => $request->student->program,
                    'year_level' => $request->student->year_level,
                ],
                'document_type' => $request->document_type,
                'document_type_label' => $request->document_type_label,
                'document_fee_item' => $request->documentFeeItem ? [
                    'name' => $request->documentFeeItem->name,
                    'category' => $request->documentFeeItem->category,
                    'price' => $request->documentFeeItem->price,
                    'processing_days' => $request->documentFeeItem->processing_days,
                ] : null,
                'copies' => $request->copies,
                'purpose' => $request->purpose,
                'processing_type' => $request->processing_type,
                'processing_days' => $request->processing_days,
                'fee' => $request->fee,
                'total_fee' => $request->total_fee,
                'receipt_number' => $request->receipt_number,
                'receipt_file_path' => $request->receipt_file_path,
                'is_paid' => $request->is_paid,
                'or_number' => $request->or_number,
                'registrar_status' => $request->registrar_status,
                'registrar_remarks' => $request->registrar_remarks,
                'registrar_approved_at' => $request->registrar_approved_at?->format('M d, Y H:i'),
                'registrar_approved_by' => $request->registrarApprovedBy ? [
                    'name' => $request->registrarApprovedBy->name,
                ] : null,
                'accounting_status' => $request->accounting_status,
                'accounting_remarks' => $request->accounting_remarks,
                'accounting_approved_at' => $request->accounting_approved_at?->format('M d, Y H:i'),
                'status' => $request->status,
                'expected_completion_date' => $request->expected_completion_date?->format('M d, Y'),
                'request_date' => $request->request_date?->format('M d, Y'),
                'created_at' => $request->created_at->format('M d, Y H:i'),
            ];
        });

        // Stats - only for registrar-approved requests
        $stats = [
            'pending' => DocumentRequest::where('registrar_status', 'approved')
                ->where('accounting_status', 'pending')->count(),
            'approved' => DocumentRequest::where('registrar_status', 'approved')
                ->where('accounting_status', 'approved')->count(),
            'rejected' => DocumentRequest::where('registrar_status', 'approved')
                ->where('accounting_status', 'rejected')->count(),
        ];

        // Get document types for filter
        $documentTypes = DocumentRequest::DOCUMENT_TYPES;

        return Inertia::render('accounting/document-approvals/index', [
            'requests' => $requests,
            'stats' => $stats,
            'documentTypes' => $documentTypes,
            'tab' => $tab,
            'filters' => $request->only(['search', 'document_type']),
        ]);
    }

    /**
     * Approve a document request (verify payment).
     */
    public function approve(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'or_number' => 'nullable|string|max:50',
            'remarks' => 'nullable|string|max:500',
        ]);

        // Mark as paid if OR number provided
        if (!empty($validated['or_number'])) {
            $documentRequest->update([
                'is_paid' => true,
                'or_number' => $validated['or_number'],
            ]);
        }

        $documentRequest->approveByAccounting(auth()->id(), $validated['remarks'] ?? null);

        return redirect()->back()->with('success', 'Document request approved. Processing will begin.');
    }

    /**
     * Reject a document request.
     */
    public function reject(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $documentRequest->rejectByAccounting(auth()->id(), $validated['remarks']);

        return redirect()->back()->with('success', 'Document request rejected.');
    }

    /**
     * View receipt file.
     */
    public function viewReceipt(DocumentRequest $documentRequest)
    {
        if (!$documentRequest->receipt_file_path) {
            abort(404, 'Receipt not found');
        }

        $path = storage_path('app/public/' . $documentRequest->receipt_file_path);
        
        if (!file_exists($path)) {
            abort(404, 'Receipt file not found');
        }

        return response()->file($path);
    }
}
