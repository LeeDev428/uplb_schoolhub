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
        $student = Student::with(['requirements.requirement', 'enrollmentClearance'])
            ->findOrFail($user->student_id);

        // Calculate requirements stats
        $totalRequirements = $student->requirements->count();
        $completedRequirements = $student->requirements->where('status', 'approved')->count();
        $pendingRequirements = $student->requirements->where('status', 'pending')->count();
        $requirementsPercentage = $totalRequirements > 0 ? round(($completedRequirements / $totalRequirements) * 100) : 0;

        // Get payment info using same logic as online payments
        $paymentInfo = $this->getPaymentSummary($student);

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
            'stats' => [
                'totalRequirements' => $totalRequirements,
                'completedRequirements' => $completedRequirements,
                'pendingRequirements' => $pendingRequirements,
                'requirementsPercentage' => $requirementsPercentage,
            ],
            'enrollmentClearance' => $student->enrollmentClearance,
            'paymentInfo' => $paymentInfo,
            'incompleteRequirements' => $incompleteRequirements,
        ]);
    }

    /**
     * Get payment summary using same logic as online payments.
     */
    private function getPaymentSummary(Student $student): ?array
    {
        $schoolYear = '2024-2025';
        
        // Calculate total fees from fee items (same as online payments)
        $totalFees = $this->calculateTotalFees($student, $schoolYear);
        
        // Get discount from grants
        $totalDiscount = \App\Models\GrantRecipient::where('student_id', $student->id)
            ->where('status', 'active')
            ->sum('discount_amount');
        
        // Get total paid from StudentPayments
        $totalPaid = \App\Models\StudentPayment::whereHas('studentFee', function ($query) use ($student) {
            $query->where('student_id', $student->id);
        })->sum('amount');
        
        // Get verified online transactions
        $onlinePaid = \App\Models\OnlineTransaction::where('student_id', $student->id)
            ->where('status', 'verified')
            ->sum('amount');
        
        $totalPaid += $onlinePaid;
        
        // Calculate balance
        $balance = max(0, $totalFees - $totalDiscount - $totalPaid);
        
        // Get StudentFee record for overdue status
        $studentFee = StudentFee::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->first();
        
        // Get approved promissory notes
        $approvedPromissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
            ->where('status', 'approved')
            ->get();
        
        $approvedPromissoryAmount = $approvedPromissoryNotes->sum('amount');
        $effectiveBalance = max(0, $balance - $approvedPromissoryAmount);
        
        // Check if overdue
        $isOverdue = $balance > 0 && !$approvedPromissoryNotes->count() && 
                     $studentFee?->due_date && now()->gt($studentFee->due_date);
        
        return [
            'total_fees' => $totalFees,
            'discount_amount' => $totalDiscount,
            'total_paid' => $totalPaid,
            'balance' => $balance,
            'effective_balance' => $effectiveBalance,
            'promissory_amount' => $approvedPromissoryAmount,
            'is_fully_paid' => $balance <= 0,
            'is_overdue' => $isOverdue,
            'due_date' => $studentFee?->due_date,
            'has_promissory' => $approvedPromissoryNotes->count() > 0,
        ];
    }

    /**
     * Calculate total fees from fee items.
     */
    private function calculateTotalFees(Student $student, string $schoolYear): float
    {
        // Get assigned fee item IDs
        $assignedFeeItemIds = \App\Models\FeeItemAssignment::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where(function ($query) use ($student) {
                if ($student->classification) {
                    $query->where('classification', $student->classification);
                }
                if ($student->department_id) {
                    $query->where('department_id', $student->department_id);
                }
                if ($student->year_level_id) {
                    $query->where('year_level_id', $student->year_level_id);
                }
            })
            ->pluck('fee_item_id')
            ->toArray();
        
        // Get fee items with 'all' scope
        $allScopeFeeItems = \App\Models\FeeItem::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where('assignment_scope', 'all')
            ->pluck('id')
            ->toArray();
        
        $feeItemIds = array_unique(array_merge($assignedFeeItemIds, $allScopeFeeItems));
        
        // Calculate total
        return (float) \App\Models\FeeItem::whereIn('id', $feeItemIds)
            ->where('is_active', true)
            ->sum('selling_price');
    }
}

