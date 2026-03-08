<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\GrantRecipient;
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
        $currentSchoolYear = \App\Models\AppSetting::current()->school_year ?? '2024-2025';

        // Get payment info using same logic as online payments
        $paymentInfo = $this->getPaymentSummary($student);

        // Get previous school year balances
        $previousBalances = $this->getPreviousSchoolYearBalances($student, $currentSchoolYear);

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
            'currentSchoolYear' => $currentSchoolYear,
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
    private function getPaymentSummary(Student $student): ?array
    {
        $currentSchoolYear = \App\Models\AppSetting::current()->school_year ?? '2024-2025';

        // Sync grant discounts: recalculate from Grant model so stale discount_amount never causes issues
        foreach (StudentFee::where('student_id', $student->id)->get() as $feeToSync) {
            $recipients = GrantRecipient::where('student_id', $student->id)
                ->where('school_year', $feeToSync->school_year)
                ->where('status', 'active')
                ->with('grant')
                ->get();
            $freshGrant = 0.0;
            foreach ($recipients as $r) {
                if ($r->grant) {
                    $calculated = $r->grant->calculateDiscount((float) $feeToSync->total_amount);
                    if ((float) $r->discount_amount !== $calculated) {
                        $r->discount_amount = $calculated;
                        $r->save();
                    }
                    $freshGrant += $calculated;
                }
            }
            // Use fresh payment sum (never rely on stale total_paid column)
            $freshPaid = (float) $feeToSync->payments()->sum('amount');
            $expectedBalance = max(0, (float) $feeToSync->total_amount - $freshGrant - $freshPaid);
            if ((float) $feeToSync->grant_discount !== $freshGrant
                || (float) $feeToSync->total_paid  !== $freshPaid
                || (float) $feeToSync->balance     !== $expectedBalance) {
                $feeToSync->grant_discount = $freshGrant;
                $feeToSync->total_paid     = $freshPaid;
                $feeToSync->balance        = $expectedBalance;
                $feeToSync->save();
            }
        }

        // Re-fetch fees with fresh data
        $fees = StudentFee::with(['payments'])
            ->where('student_id', $student->id)
            ->orderBy('school_year', 'desc')
            ->get();

        // Calculate summary stats from up-to-date fee records
        $totalFees = $fees->sum('total_amount');
        $totalDiscount = $fees->sum('grant_discount');
        $totalPaid = $fees->flatMap->payments->sum('amount');
        
        // Calculate previous balance (from previous school years) and current fees balance
        $previousBalance = $fees->where('school_year', '!=', $currentSchoolYear)->sum('balance');
        $currentFeesBalance = $fees->where('school_year', $currentSchoolYear)->sum('balance');

        // Always compute balance dynamically: total_fees - grant_discount - total_paid
        // (never trust the stored balance column alone as it can be stale before sync)
        $balance = max(0, $totalFees - $totalDiscount - $totalPaid);

        // Get StudentFee record for overdue status
        $studentFee = $fees->where('school_year', $currentSchoolYear)->first();

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
        $isFullyPaid = !$fees->isEmpty() && $balance <= 0;

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
        return StudentFee::where('student_id', $student->id)
            ->where('school_year', '!=', $currentSchoolYear)
            ->where('balance', '>', 0)
            ->orderBy('school_year', 'desc')
            ->get()
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
}

