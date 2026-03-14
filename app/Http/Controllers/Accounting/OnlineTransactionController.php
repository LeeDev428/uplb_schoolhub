<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\OnlineTransaction;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnlineTransactionController extends Controller
{
    /**
     * Display a listing of online transactions.
     */
    public function index(Request $request): Response
    {
        $query = OnlineTransaction::with(['student', 'payment', 'verifiedBy']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($sq) use ($search) {
                      $sq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('lrn', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by payment method
        if ($paymentMethod = $request->input('payment_method')) {
            $query->where('payment_method', $paymentMethod);
        }

        // Filter by date range
        if ($from = $request->input('from')) {
            $query->whereDate('transaction_date', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('transaction_date', '<=', $to);
        }

        $transactions = $query->latest('transaction_date')->paginate(20)->withQueryString();

        // Transform for frontend
        $transactions->through(function ($transaction) {
            return [
                'id' => $transaction->id,
                'student_id' => $transaction->student_id,
                'transaction_reference' => $transaction->transaction_id,
                'payment_provider' => $transaction->payment_method,
                'amount' => $transaction->amount,
                'fee' => '0.00',
                'net_amount' => $transaction->amount,
                'status' => $transaction->status,
                'provider_reference' => $transaction->reference_number,
                'provider_status' => null,
                'payment_details' => null,
                'payment_proof_url' => $transaction->payment_proof_url,
                'verified_at' => $transaction->verified_at,
                'failed_at' => null,
                'refunded_at' => null,
                'failure_reason' => null,
                'remarks' => $transaction->remarks,
                'or_number' => $transaction->payment?->or_number,
                'created_at' => $transaction->created_at,
                'student' => $transaction->student ? [
                    'id' => $transaction->student->id,
                    'full_name' => $transaction->student->full_name,
                    'lrn' => $transaction->student->lrn,
                    'email' => $transaction->student->email ?? null,
                ] : null,
                'verified_by' => $transaction->verifiedBy ? ['name' => $transaction->verifiedBy->name] : null,
            ];
        });

        // Stats
        $stats = [
            'pending' => OnlineTransaction::pending()->count(),
            'verified' => OnlineTransaction::completed()->count(),
            'total_pending_amount' => OnlineTransaction::pending()->sum('amount'),
            'total_verified_today' => OnlineTransaction::completed()->whereDate('verified_at', today())->sum('amount'),
        ];
        
        // Providers
        $providers = [
            'gcash' => 'GCash',
            'bank' => 'Bank Transfer',
            'card' => 'Credit/Debit Card',
            'other' => 'Other',
        ];

        return Inertia::render($this->viewPrefix() . '/online-transactions/index', [
            'transactions' => $transactions,
            'providers' => $providers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'payment_method', 'from', 'to']),
        ]);
    }

    /**
     * Verify a transaction and create payment record.
     */
    public function verify(Request $request, OnlineTransaction $transaction): RedirectResponse
    {
        if (!$transaction->isPending()) {
            return redirect()->back()->with('error', 'Transaction is not pending.');
        }

        $validated = $request->validate([
            'or_number' => 'nullable|string|max:100',
        ]);

        // Create payment record for the student's billing school year.
        $student = Student::find($transaction->student_id);
        $currentSchoolYear = $student?->school_year
            ?: (\App\Models\AppSetting::current()->school_year
                ?? now()->year . '-' . (now()->year + 1));

        $studentFee = StudentFee::where('student_id', $transaction->student_id)
            ->where('school_year', $currentSchoolYear)
            ->first();

        if (!$studentFee) {
            // Create a placeholder StudentFee in the billing year so payment linkage stays consistent.
            $studentFee = StudentFee::create([
                'student_id'   => $transaction->student_id,
                'school_year'  => $currentSchoolYear,
                'total_amount' => $transaction->amount,
                'total_paid'   => 0,
                'grant_discount' => 0,
                'balance'      => $transaction->amount,
            ]);
        }

        $orNumber = $validated['or_number'] ?? ('OT-' . $transaction->transaction_id);
        $rawMethod = strtolower((string) ($transaction->payment_method ?? 'cash'));
        $paymentMode = match ($rawMethod) {
            'gcash' => 'GCASH',
            'bank', 'bank_transfer' => 'BANK',
            default => 'CASH',
        };
        // Map to valid payment_method enum values (cash, gcash, bank, other)
        $paymentMethod = $rawMethod;
        if ($paymentMethod === 'bank_transfer') {
            $paymentMethod = 'bank';
        }
        if (!in_array($paymentMethod, ['cash', 'gcash', 'bank', 'other'])) {
            $paymentMethod = 'other';
        }

        $payment = StudentPayment::create([
            'student_id' => $transaction->student_id,
            'student_fee_id' => $studentFee->id,
            'payment_date' => $transaction->transaction_date,
            'or_number' => $orNumber,
            'amount' => $transaction->amount,
            'payment_for' => 'tuition',
            'payment_mode' => $paymentMode,
            'payment_method' => $paymentMethod,
            'reference_number' => $transaction->reference_number,
            'bank_name' => $paymentMode === 'BANK' ? $transaction->bank_name : null,
            'notes' => 'Online transaction: ' . $transaction->transaction_id,
            'recorded_by' => auth()->user()?->id,
        ]);

        // Update student fee balance
        $studentFee->updateBalance();

        // Update transaction
        $transaction->update([
            'student_payment_id' => $payment->id,
            'status' => 'completed',
            'verified_at' => now(),
            'verified_by' => auth()->user()?->id,
        ]);

        return redirect()->back()->with('success', 'Transaction verified and payment recorded.');
    }

    /**
     * Mark a transaction as failed.
     */
    public function markFailed(Request $request, OnlineTransaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string',
        ]);

        $transaction->markFailed($validated['remarks'] ?? null);

        return redirect()->back()->with('success', 'Transaction marked as failed.');
    }

    /**
     * Refund a transaction.
     */
    public function refund(Request $request, OnlineTransaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string',
        ]);

        $transaction->refund($validated['remarks'] ?? null);

        return redirect()->back()->with('success', 'Transaction refunded.');
    }

    /**
     * Delete a transaction.
     */
    public function destroy(OnlineTransaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return redirect()->back()->with('success', 'Transaction deleted successfully.');
    }
}
