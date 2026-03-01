<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Department;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentActionLog;
use App\Models\StudentSubject;
use App\Models\Subject;
use App\Models\YearLevel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CollegeEnrollmentController extends Controller
{
    /**
     * Philippine college enrollment constants.
     * Standard regular load: 18–21 units  
     * Maximum allowed (without overload approval): 24 units
     * Minimum (underload): 15 units  
     */
    private const MAX_UNITS  = 24;
    private const MIN_UNITS  = 15;
    private const IDEAL_UNITS = 21;

    /**
     * Show the subject enrollment page for college students.
     * Students can browse available subjects for the active semester and select subjects to enroll in.
     */
    public function index(): Response|RedirectResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (!$student) {
            return redirect()->route('student.dashboard')
                ->with('error', 'No student record linked to your account.');
        }

        $settings          = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? date('Y') . '-' . (date('Y') + 1);
        $activeSemester    = (int) ($settings->active_semester ?? 1);

        // Verify student is enrolled
        if ($student->enrollment_status !== 'enrolled') {
            return redirect()->route('student.enrollment.index')
                ->with('error', 'You must be officially enrolled to access subject enrollment.');
        }

        // Verify enrollment is open
        $dept           = Department::find($student->department_id);
        $classification = $dept?->classification ?? 'K-12';

        if ($classification !== 'College') {
            return redirect()->route('student.dashboard')
                ->with('error', 'Subject enrollment is only available for college students.');
        }

        if (!$settings->isEnrollmentOpen('College')) {
            return redirect()->route('student.dashboard')
                ->with('info', 'College enrollment is currently closed.');
        }

        // Resolve student's program
        $program = Program::where('name', $student->program)
            ->where('department_id', $student->department_id)
            ->first();

        // Resolve student's year level
        $yearLevel = YearLevel::where('name', $student->year_level)
            ->where('department_id', $student->department_id)
            ->first();

        // ── Get available subjects for the active semester ───────────────
        $availableSubjects = $this->getAvailableSubjects(
            $student,
            $activeSemester,
            $currentSchoolYear,
            $program,
            $yearLevel
        );

        // ── Get subjects already enrolled this semester ──────────────────
        $enrolledSubjects = StudentSubject::where('student_id', $student->id)
            ->where('school_year', $currentSchoolYear)
            ->where('semester', $activeSemester)
            ->with('subject:id,code,name,units,type,semester,year_level_id')
            ->get()
            ->map(fn ($ss) => [
                'id'            => $ss->id,
                'subject_id'    => $ss->subject_id,
                'code'          => $ss->subject->code ?? '',
                'name'          => $ss->subject->name ?? '',
                'units'         => (float) ($ss->subject->units ?? 0),
                'type'          => $ss->subject->type ?? '',
                'status'        => $ss->status,
                'grade'         => $ss->grade,
            ]);

        $enrolledUnits = $enrolledSubjects->sum('units');

        // ── Get completed subjects (all time) ───────────────────────────
        $completedSubjectIds = StudentSubject::where('student_id', $student->id)
            ->where('status', 'completed')
            ->pluck('subject_id')
            ->toArray();

        $semesterLabels = [1 => '1st Semester', 2 => '2nd Semester', 3 => 'Summer'];

        return Inertia::render('student/enrollment/subjects', [
            'student' => [
                'id'                => $student->id,
                'first_name'        => $student->first_name,
                'last_name'         => $student->last_name,
                'lrn'               => $student->lrn,
                'program'           => $student->program,
                'year_level'        => $student->year_level,
                'department_id'     => $student->department_id,
                'enrollment_status' => $student->enrollment_status,
            ],
            'currentSchoolYear'     => $currentSchoolYear,
            'activeSemester'        => $activeSemester,
            'activeSemesterLabel'   => $semesterLabels[$activeSemester] ?? "Semester {$activeSemester}",
            'availableSubjects'     => $availableSubjects->values(),
            'enrolledSubjects'      => $enrolledSubjects->values(),
            'completedSubjectIds'   => $completedSubjectIds,
            'enrolledUnits'         => (float) $enrolledUnits,
            'maxUnits'              => self::MAX_UNITS,
            'minUnits'              => self::MIN_UNITS,
            'idealUnits'            => self::IDEAL_UNITS,
        ]);
    }

    /**
     * Enroll student in selected subjects for the active semester.
     */
    public function store(Request $request): RedirectResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (!$student) {
            return back()->with('error', 'No student record linked to your account.');
        }

        $settings          = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? date('Y') . '-' . (date('Y') + 1);
        $activeSemester    = (int) ($settings->active_semester ?? 1);

        // Verify student is enrolled
        if ($student->enrollment_status !== 'enrolled') {
            return back()->with('error', 'You must be officially enrolled to enroll in subjects.');
        }

        // Verify enrollment is open
        $dept = Department::find($student->department_id);
        $classification = $dept?->classification ?? 'K-12';
        if (!$settings->isEnrollmentOpen('College') || $classification !== 'College') {
            return back()->with('error', 'College enrollment is currently closed.');
        }

        $validated = $request->validate([
            'subject_ids'   => ['required', 'array', 'min:1'],
            'subject_ids.*' => ['integer', 'exists:subjects,id'],
        ]);

        $subjectIds = $validated['subject_ids'];

        // ── Calculate total units ────────────────────────────────────────
        $newSubjectsUnits = Subject::whereIn('id', $subjectIds)->sum('units');

        // Already enrolled units for this semester
        $existingEnrolledUnits = StudentSubject::where('student_id', $student->id)
            ->where('school_year', $currentSchoolYear)
            ->where('semester', $activeSemester)
            ->where('status', 'enrolled')
            ->join('subjects', 'subjects.id', '=', 'student_subjects.subject_id')
            ->sum('subjects.units');

        $totalUnits = (float) $existingEnrolledUnits + (float) $newSubjectsUnits;

        if ($totalUnits > self::MAX_UNITS) {
            return back()->with('error', "Cannot enroll: total units ({$totalUnits}) would exceed the maximum of " . self::MAX_UNITS . " units per semester.");
        }

        // ── Validate prerequisites ───────────────────────────────────────
        $completedSubjectIds = StudentSubject::where('student_id', $student->id)
            ->where('status', 'completed')
            ->pluck('subject_id')
            ->toArray();

        $subjectsToEnroll = Subject::with('prerequisites:id,code,name')
            ->whereIn('id', $subjectIds)
            ->get();

        foreach ($subjectsToEnroll as $subject) {
            $prereqIds = $subject->prerequisites->pluck('id')->toArray();
            if (!empty($prereqIds)) {
                $unmetPrereqs = array_diff($prereqIds, $completedSubjectIds);
                if (!empty($unmetPrereqs)) {
                    $unmetNames = Subject::whereIn('id', $unmetPrereqs)->pluck('name')->join(', ');
                    return back()->with('error', "Cannot enroll in {$subject->name}: prerequisite(s) not completed — {$unmetNames}.");
                }
            }

            // Check if already enrolled or completed this subject in the same school year/semester
            $existing = StudentSubject::where('student_id', $student->id)
                ->where('subject_id', $subject->id)
                ->where('school_year', $currentSchoolYear)
                ->where('semester', $activeSemester)
                ->first();

            if ($existing) {
                return back()->with('error', "You are already enrolled in {$subject->name} for this semester.");
            }

            // Check if already completed
            $alreadyCompleted = StudentSubject::where('student_id', $student->id)
                ->where('subject_id', $subject->id)
                ->where('status', 'completed')
                ->exists();

            if ($alreadyCompleted) {
                return back()->with('error', "You have already completed {$subject->name}. No need to retake it.");
            }
        }

        // ── Create enrollment records ────────────────────────────────────
        DB::transaction(function () use ($student, $subjectsToEnroll, $currentSchoolYear, $activeSemester, $user) {
            $enrolledNames = [];

            foreach ($subjectsToEnroll as $subject) {
                StudentSubject::create([
                    'student_id'  => $student->id,
                    'subject_id'  => $subject->id,
                    'school_year' => $currentSchoolYear,
                    'semester'    => $activeSemester,
                    'status'      => 'enrolled',
                ]);

                $enrolledNames[] = $subject->code . ' - ' . $subject->name;
            }

            // Log the action
            StudentActionLog::create([
                'student_id'   => $student->id,
                'performed_by' => $user->id,
                'action'       => 'Subject Enrollment',
                'action_type'  => 'enrollment',
                'details'      => 'Student enrolled in ' . count($enrolledNames) . ' subject(s) for ' . $currentSchoolYear . " Semester {$activeSemester}: " . implode(', ', $enrolledNames),
            ]);
        });

        return back()->with('success', 'Successfully enrolled in ' . count($subjectIds) . ' subject(s).');
    }

    /**
     * Drop a subject from the student's current semester enrollment.
     */
    public function drop(Request $request, StudentSubject $enrollment): RedirectResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (!$student || $enrollment->student_id !== $student->id) {
            return back()->with('error', 'Unauthorized action.');
        }

        $settings       = AppSetting::current();
        $activeSemester = (int) ($settings->active_semester ?? 1);

        // Only allow dropping subjects during open enrollment
        if (!$settings->isEnrollmentOpen('College')) {
            return back()->with('error', 'Cannot drop subjects: enrollment period is closed.');
        }

        // Only drop if status is 'enrolled' (not completed/failed)
        if ($enrollment->status !== 'enrolled') {
            return back()->with('error', "Cannot drop this subject: status is '{$enrollment->status}'.");
        }

        $subjectName = $enrollment->subject->name ?? 'Unknown';

        $enrollment->delete();

        StudentActionLog::create([
            'student_id'   => $student->id,
            'performed_by' => $user->id,
            'action'       => 'Subject Dropped',
            'action_type'  => 'enrollment',
            'details'      => "Student dropped subject: {$subjectName}.",
        ]);

        return back()->with('success', "Successfully dropped {$subjectName}.");
    }

    /**
     * Get available subjects for the student's program/department in the active semester.
     * Filters out already-completed and already-enrolled subjects.
     * Annotates each subject with prerequisite status.
     */
    private function getAvailableSubjects(
        Student $student,
        int $activeSemester,
        string $currentSchoolYear,
        ?Program $program,
        ?YearLevel $yearLevel
    ) {
        // Build base query: College subjects in the student's department for the active semester
        $query = Subject::with([
                'prerequisites:id,code,name',
                'yearLevel:id,name,level_number',
                'programs:id,name',
            ])
            ->where('classification', 'College')
            ->where('is_active', true)
            ->where(function ($q) use ($activeSemester) {
                $q->where('semester', $activeSemester)
                  ->orWhereNull('semester'); // Include subjects with no specific semester
            });

        // Filter by department
        if ($student->department_id) {
            $query->where(function ($q) use ($student) {
                $q->where('department_id', $student->department_id)
                  ->orWhereHas('departments', fn ($dq) => $dq->where('departments.id', $student->department_id));
            });
        }

        // Optionally filter by program if available
        if ($program) {
            $query->where(function ($q) use ($program) {
                // Include subjects linked to this program OR subjects with no program restriction
                $q->whereHas('programs', fn ($pq) => $pq->where('programs.id', $program->id))
                  ->orWhereDoesntHave('programs');
            });
        }

        $subjects = $query->orderBy('year_level_id')
            ->orderBy('code')
            ->get();

        // Get IDs of subjects student has already completed or is currently enrolled in
        $completedIds = StudentSubject::where('student_id', $student->id)
            ->where('status', 'completed')
            ->pluck('subject_id')
            ->toArray();

        $currentlyEnrolledIds = StudentSubject::where('student_id', $student->id)
            ->where('school_year', $currentSchoolYear)
            ->where('semester', $activeSemester)
            ->pluck('subject_id')
            ->toArray();

        $excludeIds = array_unique(array_merge($completedIds, $currentlyEnrolledIds));

        // Filter and annotate subjects
        $available = $subjects->reject(fn ($s) => in_array($s->id, $excludeIds))
            ->map(function ($subject) use ($completedIds) {
                $prereqIds        = $subject->prerequisites->pluck('id')->toArray();
                $unmetPrereqIds   = array_diff($prereqIds, $completedIds);
                $prerequisitesMet = empty($unmetPrereqIds);

                return [
                    'id'                => $subject->id,
                    'code'              => $subject->code,
                    'name'              => $subject->name,
                    'description'       => $subject->description,
                    'units'             => (float) $subject->units,
                    'type'              => $subject->type,
                    'semester'          => $subject->semester,
                    'hours_per_week'    => $subject->hours_per_week,
                    'year_level_name'   => $subject->yearLevel?->name ?? 'General',
                    'level_number'      => $subject->yearLevel?->level_number ?? 0,
                    'prerequisites'     => $subject->prerequisites->map(fn ($p) => [
                        'id'        => $p->id,
                        'code'      => $p->code,
                        'name'      => $p->name,
                        'completed' => in_array($p->id, $completedIds),
                    ])->values(),
                    'prerequisites_met' => $prerequisitesMet,
                    'programs'          => $subject->programs->pluck('name')->values(),
                ];
            });

        return $available;
    }
}
