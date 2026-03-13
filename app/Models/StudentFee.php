<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_year',
        'registration_fee',
        'tuition_fee',
        'misc_fee',
        'books_fee',
        'other_fees',
        'total_amount',
        'total_paid',
        'balance',
        'is_overdue',
        'due_date',
        'grant_discount',
        'payment_status',
        'carried_forward_balance',
        'carried_forward_from',
    ];

    protected $casts = [
        'registration_fee' => 'decimal:2',
        'tuition_fee' => 'decimal:2',
        'misc_fee' => 'decimal:2',
        'books_fee' => 'decimal:2',
        'other_fees' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'is_overdue' => 'boolean',
        'due_date' => 'date',
        'grant_discount' => 'decimal:2',
        'carried_forward_balance' => 'decimal:2',
    ];

    /**
     * Get the student that owns the fee record.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get all payments for this fee record.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(StudentPayment::class);
    }

    /**
     * Get all promissory notes for this fee record.
     */
    public function promissoryNotes(): HasMany
    {
        return $this->hasMany(PromissoryNote::class);
    }

    /**
     * Calculate and update the balance.
     */
    public function updateBalance(): void
    {
        $this->total_paid = $this->payments()->sum('amount');
        $this->balance = max(0, (float) $this->total_amount - (float) $this->grant_discount - $this->total_paid);

        // Once any payment is made, or balance is fully settled, the account is no longer overdue.
        if ($this->total_paid > 0 || $this->balance <= 0) {
            $this->is_overdue = false;
        }

        $this->payment_status = $this->is_overdue
            ? 'overdue'
            : ($this->balance <= 0 ? 'paid' : ($this->total_paid > 0 ? 'partial' : 'unpaid'));

        $this->save();
    }

    /**
     * Sync overdue flags from due dates.
     * Rule: if due_date is today/past and balance > 0, mark as overdue.
     * This intentionally includes partial balances; overdue is cleared when a payment is posted.
     */
    public static function syncOverdueByDueDate(?string $schoolYear = null): void
    {
        $today = now()->toDateString();

        static::query()
            ->when($schoolYear, fn($q) => $q->where('school_year', $schoolYear))
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<=', $today)
            ->where('balance', '>', 0)
            // Overdue is auto-applied only to unpaid balances. Once a payment exists,
            // account stays partial unless accounting manually marks overdue again.
            ->where('total_paid', '<=', 0)
            ->update([
                'is_overdue' => true,
                'payment_status' => 'overdue',
            ]);
    }

    /**
     * Check if fully paid.
     */
    public function isFullyPaid(): bool
    {
        return $this->balance <= 0;
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatus(): string
    {
        if ($this->is_overdue) {
            return 'overdue';
        }
        // If no fees have been set yet, show as unpaid
        if ($this->total_amount <= 0) {
            return 'unpaid';
        }
        if ($this->balance <= 0) {
            return 'paid';
        } elseif ($this->total_paid > 0) {
            return 'partial';
        } else {
            return 'unpaid';
        }
    }

    /**
     * Mark as overdue.
     */
    public function markOverdue(): void
    {
        $this->update([
            'is_overdue' => true,
            'payment_status' => 'overdue',
        ]);
    }

    /**
     * Clear overdue status.
     */
    public function clearOverdue(): void
    {
        $this->update([
            'is_overdue' => false,
            'payment_status' => $this->balance <= 0 ? 'paid' : ($this->total_paid > 0 ? 'partial' : 'unpaid'),
        ]);
    }

    /**
     * Apply grant discount.
     * total_amount is always the RAW fee total; balance = total_amount - grant_discount - total_paid.
     */
    public function applyGrantDiscount(float $discount): void
    {
        $this->grant_discount = $discount;
        $this->balance = max(0, (float) $this->total_amount - $discount - (float) $this->total_paid);
        $this->save();
    }

    /**
     * Scope for overdue fees.
     */
    public function scopeOverdue($query)
    {
        return $query->where('is_overdue', true);
    }

    /**
     * Scope for a specific payment status.
     */
    public function scopeWithPaymentStatus($query, string $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope for a specific school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    /**
     * Get grant recipients for this student fee's student.
     */
    public function grantRecipients()
    {
        return GrantRecipient::where('student_id', $this->student_id)
            ->where('school_year', $this->school_year)
            ->where('status', 'active')
            ->with('grant')
            ->get();
    }
}
