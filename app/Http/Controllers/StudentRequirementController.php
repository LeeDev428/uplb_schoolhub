<?php

namespace App\Http\Controllers;

use App\Models\StudentRequirement;
use App\Models\StudentActionLog;
use App\Models\User;
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
            // Block approval if student's email is not yet verified
            $studentUser = User::where('student_id', $studentRequirement->student_id)->first();
            if ($studentUser && !$studentUser->email_verified_at) {
                return back()->withErrors([
                    'error' => 'Cannot approve requirements: the student has not verified their email address yet.',
                ]);
            }

            $validated['approved_at'] = now();
            $validated['approved_by'] = auth()->id();
        } elseif ($validated['status'] === 'submitted' && !$studentRequirement->submitted_at) {
            $validated['submitted_at'] = now();
        }

        $studentRequirement->update($validated);

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
