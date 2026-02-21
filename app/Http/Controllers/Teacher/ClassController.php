<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        /**
         * Advisory sections: sections where this teacher is the homeroom/adviser.
         * The teacher was assigned to these via the Registrar > Classes page.
         */
        $advisorySections = Section::where('is_active', true)
            ->where('teacher_id', $teacher?->id)
            ->with(['department:id,name,code', 'yearLevel:id,name'])
            ->withCount('students')
            ->get()
            ->map(function ($section) use ($teacher) {
                // Students in this advisory section
                $students = Student::where('section_id', $section->id)
                    ->whereNull('deleted_at')
                    ->orderBy('last_name')
                    ->get(['id', 'first_name', 'last_name', 'middle_name', 'suffix', 'lrn', 'gender', 'enrollment_status']);

                // Subjects that apply to this section (by dept + year level)
                // These are the subjects students in this section are expected to study
                $subjects = Subject::where('is_active', true)
                    ->where('department_id', $section->department_id)
                    ->where(function ($q) use ($section) {
                        $q->where('year_level_id', $section->year_level_id)
                          ->orWhereNull('year_level_id');
                    })
                    ->with('teachers:id,first_name,last_name')
                    ->select('id', 'code', 'name', 'type', 'units')
                    ->orderBy('code')
                    ->get()
                    ->map(fn ($s) => [
                        'id'       => $s->id,
                        'code'     => $s->code,
                        'name'     => $s->name,
                        'type'     => $s->type,
                        'units'    => $s->units,
                        // Mark if this teacher is one of the subject teachers
                        'i_teach'  => $teacher ? $s->teachers->contains('id', $teacher->id) : false,
                        'teachers' => $s->teachers->map(fn ($t) => "{$t->first_name} {$t->last_name}")->values()->toArray(),
                    ]);

                return [
                    'id'             => $section->id,
                    'name'           => $section->name,
                    'code'           => $section->code,
                    'capacity'       => $section->capacity,
                    'room_number'    => $section->room_number,
                    'department'     => $section->department ? ['id' => $section->department->id, 'name' => $section->department->name] : null,
                    'year_level'     => $section->yearLevel  ? ['id' => $section->yearLevel->id,  'name' => $section->yearLevel->name]  : null,
                    'students_count' => $section->students_count,
                    'students'       => $students,
                    'subjects'       => $subjects,
                ];
            });

        /**
         * Teaching subjects: subjects assigned to this teacher via the
         * Owner/Registrar > Subjects page (subject_teacher pivot).
         */
        $teachingSubjects = collect();
        if ($teacher) {
            $teachingSubjects = Subject::whereHas('teachers', fn ($q) => $q->where('teachers.id', $teacher->id))
                ->where('is_active', true)
                ->with(['department:id,name', 'yearLevel:id,name'])
                ->select('id', 'code', 'name', 'type', 'units', 'department_id', 'year_level_id')
                ->orderBy('code')
                ->get()
                ->map(function ($s) {
                    $studentCount = Student::whereNull('deleted_at')
                        ->where('enrollment_status', 'enrolled')
                        ->where('department_id', $s->department_id)
                        ->when($s->year_level_id, fn ($q) => $q->where('year_level_id', $s->year_level_id))
                        ->count();
                    return [
                        'id'            => $s->id,
                        'code'          => $s->code,
                        'name'          => $s->name,
                        'type'          => $s->type,
                        'units'         => $s->units,
                        'department'    => $s->department?->name,
                        'year_level'    => $s->yearLevel?->name,
                        'student_count' => $studentCount,
                    ];
                });
        }

        return Inertia::render('teacher/classes/index', [
            'advisorySections' => $advisorySections,
            'teachingSubjects' => $teachingSubjects,
        ]);
    }

    public function show(Section $section)
    {
        $section->load(['department:id,name,code', 'yearLevel:id,name']);

        // Use section_id FK (not the string name column)
        $students = Student::where('section_id', $section->id)
            ->whereNull('deleted_at')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name', 'lrn', 'email', 'enrollment_status']);

        return Inertia::render('teacher/classes/show', [
            'section'  => $section,
            'students' => $students,
        ]);
    }
}
