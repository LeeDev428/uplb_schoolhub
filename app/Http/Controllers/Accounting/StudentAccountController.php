<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\GrantRecipient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentAccountController extends Controller
{
    /**
     * Display a listing of student accounts.
     */
    public function index(Request $request): Response
    {
        $query = StudentFee::with(['student.department', 'payments']);

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Filter by payment status
        if ($status = $request->input('status')) {
            if ($status === 'paid') {
                $query->where('balance', '<=', 0);
            } elseif ($status === 'partial') {
                $query->where('total_paid', '>', 0)->where('balance', '>', 0)->where('is_overdue', false);
            } elseif ($status === 'unpaid') {
                $query->where('total_paid', 0)->where('is_overdue', false);
            } elseif ($status === 'overdue') {
                $query->where('is_overdue', true);
            }
        }

        // Filter by school year
        if ($schoolYear = $request->input('school_year')) {
            $query->where('school_year', $schoolYear);
        }

        // Filter by department
        if ($departmentId = $request->input('department_id')) {
            $query->whereHas('student', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        $accounts = $query->latest()->paginate(20)->withQueryString();

        // Transform for frontend
        $accounts->through(function ($fee) {
            $grants = GrantRecipient::where('student_id', $fee->student_id)
                ->where('school_year', $fee->school_year)
                ->where('status', 'active')
                ->with('grant')
                ->get();

            return [
                'id' => $fee->id,
                'student' => [
                    'id' => $fee->student->id,
                    'full_name' => $fee->student->full_name,
                    'lrn' => $fee->student->lrn,
                    'program' => $fee->student->program,
                    'year_level' => $fee->student->year_level,
                    'section' => $fee->student->section,
                    'department' => $fee->student->department?->name,
                ],
                'school_year' => $fee->school_year,
                'total_amount' => $fee->total_amount,
                'grant_discount' => $fee->grant_discount,
                'total_paid' => $fee->total_paid,
                'balance' => $fee->balance,
                'is_overdue' => $fee->is_overdue,
                'due_date' => $fee->due_date,
                'payment_status' => $fee->getPaymentStatus(),
                'payments_count' => $fee->payments->count(),
                'grants' => $grants->map(fn($gr) => [
                    'name' => $gr->grant->name,
                    'discount' => $gr->discount_amount,
                ]),
            ];
        });

        $schoolYears = StudentFee::distinct()->pluck('school_year')->sort()->values();

        // Stats
        $currentSchoolYear = $schoolYear ?? $schoolYears->first();
        $stats = [
            'total_students' => StudentFee::forSchoolYear($currentSchoolYear)->count(),
            'total_receivables' => StudentFee::forSchoolYear($currentSchoolYear)->sum('total_amount'),
            'total_collected' => StudentFee::forSchoolYear($currentSchoolYear)->sum('total_paid'),
            'total_balance' => StudentFee::forSchoolYear($currentSchoolYear)->sum('balance'),
            'overdue_count' => StudentFee::forSchoolYear($currentSchoolYear)->overdue()->count(),
            'fully_paid' => StudentFee::forSchoolYear($currentSchoolYear)->where('balance', '<=', 0)->count(),
        ];

        return Inertia::render('accounting/student-accounts/index', [
            'accounts' => $accounts,
            'schoolYears' => $schoolYears,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'school_year', 'department_id']),
        ]);
    }

    /**
     * Mark a student account as overdue.
     */
    public function markOverdue(StudentFee $fee): RedirectResponse
    {
        $fee->markOverdue();

        return redirect()->back()->with('success', 'Account marked as overdue.');
    }

    /**
     * Clear overdue status.
     */
    public function clearOverdue(StudentFee $fee): RedirectResponse
    {
        $fee->clearOverdue();

        return redirect()->back()->with('success', 'Overdue status cleared.');
    }

    /**
     * Get detailed account information.
     */
    public function show(StudentFee $fee): Response
    {
        $fee->load(['student', 'payments.recordedBy']);

        $grants = GrantRecipient::where('student_id', $fee->student_id)
            ->where('school_year', $fee->school_year)
            ->with('grant')
            ->get();

        return Inertia::render('accounting/student-accounts/show', [
            'account' => [
                'id' => $fee->id,
                'student' => $fee->student,
                'school_year' => $fee->school_year,
                'registration_fee' => $fee->registration_fee,
                'tuition_fee' => $fee->tuition_fee,
                'misc_fee' => $fee->misc_fee,
                'books_fee' => $fee->books_fee,
                'other_fees' => $fee->other_fees,
                'total_amount' => $fee->total_amount,
                'grant_discount' => $fee->grant_discount,
                'total_paid' => $fee->total_paid,
                'balance' => $fee->balance,
                'is_overdue' => $fee->is_overdue,
                'due_date' => $fee->due_date,
                'payment_status' => $fee->getPaymentStatus(),
                'payments' => $fee->payments,
                'grants' => $grants,
            ],
        ]);
    }
}
