<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use App\Models\OnlineTransaction;
use App\Models\GrantRecipient;
use App\Models\PromissoryNote;
use App\Models\FeeItem;
use App\Models\FeeItemAssignment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeesController extends Controller
{
    public function index()
    {
        $user  = Auth::user();
        $parent = $user->parent;

        $children = $parent
            ? $parent->students()
                ->with(['department:id,name', 'section:id,name', 'section.yearLevel:id,name'])
                ->get()
                ->map(fn ($student) => $this->buildChildFees($student))
            : collect();

        return Inertia::render('parent/fees/index', [
            'children' => $children,
        ]);
    }

    private function buildChildFees(Student $student): array
    {
        $schoolYear = '2024-2025';

        $totalFees     = $this->calculateTotalFees($student, $schoolYear);
        $totalDiscount = (float) GrantRecipient::where('student_id', $student->id)->where('status', 'active')->sum('discount_amount');

        // Payments
        $payments = StudentPayment::whereHas('studentFee', fn ($q) => $q->where('student_id', $student->id))
            ->orderByDesc('created_at')
            ->get(['id', 'amount', 'payment_method', 'payment_mode', 'reference_number', 'created_at']);
        $totalPaid = (float) $payments->sum('amount');

        $onlineVerified = OnlineTransaction::where('student_id', $student->id)
            ->where('status', 'verified')
            ->orderByDesc('created_at')
            ->get(['id', 'amount', 'reference_number', 'payment_method', 'created_at']);
        $totalPaid += (float) $onlineVerified->sum('amount');

        $balance = max(0.0, $totalFees - $totalDiscount - $totalPaid);

        $promissoryNotes = PromissoryNote::where('student_id', $student->id)
            ->orderByDesc('created_at')
            ->get(['id', 'amount', 'status', 'reason', 'created_at']);
        $approvedPromissory = (float) $promissoryNotes->where('status', 'approved')->sum('amount');
        $effectiveBalance = max(0.0, $balance - $approvedPromissory);

        $studentFee = StudentFee::where('student_id', $student->id)->where('school_year', $schoolYear)->first();

        return [
            'id'               => $student->id,
            'full_name'        => $student->full_name ?? trim("{$student->first_name} {$student->last_name}"),
            'student_id'       => $student->student_id ?? $student->id,
            'enrollment_status'=> $student->enrollment_status ?? 'not_enrolled',
            'department'       => $student->department?->name,
            'year_level'       => $student->section?->yearLevel?->name,
            'section'          => $student->section?->name,
            'payment' => [
                'total_fees'        => $totalFees,
                'total_discount'    => $totalDiscount,
                'total_paid'        => $totalPaid,
                'balance'           => $balance,
                'effective_balance' => $effectiveBalance,
                'is_fully_paid'     => $balance <= 0,
                'has_promissory'    => $approvedPromissory > 0,
                'due_date'          => $studentFee?->due_date,
            ],
            'payments'        => $payments,
            'online_payments' => $onlineVerified,
            'promissory_notes'=> $promissoryNotes,
        ];
    }

    private function calculateTotalFees(Student $student, string $schoolYear): float
    {
        $assignedIds = FeeItemAssignment::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where(function ($q) use ($student) {
                if ($student->classification) $q->where('classification', $student->classification);
                if ($student->department_id)  $q->orWhere('department_id', $student->department_id);
                if ($student->year_level_id)  $q->orWhere('year_level_id', $student->year_level_id);
            })
            ->pluck('fee_item_id')->toArray();

        $allScopeIds = FeeItem::where('school_year', $schoolYear)->where('is_active', true)->where('assignment_scope', 'all')->pluck('id')->toArray();

        $ids = array_unique(array_merge($assignedIds, $allScopeIds));

        return (float) FeeItem::whereIn('id', $ids)->where('is_active', true)->sum('selling_price');
    }
}
