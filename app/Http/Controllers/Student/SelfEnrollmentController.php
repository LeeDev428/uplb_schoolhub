<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Department;
use App\Models\Program;
use App\Models\StudentActionLog;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use App\Models\YearLevel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SelfEnrollmentController extends Controller
{
    /**
     * Show enrollment details (for enrolled students) or self-enrollment form (for others).
     */
    public function index(): Response|RedirectResponse
    {
        $user    = Auth::user();
        $student = $user->student;

        if (! $student) {
            return redirect()->route('student.dashboard')
                ->with('error', 'No student record linked to your account.');
        }

        $settings          = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? date('Y') . '-' . (date('Y') + 1);
        $classification    = $student->resolveDepartmentClassification() ?? 'K-12';

        // ── ENROLLED: show read-only enrollment details ────────────────────────
        if ($student->enrollment_status === 'enrolled') {
            $student->load(['requirements.requirement.category', 'enrollmentClearance', 'departmentModel']);

            // Fees for all school years
            $fees = StudentFee::where('student_id', $student->id)
                ->orderBy('school_year', 'desc')
                ->get()
                ->map(fn ($fee) => [
                    'id'                => $fee->id,
                    'school_year'       => $fee->school_year,
                    'total_amount'      => (float) $fee->total_amount,
                    'total_paid'        => (float) $fee->total_paid,
                    'balance'           => (float) $fee->balance,
                    'grant_discount'    => (float) $fee->grant_discount,
                    'payment_status'    => $fee->payment_status,
                    'is_overdue'        => (bool) $fee->is_overdue,
                    'due_date'          => $fee->due_date?->format('M d, Y'),
                ]);

            // Payment history
            $payments = StudentPayment::where('student_id', $student->id)
                ->with('studentFee:id,school_year')
                ->orderBy('payment_date', 'desc')
                ->get()
                ->map(fn ($p) => [
                    'id'           => $p->id,
                    'payment_date' => $p->payment_date?->format('M d, Y'),
                    'or_number'    => $p->or_number,
                    'amount'       => (float) $p->amount,
                    'payment_mode' => strtoupper($p->payment_mode ?? $p->payment_method ?? 'CASH'),
                    'payment_for'  => $p->payment_for,
                    'notes'        => $p->notes,
                    'school_year'  => $p->studentFee?->school_year,
                ]);

            // Promissory notes
            $promissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
                ->with('studentFee:id,school_year')
                ->orderBy('submitted_date', 'desc')
                ->get()
                ->map(fn ($n) => [
                    'id'             => $n->id,
                    'submitted_date' => $n->submitted_date->format('M d, Y'),
                    'due_date'       => $n->due_date->format('M d, Y'),
                    'amount'         => $n->amount !== null ? (float) $n->amount : null,
                    'reason'         => $n->reason,
                    'status'         => $n->status,
                    'school_year'    => $n->studentFee?->school_year,
                    'review_notes'   => $n->review_notes,
                ]);

            // Summary
            $totalFees     = $fees->sum('total_amount');
            $totalDiscount = $fees->sum('grant_discount');
            $totalPaid     = $fees->sum('total_paid');
            $totalBalance  = $fees->sum('balance');

            // Requirements
            $requirements = $student->requirements->map(fn ($req) => [
                'id'           => $req->id,
                'name'         => $req->requirement->name,
                'description'  => $req->requirement->description ?? null,
                'category'     => $req->requirement->category?->name ?? null,
                'status'       => $req->status,
                'notes'        => $req->notes,
                'submitted_at' => $req->submitted_at?->format('M d, Y'),
                'approved_at'  => $req->approved_at?->format('M d, Y'),
            ]);

            // Enrollment clearance
            $clearance = $student->enrollmentClearance ? [
                'requirements_complete'            => (bool) $student->enrollmentClearance->requirements_complete,
                'requirements_complete_percentage' => (int) $student->enrollmentClearance->requirements_complete_percentage,
                'registrar_clearance'              => (bool) $student->enrollmentClearance->registrar_clearance,
                'registrar_cleared_at'             => $student->enrollmentClearance->registrar_cleared_at?->format('M d, Y'),
                'registrar_notes'                  => $student->enrollmentClearance->registrar_notes,
                'accounting_clearance'             => (bool) $student->enrollmentClearance->accounting_clearance,
                'accounting_cleared_at'            => $student->enrollmentClearance->accounting_cleared_at?->format('M d, Y'),
                'accounting_notes'                 => $student->enrollmentClearance->accounting_notes,
                'official_enrollment'              => (bool) $student->enrollmentClearance->official_enrollment,
                'officially_enrolled_at'           => $student->enrollmentClearance->officially_enrolled_at?->format('M d, Y'),
            ] : null;

            return Inertia::render('student/enrollment/index', [
                'isEnrolled'        => true,
                'currentSchoolYear' => $currentSchoolYear,
                'classification'    => $classification,
                'student' => [
                    'id'                => $student->id,
                    'first_name'        => $student->first_name,
                    'last_name'         => $student->last_name,
                    'lrn'               => $student->lrn,
                    'email'             => $user->email,
                    'program'           => $student->program,
                    'year_level'        => $student->year_level,
                    'section'           => $student->section,
                    'school_year'       => $student->school_year,
                    'enrollment_status' => $student->enrollment_status,
                    'student_photo_url' => $student->student_photo_url,
                    'student_type'      => $student->student_type,
                    'department'        => $student->departmentModel?->name,
                    'classification'    => $classification,
                    'remarks'           => $student->remarks,
                ],
                'fees'          => $fees->values(),
                'payments'      => $payments->values(),
                'promissoryNotes' => $promissoryNotes->values(),
                'requirements'  => $requirements->values(),
                'clearance'     => $clearance,
                'summary' => [
                    'total_fees'     => $totalFees,
                    'total_discount' => $totalDiscount,
                    'total_paid'     => $totalPaid,
                    'total_balance'  => $totalBalance,
                ],
            ]);
        }

        // ── NOT ENROLLED: show re-enrollment form ──────────────────────────────
        $hasPendingRequest = $student->enrollment_status === 'pending-registrar';
        $enrollmentOpen    = $settings->isEnrollmentOpen($classification);

        $departments = Department::orderBy('name')->get(['id', 'name', 'code', 'classification']);
        $programs    = Program::orderBy('name')->get(['id', 'name', 'code', 'department_id']);
        $yearLevels  = YearLevel::orderBy('order')->get(['id', 'name', 'code', 'department_id']);

        return Inertia::render('student/enrollment/index', [
            'isEnrolled'        => false,
            'currentSchoolYear' => $currentSchoolYear,
            'classification'    => $classification,
            'student' => [
                'id'                => $student->id,
                'first_name'        => $student->first_name,
                'last_name'         => $student->last_name,
                'lrn'               => $student->lrn,
                'email'             => $user->email,
                'program'           => $student->program,
                'year_level'        => $student->year_level,
                'section'           => $student->section,
                'department_id'     => $student->department_id,
                'enrollment_status' => $student->enrollment_status,
                'school_year'       => $student->school_year,
                'student_photo_url' => $student->student_photo_url,
            ],
            'hasPendingRequest' => $hasPendingRequest,
            'enrollmentOpen'    => $enrollmentOpen,
            'enrollmentPeriod'  => [
                'start' => $classification === 'College'
                    ? $settings->college_enrollment_start?->format('M d, Y')
                    : $settings->k12_enrollment_start?->format('M d, Y'),
                'end'   => $classification === 'College'
                    ? $settings->college_enrollment_end?->format('M d, Y')
                    : $settings->k12_enrollment_end?->format('M d, Y'),
            ],
            'departments' => $departments,
            'programs'    => $programs,
            'yearLevels'  => $yearLevels,
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
        $classification = $student->resolveDepartmentClassification() ?? 'K-12';
        
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
