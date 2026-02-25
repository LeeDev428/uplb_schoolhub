<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Department;
use App\Models\Program;
use App\Models\StudentActionLog;
use App\Models\YearLevel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SelfEnrollmentController extends Controller
{
    /**
     * Show the self-enrollment form for returning students.
     * Only accessible when enrollment_status is not 'enrolled'.
     */
    public function index(): Response|RedirectResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (! $student) {
            return redirect()->route('student.dashboard')
                ->with('error', 'No student record linked to your account.');
        }

        // If already enrolled in current school year, redirect with notice
        $settings           = AppSetting::current();
        $currentSchoolYear  = $settings->school_year ?? date('Y') . '-' . (date('Y') + 1);

        if ($student->enrollment_status === 'enrolled' && $student->school_year === $currentSchoolYear) {
            return redirect()->route('student.dashboard')
                ->with('info', 'You are already enrolled for the current school year.');
        }

        // If there is already a pending enrollment request, show status
        $hasPendingRequest = $student->enrollment_status === 'pending-registrar';

        // Check if enrollment is open for student's classification
        $dept = Department::find($student->department_id);
        $classification = $dept?->classification ?? 'K-12';
        $enrollmentOpen = $settings->isEnrollmentOpen($classification);

        // Get available options from database
        $departments = Department::orderBy('name')->get(['id', 'name', 'code', 'classification']);
        $programs    = Program::orderBy('name')->get(['id', 'name', 'code', 'department_id']);
        $yearLevels  = YearLevel::orderBy('order')->get(['id', 'name', 'code', 'department_id']);

        return Inertia::render('student/enrollment/index', [
            'student' => [
                'id'               => $student->id,
                'first_name'       => $student->first_name,
                'last_name'        => $student->last_name,
                'lrn'              => $student->lrn,
                'email'            => $user->email,
                'program'          => $student->program,
                'year_level'       => $student->year_level,
                'section'          => $student->section,
                'department_id'    => $student->department_id,
                'enrollment_status'=> $student->enrollment_status,
                'school_year'      => $student->school_year,
                'student_photo_url'=> $student->student_photo_url,
            ],
            'currentSchoolYear'  => $currentSchoolYear,
            'hasPendingRequest'  => $hasPendingRequest,
            'enrollmentOpen'     => $enrollmentOpen,
            'classification'     => $classification,
            'enrollmentPeriod'   => [
                'k12_open'          => $settings->k12_enrollment_open,
                'k12_start'         => $settings->k12_enrollment_start?->format('M d, Y'),
                'k12_end'           => $settings->k12_enrollment_end?->format('M d, Y'),
                'college_open'      => $settings->college_enrollment_open,
                'college_start'     => $settings->college_enrollment_start?->format('M d, Y'),
                'college_end'       => $settings->college_enrollment_end?->format('M d, Y'),
            ],
            'departments'       => $departments,
            'programs'          => $programs,
            'yearLevels'        => $yearLevels,
        ]);
    }

    /**
     * Submit enrollment request for the new school year.
     */
    public function store(Request $request): RedirectResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (! $student) {
            return back()->with('error', 'No student record linked to your account.');
        }

        $settings          = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? date('Y') . '-' . (date('Y') + 1);

        // Check if enrollment is open for student's classification
        $dept = Department::find($student->department_id);
        $classification = $dept?->classification ?? 'K-12';
        
        if (!$settings->isEnrollmentOpen($classification)) {
            return back()->with('error', "Enrollment for {$classification} is currently closed.");
        }

        // Don't allow if already enrolled for this school year
        if ($student->enrollment_status === 'enrolled' && $student->school_year === $currentSchoolYear) {
            return back()->with('error', 'You are already enrolled for the current school year.');
        }

        // Don't allow duplicate pending request
        if ($student->enrollment_status === 'pending-registrar') {
            return back()->with('error', 'You already have a pending enrollment request. Please wait for the Registrar to process it.');
        }

        $validated = $request->validate([
            'year_level'    => 'required|string|max:100',
            'program'       => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'notes'         => 'nullable|string|max:1000',
        ]);

        $oldStatus     = $student->enrollment_status;
        $oldYearLevel  = $student->year_level;
        $oldSchoolYear = $student->school_year;

        // Update student record
        $student->update([
            'enrollment_status' => 'pending-registrar',
            'school_year'       => $currentSchoolYear,
            'year_level'        => $validated['year_level'],
            'program'           => $validated['program'] ?? $student->program,
            'department_id'     => $validated['department_id'] ?? $student->department_id,
        ]);

        // Log the action
        StudentActionLog::create([
            'student_id'   => $student->id,
            'performed_by' => $user->id,
            'action'       => 'Self-Enrollment Request Submitted',
            'action_type'  => 'enrollment',
            'details'      => "Student submitted re-enrollment request for {$currentSchoolYear}. Year Level: {$validated['year_level']}.",
            'notes'        => $validated['notes'] ?? null,
            'changes'      => [
                'enrollment_status' => ['from' => $oldStatus, 'to' => 'pending-registrar'],
                'school_year'       => ['from' => $oldSchoolYear, 'to' => $currentSchoolYear],
                'year_level'        => ['from' => $oldYearLevel, 'to' => $validated['year_level']],
            ],
        ]);

        return redirect()->route('student.dashboard')
            ->with('success', 'Enrollment request submitted successfully! The Registrar will review your application.');
    }
}
