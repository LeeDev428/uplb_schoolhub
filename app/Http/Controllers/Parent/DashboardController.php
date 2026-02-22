<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\OnlineTransaction;
use App\Models\GrantRecipient;
use App\Models\PromissoryNote;
use App\Models\StudentPayment;
use App\Models\FeeItem;
use App\Models\FeeItemAssignment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $parent = $user->parent;

        if (!$parent) {
            return Inertia::render('parent/dashboard', [
                'parentName' => $user->name,
                'children'   => [],
            ]);
        }

        // Load children via pivot (parent_student table)
        $children = $parent->students()
            ->with([
                'department:id,name',
                'section:id,name,room_number',
                'section.yearLevel:id,name',
                'requirements',
            ])
            ->get()
            ->map(function (Student $student) {
                // Requirements
                $total       = $student->requirements->count();
                $approved    = $student->requirements->where('status', 'approved')->count();
                $reqPercent  = $total > 0 ? round(($approved / $total) * 100) : 0;

                // Payment info
                $paymentInfo = $this->getBasicPaymentInfo($student);

                return [
                    'id'                  => $student->id,
                    'full_name'           => $student->full_name ?? ($student->first_name . ' ' . $student->last_name),
                    'student_id'          => $student->student_id ?? $student->id,
                    'photo_url'           => $student->photo_url ?? null,
                    'enrollment_status'   => $student->enrollment_status ?? 'not_enrolled',
                    'department'          => $student->department?->name,
                    'program'             => $student->program?->name,
                    'section'             => $student->section?->name,
                    'year_level'          => $student->section?->yearLevel?->name,
                    'classification'      => $student->classification ?? null,
                    'requirements' => [
                        'total'      => $total,
                        'approved'   => $approved,
                        'percentage' => $reqPercent,
                    ],
                    'payment' => $paymentInfo,
                ];
            });

        return Inertia::render('parent/dashboard', [
            'parentName' => $parent->full_name ?? $user->name,
            'children'   => $children,
        ]);
    }

    /**
     * Get a lightweight payment summary for a student.
     */
    private function getBasicPaymentInfo(Student $student): array
    {
        $schoolYear = '2024-2025';

        // Total fees
        $totalFees = $this->calculateTotalFees($student, $schoolYear);

        // Discount from active grants
        $totalDiscount = GrantRecipient::where('student_id', $student->id)
            ->where('status', 'active')
            ->sum('discount_amount');

        // Payments via StudentPayment
        $totalPaid = StudentPayment::whereHas('studentFee', function ($q) use ($student) {
            $q->where('student_id', $student->id);
        })->sum('amount');

        // Verified online transactions
        $totalPaid += OnlineTransaction::where('student_id', $student->id)
            ->where('status', 'verified')
            ->sum('amount');

        $balance = max(0, $totalFees - $totalDiscount - $totalPaid);

        // Active approved promissory notes
        $promissoryAmount = PromissoryNote::where('student_id', $student->id)
            ->where('status', 'approved')
            ->sum('amount');

        $effectiveBalance = max(0, $balance - $promissoryAmount);

        return [
            'total_fees'       => (float) $totalFees,
            'total_paid'       => (float) $totalPaid,
            'discount_amount'  => (float) $totalDiscount,
            'balance'          => (float) $balance,
            'effective_balance'=> (float) $effectiveBalance,
            'has_promissory'   => $promissoryAmount > 0,
            'is_fully_paid'    => $balance <= 0,
        ];
    }

    /**
     * Calculate total fees applicable to a student.
     */
    private function calculateTotalFees(Student $student, string $schoolYear): float
    {
        $assignedIds = FeeItemAssignment::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where(function ($q) use ($student) {
                if ($student->classification) {
                    $q->where('classification', $student->classification);
                }
                if ($student->department_id) {
                    $q->orWhere('department_id', $student->department_id);
                }
                if ($student->year_level_id) {
                    $q->orWhere('year_level_id', $student->year_level_id);
                }
            })
            ->pluck('fee_item_id')
            ->toArray();

        $allScopeIds = FeeItem::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where('assignment_scope', 'all')
            ->pluck('id')
            ->toArray();

        $ids = array_unique(array_merge($assignedIds, $allScopeIds));

        return (float) FeeItem::whereIn('id', $ids)
            ->where('is_active', true)
            ->sum('selling_price');
    }
}
