<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class OnlineTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'student_payment_id',
        'transaction_id',
        'payment_method',
        'amount',
        'status',
        'reference_number',
        'account_name',
        'account_number',
        'payment_proof',
        'transaction_date',
        'verified_at',
        'verified_by',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the student.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the associated payment record.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(StudentPayment::class, 'student_payment_id');
    }

    /**
     * Get the user who verified the transaction.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Check if transaction is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Verify and complete the transaction.
     */
    public function verify(int $userId): void
    {
        $this->update([
            'status' => 'completed',
            'verified_at' => now(),
            'verified_by' => $userId,
        ]);
    }

    /**
     * Mark transaction as failed.
     */
    public function markFailed(?string $remarks = null): void
    {
        $this->update([
            'status' => 'failed',
            'remarks' => $remarks ?? $this->remarks,
        ]);
    }

    /**
     * Refund the transaction.
     */
    public function refund(?string $remarks = null): void
    {
        $this->update([
            'status' => 'refunded',
            'remarks' => $remarks ?? $this->remarks,
        ]);
    }

    /**
     * Get the payment proof URL.
     */
    public function getPaymentProofUrlAttribute(): ?string
    {
        if (!$this->payment_proof) {
            return null;
        }
        
        return Storage::url($this->payment_proof);
    }

    /**
     * Generate unique transaction ID.
     */
    public static function generateTransactionId(): string
    {
        return 'TXN-' . strtoupper(uniqid()) . '-' . now()->format('ymd');
    }

    /**
     * Scope for pending transactions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for a specific payment method.
     */
    public function scopeForPaymentMethod($query, string $method)
    {
        return $query->where('payment_method', $method);
    }
}
