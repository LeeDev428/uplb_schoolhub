<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'document_type',
        'copies',
        'purpose',
        'status',
        'fee',
        'is_paid',
        'or_number',
        'request_date',
        'release_date',
        'remarks',
        'processed_by',
        'released_by',
        // New fields
        'document_fee_item_id',
        'processing_type',
        'processing_days',
        'receipt_file_path',
        'receipt_number',
        'registrar_status',
        'registrar_approved_by',
        'registrar_approved_at',
        'registrar_remarks',
        'accounting_status',
        'accounting_approved_by',
        'accounting_approved_at',
        'accounting_remarks',
        'expected_completion_date',
    ];

    protected $casts = [
        'copies' => 'integer',
        'fee' => 'decimal:2',
        'is_paid' => 'boolean',
        'request_date' => 'date',
        'release_date' => 'date',
        'processing_days' => 'integer',
        'registrar_approved_at' => 'datetime',
        'accounting_approved_at' => 'datetime',
        'expected_completion_date' => 'date',
    ];

    /**
     * Available document types.
     */
    public const DOCUMENT_TYPES = [
        'transcript' => 'Transcript of Records',
        'certificate_good_moral' => 'Certificate of Good Moral',
        'certificate_enrollment' => 'Certificate of Enrollment',
        'certificate_completion' => 'Certificate of Completion',
        'honorable_dismissal' => 'Honorable Dismissal',
        'diploma' => 'Diploma',
        'form_137' => 'Form 137',
        'form_138' => 'Form 138/Report Card',
        'cav' => 'CAV (Certification, Authentication, Verification)',
        'other' => 'Other',
    ];

    /**
     * Get the student who requested the document.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the document fee item.
     */
    public function documentFeeItem(): BelongsTo
    {
        return $this->belongsTo(DocumentFeeItem::class);
    }

    /**
     * Get the user who approved at registrar.
     */
    public function registrarApprovedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrar_approved_by');
    }

    /**
     * Get the user who approved at accounting.
     */
    public function accountingApprovedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accounting_approved_by');
    }

    /**
     * Get the user who processed the request.
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the user who released the document.
     */
    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    /**
     * Get the document type label.
     */
    public function getDocumentTypeLabelAttribute(): string
    {
        return self::DOCUMENT_TYPES[$this->document_type] ?? $this->document_type;
    }

    /**
     * Get total fee (fee × copies).
     */
    public function getTotalFeeAttribute(): float
    {
        return (float) $this->fee * $this->copies;
    }

    /**
     * Mark as paid.
     */
    public function markAsPaid(string $orNumber): void
    {
        $this->update([
            'is_paid' => true,
            'or_number' => $orNumber,
        ]);
    }

    /**
     * Process the request.
     */
    public function process(int $userId): void
    {
        $this->update([
            'status' => 'processing',
            'processed_by' => $userId,
        ]);
    }

    /**
     * Mark as ready for release.
     */
    public function markReady(): void
    {
        $this->update(['status' => 'ready']);
    }

    /**
     * Release the document.
     */
    public function release(int $userId): void
    {
        $this->update([
            'status' => 'released',
            'release_date' => now(),
            'released_by' => $userId,
        ]);
    }

    /**
     * Cancel the request.
     */
    public function cancel(?string $remarks = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'remarks' => $remarks ?? $this->remarks,
        ]);
    }

    /**
     * Scope for pending requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for processing requests.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope for ready requests.
     */
    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    /**
     * Scope for unpaid requests.
     */
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }

    /**
     * Scope for requests awaiting registrar approval.
     */
    public function scopeAwaitingRegistrar($query)
    {
        return $query->where('registrar_status', 'pending');
    }

    /**
     * Scope for requests awaiting accounting approval.
     */
    public function scopeAwaitingAccounting($query)
    {
        return $query->where('registrar_status', 'approved')
            ->where('accounting_status', 'pending');
    }

    /**
     * Scope for fully approved requests.
     */
    public function scopeFullyApproved($query)
    {
        return $query->where('registrar_status', 'approved')
            ->where('accounting_status', 'approved');
    }

    /**
     * Get the current approval stage.
     */
    public function getApprovalStageAttribute(): string
    {
        if ($this->registrar_status === 'rejected' || $this->accounting_status === 'rejected') {
            return 'rejected';
        }
        if ($this->registrar_status === 'pending') {
            return 'awaiting_registrar';
        }
        if ($this->accounting_status === 'pending') {
            return 'awaiting_accounting';
        }
        return 'approved';
    }

    /**
     * Approve by registrar.
     */
    public function approveByRegistrar(int $userId, ?string $remarks = null): void
    {
        $this->update([
            'registrar_status' => 'approved',
            'registrar_approved_by' => $userId,
            'registrar_approved_at' => now(),
            'registrar_remarks' => $remarks,
        ]);
    }

    /**
     * Reject by registrar.
     */
    public function rejectByRegistrar(int $userId, ?string $remarks = null): void
    {
        $this->update([
            'registrar_status' => 'rejected',
            'registrar_approved_by' => $userId,
            'registrar_approved_at' => now(),
            'registrar_remarks' => $remarks,
            'status' => 'cancelled',
        ]);
    }

    /**
     * Approve by accounting.
     */
    public function approveByAccounting(int $userId, ?string $remarks = null): void
    {
        $this->update([
            'accounting_status' => 'approved',
            'accounting_approved_by' => $userId,
            'accounting_approved_at' => now(),
            'accounting_remarks' => $remarks,
            'status' => 'processing',
            'expected_completion_date' => now()->addDays($this->processing_days),
        ]);
    }

    /**
     * Reject by accounting.
     */
    public function rejectByAccounting(int $userId, ?string $remarks = null): void
    {
        $this->update([
            'accounting_status' => 'rejected',
            'accounting_approved_by' => $userId,
            'accounting_approved_at' => now(),
            'accounting_remarks' => $remarks,
            'status' => 'cancelled',
        ]);
    }
}
