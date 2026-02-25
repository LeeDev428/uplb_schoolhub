<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Attendance;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        $settings = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? (date('Y') . '-' . (date('Y') + 1));

        // Advisory section IDs for this teacher
        $advisorySectionIds = Section::where('teacher_id', $teacher?->id)
            ->where('is_active', true)
            ->pluck('id')
            ->toArray();

        // Teaching subjects for this teacher
        $teachingSubjects = Subject::whereHas('teachers', fn ($q) => $q->where('teachers.id', $teacher?->id))
            ->where('is_active', true)
            ->get();

        // Base scoped student query - only enrolled students
        $base = Student::query()
            ->where('enrollment_status', 'enrolled')
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
            $base = Student::query()
                ->where('enrollment_status', 'enrolled')
                ->where('department_id', $teacher->department_id);
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

        // Date filter (default to today)
        $date = $request->input('date', now()->format('Y-m-d'));
        $subjectId = $request->input('subject');

        $students = $query->orderBy('last_name')->paginate(25)->withQueryString();

        // Attach today's attendance record if exists
        $studentIds = $students->pluck('id');
        $attendanceQuery = Attendance::whereIn('student_id', $studentIds)
            ->whereDate('date', $date);
        
        if ($subjectId && $subjectId !== 'all') {
            $attendanceQuery->where('subject_id', $subjectId);
        }

        $attendanceRecords = $attendanceQuery->get()->keyBy('student_id');

        $students->getCollection()->transform(function ($student) use ($attendanceRecords) {
            $student->attendance = $attendanceRecords->get($student->id);
            return $student;
        });

        // Sections scoped to this teacher's pool
        $sectionNames = (clone $base)->select('section')
            ->whereNotNull('section')
            ->where('section', '!=', '')
            ->distinct()
            ->orderBy('section')
            ->pluck('section')
            ->map(fn ($name) => ['id' => $name, 'name' => $name]);

        // Get advisory sections for section filter
        $advisorySections = Section::whereIn('id', $advisorySectionIds)
            ->get(['id', 'name']);

        return Inertia::render('teacher/attendance/index', [
            'students'           => $students,
            'sections'           => $sectionNames,
            'advisorySections'   => $advisorySections,
            'subjects'           => $teachingSubjects->map(fn ($s) => ['id' => $s->id, 'name' => "{$s->code} - {$s->name}"]),
            'currentSchoolYear'  => $currentSchoolYear,
            'selectedDate'       => $date,
            'filters'            => [
                'search'  => $request->search,
                'section' => $request->section,
                'subject' => $subjectId,
                'date'    => $date,
            ],
        ]);
    }

    /**
     * Store/update attendance records.
     * Expects: { date, subject_id?, section_id?, records: [{ student_id, status, time_in?, time_out?, remarks? }] }
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        $validated = $request->validate([
            'date'                   => 'required|date',
            'subject_id'             => 'nullable|exists:subjects,id',
            'section_id'             => 'nullable|exists:sections,id',
            'records'                => 'required|array|min:1',
            'records.*.student_id'   => 'required|exists:students,id',
            'records.*.status'       => 'required|in:present,absent,late,excused',
            'records.*.time_in'      => 'nullable|date_format:H:i',
            'records.*.time_out'     => 'nullable|date_format:H:i',
            'records.*.remarks'      => 'nullable|string|max:500',
        ]);

        $settings = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? (date('Y') . '-' . (date('Y') + 1));

        $saved = 0;
        foreach ($validated['records'] as $record) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'subject_id' => $validated['subject_id'],
                    'date'       => $validated['date'],
                ],
                [
                    'section_id'   => $validated['section_id'],
                    'teacher_id'   => $teacher?->id,
                    'status'       => $record['status'],
                    'time_in'      => $record['time_in'] ?? null,
                    'time_out'     => $record['time_out'] ?? null,
                    'remarks'      => $record['remarks'] ?? null,
                    'school_year'  => $currentSchoolYear,
                ]
            );
            $saved++;
        }

        return back()->with('success', "{$saved} attendance record(s) saved successfully.");
    }

    /**
     * Get attendance summary for a date range.
     */
    public function summary(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'section_id' => 'nullable|exists:sections,id',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        $query = Attendance::whereBetween('date', [$request->start_date, $request->end_date]);
        
        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        }
        
        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($teacher) {
            $query->where('teacher_id', $teacher->id);
        }

        $summary = $query->selectRaw('
                status, 
                COUNT(*) as count
            ')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json([
            'present' => $summary['present'] ?? 0,
            'absent'  => $summary['absent'] ?? 0,
            'late'    => $summary['late'] ?? 0,
            'excused' => $summary['excused'] ?? 0,
        ]);
    }
}
