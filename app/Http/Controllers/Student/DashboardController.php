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

        // Get payment info for ALL students
        $paymentInfo = null;
        $studentFee = StudentFee::where('student_id', $student->id)
            ->with(['payments'])
            ->latest()
            ->first();
        
        // Get approved promissory notes separately
        $approvedPromissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
            ->where('status', 'approved')
            ->get();

        if ($studentFee) {
            // Calculate total fees BEFORE discount (same as StudentFee stores it)
            $discountAmount = (float) $studentFee->grant_discount;
            $totalFees = (float) $studentFee->total_amount + $discountAmount; // Add back the discount to get original total
            $totalPaid = (float) $studentFee->total_paid;
            $balance = (float) $studentFee->balance;
            
            // Check for approved promissory notes covering balance
            $approvedPromissoryAmount = $approvedPromissoryNotes->sum('amount');
            $effectiveBalance = max(0, $balance - $approvedPromissoryAmount);
            
            // Check if overdue - not overdue if there's an approved promissory note
            $isOverdue = $balance > 0 && !$approvedPromissoryNotes->count() && 
                         $studentFee->due_date && now()->gt($studentFee->due_date);
            
            $paymentInfo = [
                'total_fees' => $totalFees,
                'discount_amount' => $discountAmount,
                'total_paid' => $totalPaid,
                'balance' => max(0, $balance),
                'effective_balance' => $effectiveBalance,
                'promissory_amount' => $approvedPromissoryAmount,
                'is_fully_paid' => $balance <= 0,
                'is_overdue' => $isOverdue,
                'due_date' => $studentFee->due_date,
                'has_promissory' => $approvedPromissoryNotes->count() > 0,
            ];
        }

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
}

