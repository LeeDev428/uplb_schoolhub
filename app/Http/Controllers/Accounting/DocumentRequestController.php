<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    /**
     * Display a listing of document requests.
     */
    public function index(Request $request): Response
    {
        $query = DocumentRequest::with(['student', 'processedBy', 'releasedBy']);

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by document type
        if ($documentType = $request->input('document_type')) {
            $query->where('document_type', $documentType);
        }

        // Filter by payment status
        if ($request->input('is_paid') !== null) {
            $query->where('is_paid', $request->boolean('is_paid'));
        }

        // Filter by date range
        if ($from = $request->input('from')) {
            $query->whereDate('request_date', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('request_date', '<=', $to);
        }

        $requests = $query->latest()->paginate(20)->withQueryString();

        // Get students for creating requests
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

        // Stats
        $stats = [
            'pending' => DocumentRequest::pending()->count(),
            'processing' => DocumentRequest::processing()->count(),
            'ready' => DocumentRequest::ready()->count(),
            'unpaid' => DocumentRequest::unpaid()->count(),
        ];

        return Inertia::render('accounting/document-requests/index', [
            'requests' => $requests,
            'students' => $students,
            'documentTypes' => DocumentRequest::DOCUMENT_TYPES,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'document_type', 'is_paid', 'from', 'to']),
        ]);
    }

    /**
     * Store a new document request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'document_type' => 'required|string',
            'copies' => 'required|integer|min:1',
            'purpose' => 'nullable|string',
            'fee' => 'required|numeric|min:0',
            'request_date' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        DocumentRequest::create($validated);

        return redirect()->back()->with('success', 'Document request created successfully.');
    }

    /**
     * Update a document request.
     */
    public function update(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'document_type' => 'sometimes|required|string',
            'copies' => 'sometimes|required|integer|min:1',
            'purpose' => 'nullable|string',
            'fee' => 'sometimes|required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $documentRequest->update($validated);

        return redirect()->back()->with('success', 'Document request updated successfully.');
    }

    /**
     * Mark a request as paid.
     */
    public function markPaid(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'or_number' => 'required|string|max:50',
        ]);

        $documentRequest->markAsPaid($validated['or_number']);

        return redirect()->back()->with('success', 'Document request marked as paid.');
    }

    /**
     * Process a request.
     */
    public function process(DocumentRequest $documentRequest): RedirectResponse
    {
        $documentRequest->process(auth()->id());

        return redirect()->back()->with('success', 'Document request is now being processed.');
    }

    /**
     * Mark a request as ready.
     */
    public function markReady(DocumentRequest $documentRequest): RedirectResponse
    {
        $documentRequest->markReady();

        return redirect()->back()->with('success', 'Document request is ready for release.');
    }

    /**
     * Release a document.
     */
    public function release(DocumentRequest $documentRequest): RedirectResponse
    {
        if (!$documentRequest->is_paid) {
            return redirect()->back()->with('error', 'Cannot release document. Payment not yet received.');
        }

        $documentRequest->release(auth()->id());

        return redirect()->back()->with('success', 'Document released successfully.');
    }

    /**
     * Cancel a request.
     */
    public function cancel(Request $request, DocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string',
        ]);

        $documentRequest->cancel($validated['remarks'] ?? null);

        return redirect()->back()->with('success', 'Document request cancelled.');
    }

    /**
     * Delete a document request.
     */
    public function destroy(DocumentRequest $documentRequest): RedirectResponse
    {
        $documentRequest->delete();

        return redirect()->back()->with('success', 'Document request deleted successfully.');
    }
}
