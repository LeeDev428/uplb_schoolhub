<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\DocumentFeeItem;
use App\Models\DocumentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    /**
     * Display a listing of the student's document requests.
     */
    public function index(): Response
    {
        $student = auth()->user()->student;

        $requests = DocumentRequest::where('student_id', $student->id)
            ->with(['documentFeeItem', 'registrarApprovedBy', 'accountingApprovedBy'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'document_type' => $request->document_type,
                    'document_type_label' => $request->document_type_label,
                    'copies' => $request->copies,
                    'purpose' => $request->purpose,
                    'status' => $request->status,
                    'fee' => $request->fee,
                    'total_fee' => $request->total_fee,
                    'is_paid' => $request->is_paid,
                    'processing_type' => $request->processing_type,
                    'processing_days' => $request->processing_days,
                    'receipt_file_path' => $request->receipt_file_path,
                    'receipt_number' => $request->receipt_number,
                    'registrar_status' => $request->registrar_status,
                    'registrar_remarks' => $request->registrar_remarks,
                    'accounting_status' => $request->accounting_status,
                    'accounting_remarks' => $request->accounting_remarks,
                    'approval_stage' => $request->approval_stage,
                    'expected_completion_date' => $request->expected_completion_date?->format('M d, Y'),
                    'request_date' => $request->request_date?->format('M d, Y'),
                    'release_date' => $request->release_date?->format('M d, Y'),
                    'created_at' => $request->created_at->format('M d, Y h:i A'),
                ];
            });

        // Get available document fees grouped by category
        $documentFees = DocumentFeeItem::active()
            ->orderBy('category')
            ->orderBy('processing_type')
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'category' => $fee->category,
                    'name' => $fee->name,
                    'price' => $fee->price,
                    'processing_days' => $fee->processing_days,
                    'processing_type' => $fee->processing_type,
                    'description' => $fee->description,
                ];
            });

        // Group by category for easier display
        $feesByCategory = $documentFees->groupBy('category');

        return Inertia::render('student/document-requests/index', [
            'requests' => $requests,
            'documentFees' => $documentFees,
            'feesByCategory' => $feesByCategory,
            'documentTypes' => DocumentRequest::DOCUMENT_TYPES,
        ]);
    }

    /**
     * Store a new document request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_fee_item_id' => 'required|exists:document_fee_items,id',
            'copies' => 'required|integer|min:1|max:10',
            'purpose' => 'required|string|max:500',
            'receipt_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
            'receipt_number' => 'required|string|max:100',
        ]);

        $student = auth()->user()->student;
        $feeItem = DocumentFeeItem::findOrFail($validated['document_fee_item_id']);

        // Upload receipt file
        $receiptPath = $request->file('receipt_file')->store('document-receipts', 'public');

        DocumentRequest::create([
            'student_id' => $student->id,
            'document_fee_item_id' => $feeItem->id,
            'document_type' => strtolower(str_replace(' ', '_', $feeItem->category)),
            'copies' => $validated['copies'],
            'purpose' => $validated['purpose'],
            'status' => 'pending',
            'fee' => $feeItem->price,
            'is_paid' => false,
            'processing_type' => $feeItem->processing_type,
            'processing_days' => $feeItem->processing_days,
            'receipt_file_path' => $receiptPath,
            'receipt_number' => $validated['receipt_number'],
            'request_date' => now(),
            'registrar_status' => 'pending',
            'accounting_status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Document request submitted successfully. Please wait for approval.');
    }

    /**
     * Display the history of completed document requests.
     */
    public function history(): Response
    {
        $student = auth()->user()->student;

        $completedRequests = DocumentRequest::where('student_id', $student->id)
            ->whereIn('status', ['released', 'cancelled'])
            ->with(['documentFeeItem'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'document_type' => $request->document_type,
                    'document_type_label' => $request->document_type_label,
                    'copies' => $request->copies,
                    'purpose' => $request->purpose,
                    'status' => $request->status,
                    'fee' => $request->fee,
                    'total_fee' => $request->total_fee,
                    'processing_type' => $request->processing_type,
                    'request_date' => $request->request_date?->format('M d, Y'),
                    'release_date' => $request->release_date?->format('M d, Y'),
                    'remarks' => $request->remarks,
                ];
            });

        return Inertia::render('student/document-requests/history', [
            'completedRequests' => $completedRequests,
        ]);
    }

    /**
     * Cancel a pending document request.
     */
    public function cancel(DocumentRequest $documentRequest): RedirectResponse
    {
        $student = auth()->user()->student;

        // Ensure the request belongs to this student
        if ($documentRequest->student_id !== $student->id) {
            abort(403);
        }

        // Can only cancel if still pending
        if ($documentRequest->status !== 'pending' || $documentRequest->registrar_status !== 'pending') {
            return redirect()->back()->with('error', 'Cannot cancel this request as it has already been processed.');
        }

        $documentRequest->cancel('Cancelled by student');

        return redirect()->back()->with('success', 'Document request cancelled successfully.');
    }
}
