<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        $query = Subject::with(['department', 'yearLevel', 'teachers:id,first_name,last_name'])
            ->where('is_active', true);

        // Filter by subjects assigned to this teacher via pivot
        if ($teacher) {
            $query->whereHas('teachers', fn($q) => $q->where('teachers.id', $teacher->id));
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        // Classification filter
        if ($request->filled('classification') && $request->input('classification') !== 'all') {
            $query->where('classification', $request->input('classification'));
        }

        $subjects = $query->orderBy('code')->paginate(15)->withQueryString();

        return Inertia::render('teacher/subjects/index', [
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'type', 'classification']),
            'teacherId' => $teacher?->id,
        ]);
    }

    /**
     * Display students enrolled in a specific subject.
     */
    public function students(Subject $subject, Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        // Query students in the same year level/department as the subject
        $query = Student::with(['department:id,name,classification'])
            ->where('department_id', $subject->department_id)
            ->orderBy('last_name')
            ->orderBy('first_name');
        
        // If subject has a year level, filter by it
        if ($subject->year_level_id) {
            $query->where('year_level_id', $subject->year_level_id);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Section filter
        if ($request->filled('section') && $request->input('section') !== 'all') {
            $query->where('section', $request->input('section'));
        }

        $students = $query->paginate(20)->withQueryString();

        // Get sections for filter
        $sections = Student::where('department_id', $subject->department_id)
            ->when($subject->year_level_id, fn($q) => $q->where('year_level_id', $subject->year_level_id))
            ->whereNotNull('section')
            ->where('section', '!=', '')
            ->distinct()
            ->pluck('section')
            ->sort()
            ->values();

        return Inertia::render('teacher/subjects/students', [
            'subject' => $subject->load(['department', 'yearLevel']),
            'students' => $students,
            'sections' => $sections,
            'filters' => $request->only(['search', 'section']),
        ]);
    }
}
