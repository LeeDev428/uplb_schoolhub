<?php

namespace App\Http\Controllers;

use App\Models\StudentRequirement;
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

        if ($validated['status'] === 'approved') {
            $validated['approved_at'] = now();
            $validated['approved_by'] = auth()->id();
        } elseif ($validated['status'] === 'submitted' && !$studentRequirement->submitted_at) {
            $validated['submitted_at'] = now();
        }

        $studentRequirement->update($validated);

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
