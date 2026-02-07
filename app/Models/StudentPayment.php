<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'student_fee_id',
        'payment_date',
        'or_number',
        'amount',
        'payment_for',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the student that owns the payment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the fee record this payment belongs to.
     */
    public function studentFee(): BelongsTo
    {
        return $this->belongsTo(StudentFee::class);
    }

    /**
     * Get the user who recorded this payment.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * Boot method to automatically update balance when payment is saved/deleted.
     */
    protected static function booted(): void
    {
        static::saved(function (StudentPayment $payment) {
            $payment->studentFee->updateBalance();
        });

        static::deleted(function (StudentPayment $payment) {
            $payment->studentFee->updateBalance();
        });
    }
}
