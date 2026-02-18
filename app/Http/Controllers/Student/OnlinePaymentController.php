<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\FeeItem;
use App\Models\FeeItemAssignment;
use App\Models\OnlineTransaction;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OnlinePaymentController extends Controller
{
    /**
     * Display the online payment page.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        // Get fee items based on student's classification/department/year_level
        $feeItems = $this->getStudentFeeItems($student);

        // Get student's fee summary
        $summary = $this->getFeeSummary($student);

        // Get recent online payments
        $recentPayments = OnlineTransaction::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'reference_number' => $transaction->reference_number,
                    'amount' => (float) $transaction->amount,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'submitted_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'verified_at' => $transaction->verified_at?->format('Y-m-d H:i:s'),
                    'notes' => $transaction->notes,
                ];
            });

        // Payment methods
        $paymentMethods = [
            ['value' => 'gcash', 'label' => 'GCash'],
            ['value' => 'paymaya', 'label' => 'PayMaya'],
            ['value' => 'bank_transfer', 'label' => 'Bank Transfer'],
        ];

        return Inertia::render('student/online-payments/index', [
            'feeItems' => $feeItems,
            'summary' => $summary,
            'recentPayments' => $recentPayments,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Submit an online payment.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|in:gcash,paymaya,bank_transfer',
            'reference_number' => 'required|string|max:255',
            'receipt_image' => 'required|image|max:5120', // 5MB max
            'notes' => 'nullable|string|max:500',
        ]);

        // Store the receipt image
        $receiptPath = null;
        if ($request->hasFile('receipt_image')) {
            $receiptPath = $request->file('receipt_image')->store('online-payments/receipts', 'public');
        }

        // Create online transaction
        OnlineTransaction::create([
            'student_id' => $student->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'],
            'receipt_url' => $receiptPath,
            'notes' => $validated['notes'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Payment submitted successfully. Please wait for verification.');
    }

    /**
     * Get fee items assigned to this student based on their classification/department/year_level.
     */
    private function getStudentFeeItems(Student $student): array
    {
        $schoolYear = '2024-2025';
        
        // Get fee items from assignments
        $assignedFeeItemIds = FeeItemAssignment::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where(function ($query) use ($student) {
                // Match classification
                if ($student->classification) {
                    $query->where('classification', $student->classification);
                }
                // Match department
                if ($student->department_id) {
                    $query->where('department_id', $student->department_id);
                }
                // Match year level
                if ($student->year_level_id) {
                    $query->where('year_level_id', $student->year_level_id);
                }
            })
            ->pluck('fee_item_id')
            ->toArray();

        // Also get fee items with 'all' scope
        $allScopeFeeItems = FeeItem::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where('assignment_scope', 'all')
            ->pluck('id')
            ->toArray();

        $feeItemIds = array_unique(array_merge($assignedFeeItemIds, $allScopeFeeItems));

        return FeeItem::with('category')
            ->whereIn('id', $feeItemIds)
            ->where('is_active', true)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'amount' => (float) $item->selling_price,
                    'category' => $item->category?->name ?? 'General',
                ];
            })
            ->toArray();
    }

    /**
     * Get fee summary for the student.
     */
    private function getFeeSummary(Student $student): array
    {
        $feeItems = $this->getStudentFeeItems($student);
        $totalFees = array_sum(array_column($feeItems, 'amount'));

        // Get discount from grants
        $totalDiscount = \App\Models\GrantRecipient::where('student_id', $student->id)
            ->where('status', 'active')
            ->sum('discount_amount');

        // Get total paid (verified online transactions + regular payments)
        $totalOnlinePaid = OnlineTransaction::where('student_id', $student->id)
            ->where('status', 'verified')
            ->sum('amount');

        $totalRegularPaid = StudentPayment::whereHas('studentFee', function ($query) use ($student) {
            $query->where('student_id', $student->id);
        })->sum('amount');

        $totalPaid = $totalOnlinePaid + $totalRegularPaid;

        return [
            'total_fees' => $totalFees,
            'total_discount' => $totalDiscount,
            'total_paid' => $totalPaid,
            'balance' => max(0, $totalFees - $totalDiscount - $totalPaid),
        ];
    }
}
