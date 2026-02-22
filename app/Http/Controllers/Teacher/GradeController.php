<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        // Advisory section IDs for this teacher
        $advisorySectionIds = Section::where('teacher_id', $teacher?->id)
            ->where('is_active', true)
            ->pluck('id')
            ->toArray();

        // Teaching subjects dept/year_level combos
        $teachingSubjects = Subject::whereHas('teachers', fn ($q) => $q->where('teachers.id', $teacher?->id))
            ->where('is_active', true)
            ->get(['department_id', 'year_level_id']);

        // Base scoped student query
        $base = Student::query()
            ->where(function ($q) use ($advisorySectionIds, $teachingSubjects) {
                if (!empty($advisorySectionIds)) {
                    $q->orWhereIn('section_id', $advisorySectionIds);
                }
                foreach ($teachingSubjects as $subject) {
                    $q->orWhere(function ($inner) use ($subject) {
                        $inner->where('department_id', $subject->department_id);
                        if ($subject->year_level_id) {
                            $inner->where('year_level_id', $subject->year_level_id);
                        }
                    });
                }
            });

        // Fallback if no assignments yet
        $hasAssignments = !empty($advisorySectionIds) || $teachingSubjects->isNotEmpty();
        if (!$hasAssignments && $teacher?->department_id) {
            $base = Student::query()->where('department_id', $teacher->department_id);
        }

        $query = clone $base;

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        if ($request->filled('section') && $request->section !== 'all') {
            $query->where('section', $request->section);
        }

        $students = $query->orderBy('last_name')->paginate(25)->withQueryString();

        // Sections scoped to this teacher's pool
        $sectionNames = (clone $base)->select('section')
            ->whereNotNull('section')
            ->where('section', '!=', '')
            ->distinct()
            ->orderBy('section')
            ->pluck('section')
            ->map(fn ($name) => ['id' => $name, 'name' => $name]);

        return Inertia::render('teacher/grades/index', [
            'students' => $students,
            'sections' => $sectionNames,
            'filters'  => [
                'search'  => $request->search,
                'section' => $request->section,
            ],
        ]);
    }
}
