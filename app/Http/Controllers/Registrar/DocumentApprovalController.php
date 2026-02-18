<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\DocumentFeeItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentApprovalController extends Controller
{
    /**
     * Display document requests awaiting registrar approval.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'pending');
        
        $query = DocumentRequest::with([
            'student:id,first_name,last_name,lrn,program,year_level',
            'documentFeeItem:id,name,category,price,processing_days',
        ]);

        // Apply tab filter
        if ($tab === 'pending') {
            $query->where('registrar_status', 'pending');
        } elseif ($tab === 'approved') {
            $query->where('registrar_status', 'approved');
        } elseif ($tab === 'rejected') {
            $query->where('registrar_status', 'rejected');
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

        $requests = $query->latest('created_at')->paginate(20)->withQueryString();

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
                ] : null,
                'copies' => $request->copies,
                'purpose' => $request->purpose,
                'processing_type' => $request->processing_type,
                'fee' => $request->fee,
                'total_fee' => $request->total_fee,
                'receipt_number' => $request->receipt_number,
                'receipt_file_path' => $request->receipt_file_path,
                'registrar_status' => $request->registrar_status,
                'registrar_remarks' => $request->registrar_remarks,
                'registrar_approved_at' => $request->registrar_approved_at?->format('M d, Y H:i'),
                'accounting_status' => $request->accounting_status,
                'status' => $request->status,
                'request_date' => $request->request_date?->format('M d, Y'),
                'created_at' => $request->created_at->format('M d, Y H:i'),
            ];
        });

        // Stats
        $stats = [
            'pending' => DocumentRequest::where('registrar_status', 'pending')->count(),
            'approved' => DocumentRequest::where('registrar_status', 'approved')->count(),
            'rejected' => DocumentRequest::where('registrar_status', 'rejected')->count(),
        ];

        // Get document types for filter
        $documentTypes = DocumentRequest::DOCUMENT_TYPES;

        return Inertia::render('registrar/document-approvals/index', [
            'requests' => $requests,
            'stats' => $stats,
            'documentTypes' => $documentTypes,
            'tab' => $tab,
            'filters' => $request->only(['search', 'document_type']),
        ]);
    }

    /**
     * Approve a document request.
     */
    public function approve(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $documentRequest->approveByRegistrar(auth()->id(), $validated['remarks'] ?? null);

        return redirect()->back()->with('success', 'Document request approved. Forwarded to Accounting.');
    }

    /**
     * Reject a document request.
     */
    public function reject(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'required|string|max:500',
        ]);

        $documentRequest->rejectByRegistrar(auth()->id(), $validated['remarks']);

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
