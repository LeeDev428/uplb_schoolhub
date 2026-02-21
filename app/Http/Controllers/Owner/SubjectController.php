<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Department;
use App\Models\Teacher;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with(['department', 'yearLevel', 'teachers:id,first_name,last_name,photo_url,department_id']);

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
            ->select('id', 'name', 'level_number', 'department_id')
            ->get();

        $teachers = Teacher::where('is_active', true)
            ->with('department:id,name,classification')
            ->select('id', 'first_name', 'last_name', 'photo_url', 'department_id', 'specialization')
            ->orderBy('last_name')
            ->get()
            ->map(fn ($t) => [
                'id'             => $t->id,
                'full_name'      => "{$t->first_name} {$t->last_name}",
                'photo_url'      => $t->photo_url,
                'department_id'  => $t->department_id,
                'department'     => $t->department?->name,
                'specialization' => $t->specialization,
            ]);

        return Inertia::render('owner/subjects/index', [
            'subjects'    => $subjects,
            'departments' => $departments,
            'yearLevels'  => $yearLevels,
            'teachers'    => $teachers,
            'filters'     => $request->only(['search', 'classification', 'department_id', 'type', 'status']),
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
            'semester' => 'nullable|in:1,2,summer,q1,q2,q3,q4',
            'is_active' => 'boolean',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);

        // Convert empty year_level_id to null
        if (empty($validated['year_level_id'])) {
            $validated['year_level_id'] = null;
        }

        // Convert empty semester to null
        if (empty($validated['semester'])) {
            $validated['semester'] = null;
        }

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
            'semester' => 'nullable|in:1,2,summer,q1,q2,q3,q4',
            'is_active' => 'boolean',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);

        // Convert empty year_level_id to null
        if (empty($validated['year_level_id'])) {
            $validated['year_level_id'] = null;
        }

        // Convert empty semester to null
        if (empty($validated['semester'])) {
            $validated['semester'] = null;
        }

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

    /**
     * Assign / sync teachers to a subject.
     */
    public function assignTeachers(Request $request, Subject $subject)
    {
        $request->validate([
            'teacher_ids'   => 'array',
            'teacher_ids.*' => 'exists:teachers,id',
        ]);

        $subject->teachers()->sync($request->input('teacher_ids', []));

        return redirect()->back()->with('success', 'Teachers assigned successfully.');
    }
}
