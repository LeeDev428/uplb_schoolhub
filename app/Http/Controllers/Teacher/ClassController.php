<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\Department;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $query = Section::with(['department:id,name,code', 'yearLevel:id,name'])
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }

        $sections = $query->orderBy('name')->paginate(25)->withQueryString();

        $departments = Department::active()->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('teacher/classes/index', [
            'sections' => $sections,
            'departments' => $departments,
            'filters' => [
                'search' => $request->search,
                'department_id' => $request->department_id,
            ],
        ]);
    }

    public function show(Section $section)
    {
        $section->load(['department:id,name,code', 'yearLevel:id,name']);

        $students = Student::where('section', $section->name)
            ->orderBy('last_name')
            ->get();

        return Inertia::render('teacher/classes/show', [
            'section' => $section,
            'students' => $students,
        ]);
    }
}
