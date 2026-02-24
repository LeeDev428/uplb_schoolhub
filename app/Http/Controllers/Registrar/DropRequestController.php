<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\DropRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DropRequestController extends Controller
{
    /**
     * Display all drop requests for registrar management.
     */
    public function index(Request $request): Response
    {
        $query = DropRequest::with([
            'student:id,first_name,last_name,middle_name,suffix,lrn,email,program,year_level,section,student_photo_url,enrollment_status',
            'processedBy:id,name',
        ]);

        // Filter by status
        $tab = $request->input('tab', 'pending');
        if ($tab && $tab !== 'all') {
            $query->where('status', $tab);
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
                'semester' => $r->semester,
                'school_year' => $r->school_year,
                'registrar_notes' => $r->registrar_notes,
                'processed_by' => $r->processedBy,
                'processed_at' => $r->processed_at?->format('M d, Y h:i A'),
                'created_at' => $r->created_at->format('M d, Y h:i A'),
                'student' => [
                    'id' => $r->student->id,
                    'full_name' => $r->student->full_name,
                    'lrn' => $r->student->lrn,
                    'email' => $r->student->email,
                    'program' => $r->student->program,
                    'year_level' => $r->student->year_level,
                    'section' => $r->student->section,
                    'student_photo_url' => $r->student->student_photo_url,
                    'enrollment_status' => $r->student->enrollment_status,
                ],
            ];
        });

        // Stats
        $stats = [
            'pending' => DropRequest::where('status', 'pending')->count(),
            'approved' => DropRequest::where('status', 'approved')->count(),
            'rejected' => DropRequest::where('status', 'rejected')->count(),
        ];

        return Inertia::render('registrar/drop-requests/index', [
            'requests' => $requests,
            'stats' => $stats,
            'tab' => $tab,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Approve a drop request.
     */
    public function approve(Request $request, DropRequest $dropRequest): RedirectResponse
    {
        if ($dropRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        $validated = $request->validate([
            'registrar_notes' => 'nullable|string|max:1000',
        ]);

        // Update the drop request
        $dropRequest->update([
            'status' => 'approved',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
            'registrar_notes' => $validated['registrar_notes'] ?? null,
        ]);

        // Update the student's enrollment status and deactivate
        $student = $dropRequest->student;
        $student->update([
            'enrollment_status' => 'dropped',
            'is_active' => false,
        ]);

        return back()->with('success', 'Drop request approved. Student has been marked as dropped and deactivated.');
    }

    /**
     * Reject a drop request.
     */
    public function reject(Request $request, DropRequest $dropRequest): RedirectResponse
    {
        if ($dropRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $validated = $request->validate([
            'registrar_notes' => 'required|string|max:1000',
        ]);

        $dropRequest->update([
            'status' => 'rejected',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
            'registrar_notes' => $validated['registrar_notes'],
        ]);

        return back()->with('success', 'Drop request rejected.');
    }

    /**
     * Reactivate a dropped student.
     */
    public function reactivate(Student $student): RedirectResponse
    {
        if ($student->enrollment_status !== 'dropped') {
            return back()->with('error', 'Only dropped students can be reactivated.');
        }

        $student->update([
            'enrollment_status' => 'not-enrolled', // Reset to not-enrolled so they can enroll again
            'is_active' => true,
        ]);

        return back()->with('success', 'Student has been reactivated and can now log in again.');
    }
}
