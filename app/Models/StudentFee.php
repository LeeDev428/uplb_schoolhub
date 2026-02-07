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
        if ($this->balance <= 0) {
            return 'paid';
        } elseif ($this->total_paid > 0) {
            return 'partial';
        } else {
            return 'unpaid';
        }
    }
}
