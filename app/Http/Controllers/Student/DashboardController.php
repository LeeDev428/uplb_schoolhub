<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Guard: student_id must be linked to an actual Student record
        if (!$user->student_id) {
            Auth::logout();
            return redirect()->route('login')
                ->with('error', 'Your account is not linked to a student record. Please contact the registrar.');
        }

        $student = Student::with(['requirements.requirement', 'enrollmentClearance'])
            ->find($user->student_id);

        if (!$student) {
            Auth::logout();
            return redirect()->route('login')
                ->with('error', 'Your student record could not be found. Please contact the registrar.');
        }

        // Calculate requirements stats
        $totalRequirements = $student->requirements->count();
        $completedRequirements = $student->requirements->where('status', 'approved')->count();
        $pendingRequirements = $student->requirements->where('status', 'pending')->count();
        $requirementsPercentage = $totalRequirements > 0 ? round(($completedRequirements / $totalRequirements) * 100) : 0;

        // Get current school year
        $activeSchoolYear = \App\Models\AppSetting::current()?->school_year ?? (date('Y') . '-' . (date('Y') + 1));
        $targetSchoolYear = $student->school_year ?: $activeSchoolYear;

        // Get payment info using same logic as online payments
        $paymentInfo = $this->getPaymentSummary($student, $targetSchoolYear);

        // Get previous school year balances
        $previousBalances = $this->getPreviousSchoolYearBalances($student, $targetSchoolYear);

        // Check if student has incomplete requirements
        $incompleteRequirements = $student->requirements
            ->whereIn('status', ['pending', 'submitted', 'rejected', 'overdue'])
            ->values()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'name' => $req->requirement->name,
                    'status' => $req->status,
                ];
            });

        return Inertia::render('student/dashboard', [
            'student' => $student,
            'currentSchoolYear' => $targetSchoolYear,
            'stats' => [
                'totalRequirements' => $totalRequirements,
                'completedRequirements' => $completedRequirements,
                'pendingRequirements' => $pendingRequirements,
                'requirementsPercentage' => $requirementsPercentage,
            ],
            'enrollmentClearance' => $student->enrollmentClearance,
            'paymentInfo' => $paymentInfo,
            'previousBalances' => $previousBalances,
            'incompleteRequirements' => $incompleteRequirements,
        ]);
    }

    /**
     * Get payment summary using same logic as accounting payments process.
     */
    private function getPaymentSummary(Student $student, string $targetSchoolYear): ?array
    {
        $fees = StudentFee::with(['payments'])
            ->where('student_id', $student->id)
            ->orderBy('school_year', 'desc')
            ->get();

        $currentFees = $fees->filter(fn($fee) => trim((string) $fee->school_year) === trim((string) $targetSchoolYear));
        $studentFee = $currentFees->first();

        $totalFees = (float) $currentFees->sum('total_amount');
        $totalDiscount = (float) $currentFees->sum('grant_discount');
        $totalPaid = (float) $currentFees->flatMap->payments->sum('amount');
        $balance = max(0, $totalFees - $totalDiscount - $totalPaid);

        $previousBalance = (float) $fees
            ->filter(fn($fee) => trim((string) $fee->school_year) !== trim((string) $targetSchoolYear))
            ->sum('balance');
        $currentFeesBalance = $balance;

        // Get approved promissory notes
        $approvedPromissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
            ->where('status', 'approved')
            ->get();

        $approvedPromissoryAmount = $approvedPromissoryNotes->sum('amount');
        $effectiveBalance = max(0, $balance - $approvedPromissoryAmount);

        // Check if overdue
        $isOverdue = $balance > 0 && !$approvedPromissoryNotes->count() &&
                     $studentFee?->due_date && now()->gt($studentFee->due_date);

        // Only fully paid if fee records exist AND balance is zero
        $isFullyPaid = !$currentFees->isEmpty() && $balance <= 0;

        return [
            'total_fees' => $totalFees,
            'discount_amount' => $totalDiscount,
            'total_paid' => $totalPaid,
            'balance' => $balance,
            'effective_balance' => $effectiveBalance,
            'promissory_amount' => $approvedPromissoryAmount,
            'previous_balance' => $previousBalance,
            'current_fees_balance' => $currentFeesBalance > 0 ? $currentFeesBalance : $balance,
            'is_fully_paid' => $isFullyPaid,
            'is_overdue' => $isOverdue,
            'due_date' => $studentFee?->due_date,
            'has_promissory' => $approvedPromissoryNotes->count() > 0,
        ];
    }

    /**
     * Get previous school year balances.
     */
    private function getPreviousSchoolYearBalances(Student $student, string $currentSchoolYear): array
    {
        $currentStartYear = $this->extractSchoolYearStart($currentSchoolYear);

        return StudentFee::where('student_id', $student->id)
            ->where('balance', '>', 0)
            ->orderBy('school_year', 'desc')
            ->get()
            ->filter(function (StudentFee $fee) use ($currentStartYear) {
                if ($currentStartYear === null) {
                    return trim((string) $fee->school_year) !== '';
                }

                $feeStartYear = $this->extractSchoolYearStart((string) $fee->school_year);
                return $feeStartYear !== null && $feeStartYear < $currentStartYear;
            })
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'school_year' => $fee->school_year,
                    'total_amount' => (float) $fee->total_amount,
                    'total_paid' => (float) $fee->total_paid,
                    'balance' => (float) $fee->balance,
                ];
            })
            ->toArray();
    }

    private function extractSchoolYearStart(string $schoolYear): ?int
    {
        if (preg_match('/^(\d{4})\s*-\s*\d{4}$/', trim($schoolYear), $matches)) {
            return (int) $matches[1];
        }

        return null;
    }
}

