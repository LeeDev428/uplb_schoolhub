<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamApprovalController extends Controller
{
    /**
     * Display students eligible for exam (read-only registrar view).
     */
    public function index(Request $request): Response
    {
        $selectedSchoolYear = $request->input('school_year')
            ?: AppSetting::current()?->school_year
            ?: now()->format('Y') . '-' . (now()->year + 1);

        StudentFee::syncOverdueByDueDate($selectedSchoolYear);

        $search = $request->input('search');

        $fullyPaidQuery = Student::whereNull('deleted_at')
            ->whereHas('enrollmentClearance', function ($q) {
                $q->where('registrar_clearance', true);
            })
            ->whereNotIn('enrollment_status', ['not-enrolled', 'pending-registrar'])
            ->whereHas('fees', function ($fq) use ($selectedSchoolYear) {
                $fq->where('school_year', $selectedSchoolYear)
                    ->where('is_overdue', false)
                    ->where(function ($sq) {
                        $sq->where(function ($paid) {
                            $paid->where('total_amount', '>', 0)
                                ->where('balance', '<=', 0);
                        })->orWhere('total_paid', '>', 0);
                    });
            })
            ->with(['fees' => function ($q) use ($selectedSchoolYear) {
                $q->where('school_year', $selectedSchoolYear)->latest();
            }, 'departmentModel']);

        if ($search) {
            $fullyPaidQuery->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        $fullyPaidStudents = $fullyPaidQuery
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                $fee = $student->fees->first();
                return [
                    'id'                => $student->id,
                    'full_name'         => $student->full_name,
                    'first_name'        => $student->first_name,
                    'last_name'         => $student->last_name,
                    'lrn'               => $student->lrn,
                    'gender'            => strtolower($student->gender ?? ''),
                    'classification'    => $student->student_type ?? 'new',
                    'department'        => $student->departmentModel?->name ?? null,
                    'program'           => $student->program,
                    'year_level'        => $student->year_level,
                    'section'           => $student->section,
                    'student_photo_url' => $student->student_photo_url,
                    'total_amount'      => (float) ($fee?->total_amount ?? 0),
                    'total_paid'        => (float) ($fee?->total_paid ?? 0),
                    'balance'           => max(0, (float) ($fee?->balance ?? 0)),
                    'payment_status'    => (function () use ($fee): string {
                        $balance = max(0, (float) ($fee?->balance ?? 0));
                        $total   = (float) ($fee?->total_amount ?? 0);
                        $paid    = (float) ($fee?->total_paid ?? 0);
                        if ($balance <= 0 && $total > 0) return 'paid';
                        if ($paid > 0) return 'partial';
                        return 'unpaid';
                    })(),
                    'school_year'       => $fee?->school_year ?? '',
                ];
            })
            ->values();

        $fullyPaidMale   = $fullyPaidStudents->where('gender', 'male')->values();
        $fullyPaidFemale = $fullyPaidStudents->where('gender', 'female')->values();

        return Inertia::render('registrar/exam-approval/index', [
            'fullyPaidMale'   => $fullyPaidMale,
            'fullyPaidFemale' => $fullyPaidFemale,
            'filters'         => $request->only(['search']),
        ]);
    }
}
