<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\StudentDocument;
use App\Models\Requirement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentDocument::with([
            'student:id,name,student_id,program,year_level',
            'requirement:id,name,requirement_category_id',
            'requirement.category:id,name',
            'reviewer:id,name'
        ]);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Requirement filter
        if ($request->filled('requirement') && $request->input('requirement') !== 'all') {
            $query->where('requirement_id', $request->input('requirement'));
        }

        $documents = $query->latest('submitted_at')->paginate(15)->withQueryString();

        // Get all requirements for filter dropdown
        $requirements = Requirement::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Get statistics
        $stats = [
            'total' => StudentDocument::count(),
            'pending' => StudentDocument::pending()->count(),
            'approved' => StudentDocument::approved()->count(),
            'rejected' => StudentDocument::rejected()->count(),
        ];

        return Inertia::render('registrar/documents/requests', [
            'documents' => $documents,
            'requirements' => $requirements,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'requirement']),
        ]);
    }

    public function approve(Request $request, StudentDocument $document)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $document->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'reviewer_notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Document approved successfully.');
    }

    public function reject(Request $request, StudentDocument $document)
    {
        $validated = $request->validate([
            'notes' => 'required|string|max:500',
        ]);

        $document->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'reviewer_notes' => $validated['notes'],
        ]);

        return redirect()->back()->with('success', 'Document rejected. Student will be notified.');
    }

    public function destroy(StudentDocument $document)
    {
        // Delete the file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }
}
