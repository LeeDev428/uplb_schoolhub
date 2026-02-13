<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollmentHistory extends Model
{
    protected $fillable = [
        'student_id',
        'school_year',
        'status',
        'enrolled_at',
        'enrolled_by',
        'program',
        'year_level',
        'section',
        'remarks',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    /**
     * Get the student this history belongs to.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who enrolled the student.
     */
    public function enrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolled_by');
    }

    /**
     * Get formatted status.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'officially_enrolled' => 'Officially Enrolled',
            'pending' => 'Pending',
            'dropped' => 'Dropped',
            'graduated' => 'Graduated',
            'transferred' => 'Transferred',
            default => ucfirst(str_replace('_', ' ', $this->status)),
        };
    }
}
