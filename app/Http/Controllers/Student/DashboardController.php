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

        // Sync grant discounts dynamically from GrantRecipient (fixes stale grant_discount = 0)
        foreach (StudentFee::where('student_id', $student->id)->get() as $feeToSync) {
            $freshGrant = GrantRecipient::where('student_id', $student->id)
                ->where('school_year', $feeToSync->school_year)
                ->where('status', 'active')
                ->sum('discount_amount');
            if ((float) $feeToSync->grant_discount !== (float) $freshGrant) {
                $feeToSync->grant_discount = $freshGrant;
                $feeToSync->balance = max(0, (float) $feeToSync->total_amount - (float) $freshGrant - (float) $feeToSync->total_paid);
                $feeToSync->save();
            }
        }

        // Get student fees (same as accounting process page)
        $fees = StudentFee::with(['payments'])
            ->where('student_id', $student->id)
            ->orderBy('school_year', 'desc')
            ->get();
        
        // Calculate summary stats dynamically (same as accounting process page)
        $totalFees = $fees->sum('total_amount');
        $totalDiscount = $fees->sum('grant_discount');
        $totalPaid = $fees->flatMap->payments->sum('amount');
        
        // Calculate previous balance (from previous school years) and current fees balance
        $previousBalance = $fees->where('school_year', '!=', $currentSchoolYear)->sum('balance');
        $currentFeesBalance = $fees->where('school_year', $currentSchoolYear)->sum('balance');
        
        $balance = max(0, $totalFees - $totalDiscount - $totalPaid);

        // Use stored balance as source of truth (updated by accounting payments)
        $storedBalance = $fees->sum('balance');
        
        // Get StudentFee record for overdue status
        $studentFee = $fees->where('school_year', $currentSchoolYear)->first();
        
        // Get approved promissory notes
        $approvedPromissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
            ->where('status', 'approved')
            ->get();
        
        $approvedPromissoryAmount = $approvedPromissoryNotes->sum('amount');
        $effectiveBalance = max(0, $storedBalance - $approvedPromissoryAmount);
        
        // Check if overdue
        $isOverdue = $storedBalance > 0 && !$approvedPromissoryNotes->count() && 
                     $studentFee?->due_date && now()->gt($studentFee->due_date);
        
        // Only fully paid if fee records exist AND all stored balances are zero
        $isFullyPaid = !$fees->isEmpty() && $storedBalance <= 0;

        return [
            'total_fees' => $totalFees,
            'discount_amount' => $totalDiscount,
            'total_paid' => $totalPaid,
            'balance' => $storedBalance,
            'effective_balance' => $effectiveBalance,
            'promissory_amount' => $approvedPromissoryAmount,
            'previous_balance' => $previousBalance,
            'current_fees_balance' => $currentFeesBalance > 0 ? $currentFeesBalance : $storedBalance,
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

