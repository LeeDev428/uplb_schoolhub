<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\GuidanceRecord;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index(Request $request)
    {
        $query = GuidanceRecord::with(['student:id,first_name,last_name,lrn', 'counselor:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('lrn', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('record_type') && $request->record_type !== 'all') {
            $query->where('record_type', $request->record_type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('severity') && $request->severity !== 'all') {
            $query->where('severity', $request->severity);
        }

        $records = $query->latest()->paginate(25)->withQueryString();

        $students = Student::orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'lrn']);

        return Inertia::render('guidance/records/index', [
            'records' => $records,
            'students' => $students,
            'filters' => [
                'search' => $request->search,
                'record_type' => $request->record_type,
                'status' => $request->status,
                'severity' => $request->severity,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'record_type' => 'required|in:counseling,behavior,case,referral,other',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'action_taken' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'severity' => 'required|in:low,medium,high,critical',
            'status' => 'required|in:open,in-progress,resolved,closed',
            'incident_date' => 'nullable|date',
            'follow_up_date' => 'nullable|date',
            'is_confidential' => 'boolean',
        ]);

        $validated['counselor_id'] = $request->user()->id;

        GuidanceRecord::create($validated);

        return back()->with('success', 'Record created successfully.');
    }

    public function update(Request $request, GuidanceRecord $record)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'record_type' => 'required|in:counseling,behavior,case,referral,other',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'action_taken' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'severity' => 'required|in:low,medium,high,critical',
            'status' => 'required|in:open,in-progress,resolved,closed',
            'incident_date' => 'nullable|date',
            'follow_up_date' => 'nullable|date',
            'is_confidential' => 'boolean',
        ]);

        $record->update($validated);

        return back()->with('success', 'Record updated successfully.');
    }

    public function destroy(GuidanceRecord $record)
    {
        $record->delete();

        return back()->with('success', 'Record deleted successfully.');
    }
}
