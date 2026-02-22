<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display students related to this teacher:
     * 1. Students in advisory sections (where teacher_id = this teacher)
     * 2. Students in same dept/year_level as subjects this teacher teaches
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        // Collect all section IDs where teacher is adviser
        $advisorySectionIds = Section::where('teacher_id', $teacher?->id)
            ->where('is_active', true)
            ->pluck('id')
            ->toArray();

        // Collect dept+year_level combos from subject assignments
        $teachingSubjects = Subject::whereHas('teachers', fn ($q) => $q->where('teachers.id', $teacher?->id))
            ->where('is_active', true)
            ->get(['department_id', 'year_level_id']);

        // Build student query scoped to this teacher's student pool
        $query = Student::with(['department:id,name,classification'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->where(function ($q) use ($advisorySectionIds, $teachingSubjects) {
                // Students in advisory sections
                if (!empty($advisorySectionIds)) {
                    $q->orWhereIn('section_id', $advisorySectionIds);
                }
                // Students matching teaching-subject dept/year_level
                foreach ($teachingSubjects as $subject) {
                    $q->orWhere(function ($inner) use ($subject) {
                        $inner->where('department_id', $subject->department_id);
                        if ($subject->year_level_id) {
                            $inner->where('year_level_id', $subject->year_level_id);
                        }
                    });
                }
                // Fallback: if teacher has no assignments yet, show same dept
            });

        // If teacher has no assignments at all, scope by department (graceful fallback)
        $hasAssignments = !empty($advisorySectionIds) || $teachingSubjects->isNotEmpty();
        if (!$hasAssignments && $teacher?->department_id) {
            $query = Student::with(['department:id,name,classification'])
                ->where('department_id', $teacher->department_id)
                ->orderBy('last_name')
                ->orderBy('first_name');
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
            // Class list: all dept students split by gender A-Z
            'classListMale' => (clone $query)
                ->whereRaw("LOWER(gender) = 'male'")
                ->orderBy('last_name')->orderBy('first_name')
                ->get(['id','first_name','last_name','middle_name','suffix','lrn','gender','program','year_level','section','enrollment_status','student_photo_url']),
            'classListFemale' => (clone $query)
                ->whereRaw("LOWER(gender) = 'female'")
                ->orderBy('last_name')->orderBy('first_name')
                ->get(['id','first_name','last_name','middle_name','suffix','lrn','gender','program','year_level','section','enrollment_status','student_photo_url']),
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
