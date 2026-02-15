<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_year',
        'exam_type',
        'term',
        'status',
        'required_amount',
        'paid_amount',
        'remarks',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'required_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    /**
     * Available exam types.
     */
    public const EXAM_TYPES = [
        'quarterly' => 'Quarterly Exam',
        'midterm' => 'Midterm Exam',
        'finals' => 'Final Exam',
        'prelim' => 'Preliminary Exam',
    ];

    /**
     * Available terms.
     */
    public const TERMS = [
        '1st_quarter' => '1st Quarter',
        '2nd_quarter' => '2nd Quarter',
        '3rd_quarter' => '3rd Quarter',
        '4th_quarter' => '4th Quarter',
        '1st_semester' => '1st Semester',
        '2nd_semester' => '2nd Semester',
    ];

    /**
     * Get the student for this approval.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who approved.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if student can be approved (paid overdue amount).
     */
    public function canBeApproved(): bool
    {
        return $this->paid_amount >= $this->required_amount;
    }

    /**
     * Get the remaining amount.
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, (float) $this->required_amount - (float) $this->paid_amount);
    }

    /**
     * Approve the exam.
     */
    public function approve(int $userId): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
     * Deny the exam approval.
     */
    public function deny(int $userId, ?string $remarks = null): bool
    {
        $this->update([
            'status' => 'denied',
            'approved_by' => $userId,
            'approved_at' => now(),
            'remarks' => $remarks ?? $this->remarks,
        ]);

        return true;
    }

    /**
     * Scope for pending approvals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for a specific school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    /**
     * Scope for a specific exam type.
     */
    public function scopeForExamType($query, string $examType)
    {
        return $query->where('exam_type', $examType);
    }
}
