<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Department;
use App\Models\Program;
use App\Models\Teacher;
use App\Models\YearLevel;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with([
            'departments:id,name,classification',
            'programs:id,name',
            'yearLevels:id,name',
            'assignedSections:id,name',
            'teachers:id,first_name,last_name,photo_url,department_id',
        ]);

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

        // Department filter (now via pivot)
        if ($request->filled('department_id') && $request->input('department_id') !== 'all') {
            $deptId = $request->input('department_id');
            $query->where(function ($q) use ($deptId) {
                $q->whereHas('departments', fn($d) => $d->where('departments.id', $deptId))
                  ->orWhere('department_id', $deptId);
            });
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

        $programs = Program::where('is_active', true)
            ->select('id', 'name', 'department_id')
            ->orderBy('name')
            ->get();

        $yearLevels = YearLevel::where('is_active', true)
            ->with('department:id,name,classification')
            ->select('id', 'name', 'level_number', 'department_id', 'classification')
            ->get();

        $sections = Section::where('is_active', true)
            ->with('department:id,name', 'yearLevel:id,name')
            ->select('id', 'name', 'department_id', 'year_level_id')
            ->orderBy('name')
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
            'programs'    => $programs,
            'yearLevels'  => $yearLevels,
            'sections'    => $sections,
            'teachers'    => $teachers,
            'filters'     => $request->only(['search', 'classification', 'department_id', 'type', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'classification' => 'required|in:K-12,College',
            'units' => 'nullable|numeric|min:0|max:10',
            'hours_per_week' => 'nullable|integer|min:1|max:40',
            'type' => 'required|in:core,major,elective,general',
            'semester' => 'nullable|in:1,2,summer,q1,q2,q3,q4',
            'is_active' => 'boolean',
            'department_ids' => 'nullable|array',
            'department_ids.*' => 'exists:departments,id',
            'program_ids' => 'nullable|array',
            'program_ids.*' => 'exists:programs,id',
            'year_level_ids' => 'nullable|array',
            'year_level_ids.*' => 'exists:year_levels,id',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'exists:sections,id',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);

        // Convert empty semester to null
        if (empty($validated['semester'])) {
            $validated['semester'] = null;
        }

        $subjectData = collect($validated)->except([
            'department_ids', 'program_ids', 'year_level_ids', 'section_ids', 'prerequisites',
        ])->toArray();

        // Keep legacy department_id as first selected department for backward compat
        $subjectData['department_id'] = !empty($validated['department_ids']) 
            ? $validated['department_ids'][0] 
            : null;

        $subject = Subject::create($subjectData);

        // Sync pivot relationships
        $subject->departments()->sync($validated['department_ids'] ?? []);
        $subject->programs()->sync($validated['program_ids'] ?? []);
        $subject->yearLevels()->sync($validated['year_level_ids'] ?? []);
        $subject->assignedSections()->sync($validated['section_ids'] ?? []);

        if (!empty($validated['prerequisites'])) {
            $subject->prerequisites()->attach($validated['prerequisites']);
        }

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'classification' => 'required|in:K-12,College',
            'units' => 'nullable|numeric|min:0|max:10',
            'hours_per_week' => 'nullable|integer|min:1|max:40',
            'type' => 'required|in:core,major,elective,general',
            'semester' => 'nullable|in:1,2,summer,q1,q2,q3,q4',
            'is_active' => 'boolean',
            'department_ids' => 'nullable|array',
            'department_ids.*' => 'exists:departments,id',
            'program_ids' => 'nullable|array',
            'program_ids.*' => 'exists:programs,id',
            'year_level_ids' => 'nullable|array',
            'year_level_ids.*' => 'exists:year_levels,id',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'exists:sections,id',
            'prerequisites' => 'nullable|array',
            'prerequisites.*' => 'exists:subjects,id',
        ]);

        // Convert empty semester to null
        if (empty($validated['semester'])) {
            $validated['semester'] = null;
        }

        $subjectData = collect($validated)->except([
            'department_ids', 'program_ids', 'year_level_ids', 'section_ids', 'prerequisites',
        ])->toArray();

        // Keep legacy department_id as first selected department for backward compat
        $subjectData['department_id'] = !empty($validated['department_ids']) 
            ? $validated['department_ids'][0] 
            : null;

        $subject->update($subjectData);

        // Sync pivot relationships
        $subject->departments()->sync($validated['department_ids'] ?? []);
        $subject->programs()->sync($validated['program_ids'] ?? []);
        $subject->yearLevels()->sync($validated['year_level_ids'] ?? []);
        $subject->assignedSections()->sync($validated['section_ids'] ?? []);

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
