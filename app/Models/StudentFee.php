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
     * Calculate and update the balance.
     */
    public function updateBalance(): void
    {
        $this->total_paid = $this->payments()->sum('amount');
        $this->balance = $this->total_amount - $this->total_paid;
        $this->save();
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
     */
    public function applyGrantDiscount(float $discount): void
    {
        $this->grant_discount = $discount;
        $this->total_amount = max(0, (float) $this->total_amount - $discount);
        $this->balance = max(0, (float) $this->total_amount - (float) $this->total_paid);
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
