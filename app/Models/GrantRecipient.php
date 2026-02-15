<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GrantRecipient extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'grant_id',
        'school_year',
        'discount_amount',
        'status',
        'notes',
        'assigned_by',
        'assigned_at',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'assigned_at' => 'datetime',
    ];

    /**
     * Get the student who received the grant.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the grant.
     */
    public function grant(): BelongsTo
    {
        return $this->belongsTo(Grant::class);
    }

    /**
     * Get the user who assigned the grant.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Scope for active recipients.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for a specific school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where('school_year', $schoolYear);
    }

    /**
     * Scope for a specific student.
     */
    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Boot method to set default values.
     */
    protected static function booted(): void
    {
        static::creating(function (GrantRecipient $recipient) {
            if (!$recipient->assigned_at) {
                $recipient->assigned_at = now();
            }
        });
    }
}
