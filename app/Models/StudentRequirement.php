<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'requirement_id',
        'status',
        'submitted_at',
        'approved_at',
        'notes',
        'file_path',
        'approved_by',
    ];

    protected $casts = [
        'submitted_at' => 'date',
        'approved_at' => 'date',
    ];

    /**
     * Get the student for this requirement
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the requirement
     */
    public function requirement(): BelongsTo
    {
        return $this->belongsTo(Requirement::class);
    }

    /**
     * Get the user who approved
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope for pending requirements
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for submitted requirements
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope for approved requirements
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for overdue requirements
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    /**
     * Get status color
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'approved' => 'success',
            'submitted' => 'info',
            'pending' => 'warning',
            'rejected' => 'danger',
            'overdue' => 'danger',
            default => 'secondary',
        };
    }

    /**
     * Get status badge text
     */
    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'approved' => 'Complete',
            'submitted' => 'Submitted',
            'pending' => 'Pending',
            'rejected' => 'Rejected',
            'overdue' => 'Overdue',
            default => 'Unknown',
        };
    }
}
