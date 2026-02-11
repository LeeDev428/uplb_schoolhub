<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Department;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with(['department', 'yearLevel']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Classification filter
        if ($request->filled('classification') && $request->input('classification') !== 'all') {
            $query->where('classification', $request->input('classification'));
        }

        // Department filter
        if ($request->filled('department_id') && $request->input('department_id') !== 'all') {
            $query->where('department_id', $request->input('department_id'));
        }

        // Type filter
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $isActive = $request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }

        $subjects = $query->latest()->paginate(15)->withQueryString();

        $departments = Department::where('is_active', true)
            ->select('id', 'name', 'classification')
            ->get();

        $yearLevels = YearLevel::where('is_active', true)
            ->with('department:id,name')
            ->select('id', 'name', 'level', 'department_id')
            ->get();

        return Inertia::render('owner/subjects/index', [
            'subjects' => $subjects,
            'departments' => $departments,
            'yearLevels' => $yearLevels,
            'filters' => $request->only(['search', 'classification', 'department_id', 'type', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|max:50|unique:subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'classification' => 'required|in:K-12,College',
            'units' => 'nullable|numeric|min:0|max:10',
            'hours_per_week' => 'nullable|integer|min:1|max:40',
            'type' => 'required|in:core,major,elective,general',
            'year_level_id' => 'nullable|exists:year_levels,id',
            'semester' => 'nullable|in:1,2,summer',
            'is_active' => 'boolean',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);

        $subject = Subject::create($validated);

        // Attach prerequisites if provided
        if (isset($validated['prerequisites'])) {
            $subject->prerequisites()->attach($validated['prerequisites']);
        }

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'classification' => 'required|in:K-12,College',
            'units' => 'nullable|numeric|min:0|max:10',
            'hours_per_week' => 'nullable|integer|min:1|max:40',
            'type' => 'required|in:core,major,elective,general',
            'year_level_id' => 'nullable|exists:year_levels,id',
            'semester' => 'nullable|in:1,2,summer',
            'is_active' => 'boolean',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);

        $subject->update($validated);

        // Sync prerequisites
        if (isset($validated['prerequisites'])) {
            $subject->prerequisites()->sync($validated['prerequisites']);
        } else {
            $subject->prerequisites()->detach();
        }

        return redirect()->back()->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted successfully.');
    }
}
