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
        'payment_method',
        'reference_number',
        'bank_name',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Available payment methods.
     */
    public const PAYMENT_METHODS = [
        'cash' => 'Cash',
        'gcash' => 'GCash',
        'bank' => 'Bank Transfer',
        'other' => 'Other',
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
     * Get the online transaction associated with this payment.
     */
    public function onlineTransaction()
    {
        return $this->hasOne(OnlineTransaction::class);
    }

    /**
     * Get the payment method label.
     */
    public function getPaymentMethodLabelAttribute(): string
    {
        return self::PAYMENT_METHODS[$this->payment_method] ?? $this->payment_method;
    }

    /**
     * Scope for a specific payment method.
     */
    public function scopeForPaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope for cash payments.
     */
    public function scopeCash($query)
    {
        return $query->where('payment_method', 'cash');
    }

    /**
     * Scope for GCash payments.
     */
    public function scopeGcash($query)
    {
        return $query->where('payment_method', 'gcash');
    }

    /**
     * Scope for bank payments.
     */
    public function scopeBank($query)
    {
        return $query->where('payment_method', 'bank');
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
