<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of students associated with the teacher's classes.
     * Shows students from sections where the teacher teaches.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        // Get the teacher's department sections
        $departmentId = $teacher?->department_id;
        
        // Build query for students
        $query = Student::with(['department:id,name,classification'])
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        // Filter by teacher's department
        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Program filter
        if ($request->filled('program') && $request->input('program') !== 'all') {
            $query->where('program', $request->input('program'));
        }

        // Year level filter
        if ($request->filled('year_level') && $request->input('year_level') !== 'all') {
            $query->where('year_level', $request->input('year_level'));
        }

        // Section filter
        if ($request->filled('section') && $request->input('section') !== 'all') {
            $query->where('section', $request->input('section'));
        }

        $students = $query->paginate(20)->withQueryString();

        // Get filter options from students in teacher's department
        $filterQuery = Student::query();
        if ($departmentId) {
            $filterQuery->where('department_id', $departmentId);
        }
        
        $programs = $filterQuery->clone()->select('program')
            ->whereNotNull('program')
            ->where('program', '!=', '')
            ->distinct()
            ->pluck('program')
            ->sort()
            ->values();
            
        $yearLevels = $filterQuery->clone()->select('year_level')
            ->whereNotNull('year_level')
            ->where('year_level', '!=', '')
            ->distinct()
            ->pluck('year_level')
            ->sort()
            ->values();
            
        $sections = $filterQuery->clone()->select('section')
            ->whereNotNull('section')
            ->where('section', '!=', '')
            ->distinct()
            ->pluck('section')
            ->sort()
            ->values();

        // Get stats
        $stats = [
            'total' => $filterQuery->clone()->count(),
            'enrolled' => $filterQuery->clone()->where('enrollment_status', 'enrolled')->count(),
            'programs' => $programs->count(),
            'sections' => $sections->count(),
        ];

        return Inertia::render('teacher/students/index', [
            'students' => $students,
            'programs' => $programs,
            'yearLevels' => $yearLevels,
            'sections' => $sections,
            'stats' => $stats,
            'filters' => $request->only(['search', 'program', 'year_level', 'section']),
            'teacherDepartment' => $teacher?->department?->name ?? 'All Departments',
        ]);
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student)
    {
        $student->load(['department:id,name,classification', 'requirements.requirement']);

        return Inertia::render('teacher/students/show', [
            'student' => $student,
        ]);
    }
}
