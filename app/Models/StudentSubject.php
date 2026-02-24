<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentSubject extends Model
{
    protected $fillable = [
        'student_id',
        'subject_id',
        'school_year',
        'semester',
        'status',
        'grade',
    ];

    protected $casts = [
        'grade'    => 'decimal:2',
        'semester' => 'integer',
    ];

    // ── Relationships ─────────────────────────────────────────────────────

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
