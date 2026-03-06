<?php

namespace App\Http\Controllers;

use App\Models\EnrollmentClearance;
use App\Models\StudentRequirement;
use App\Models\StudentActionLog;
use Illuminate\Http\Request;

class StudentRequirementController extends Controller
{
    /**
     * Update student requirement status
     */
    public function updateStatus(Request $request, StudentRequirement $studentRequirement)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,submitted,approved,rejected,overdue',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $studentRequirement->status;
        $newStatus = $validated['status'];

        if ($validated['status'] === 'approved') {
            $validated['approved_at'] = now();
            $validated['approved_by'] = auth()->id();
        } elseif ($validated['status'] === 'submitted' && !$studentRequirement->submitted_at) {
            $validated['submitted_at'] = now();
        }

        $studentRequirement->update($validated);

        // Recalculate requirements completion and sync enrollment clearance
        $student = $studentRequirement->student;
        if ($student) {
            $total    = $student->requirements()->count();
            $approved = $student->requirements()->where('status', 'approved')->count();
            $percentage = $total > 0 ? (int) round(($approved / $total) * 100) : 0;

            // firstOrCreate ensures we always have a clearance row to update,
            // even if the student hasn't visited their show page yet.
            if (!$student->user) return;
            $clearance = EnrollmentClearance::firstOrCreate(['user_id' => $student->user->id]);
            $clearanceUpdate = [
                'requirements_complete_percentage' => $percentage,
                'requirements_complete'            => $percentage >= 100,
            ];
            // Stamp completion timestamp when it first reaches 100%
            if ($percentage >= 100 && !$clearance->requirements_complete) {
                $clearanceUpdate['requirements_completed_at'] = now();
                $clearanceUpdate['requirements_completed_by'] = auth()->id();
            }
            $clearance->update($clearanceUpdate);

            // Auto-enroll student if all four clearance steps are now complete
            if ($clearance->fresh()->isFullyCleared()) {
                $clearance->update(['enrollment_status' => 'completed']);
                $student->update(['enrollment_status' => 'enrolled']);
            }
        }

        // Create action log
        StudentActionLog::log(
            studentId: $studentRequirement->student_id,
            action: 'Requirements updated',
            actionType: 'requirements_updated',
            details: "Updated {$studentRequirement->requirement->name}",
            notes: $validated['notes'] ?? null,
            changes: [
                'requirement' => $studentRequirement->requirement->name,
                'status' => ['old' => $oldStatus, 'new' => $newStatus]
            ],
            performedBy: auth()->id()
        );

        return back()->with('success', 'Requirement status updated successfully');
    }

    /**
     * Upload file for requirement
     */
    public function uploadFile(Request $request, StudentRequirement $studentRequirement)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
        ]);

        $path = $request->file('file')->store('requirements', 'public');

        $studentRequirement->update([
            'file_path' => $path,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return back()->with('success', 'File uploaded successfully');
    }
}
