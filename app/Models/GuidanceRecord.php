<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuidanceRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'counselor_id',
        'record_type',
        'title',
        'description',
        'action_taken',
        'recommendations',
        'severity',
        'status',
        'incident_date',
        'follow_up_date',
        'is_confidential',
    ];

    protected $casts = [
        'incident_date' => 'date',
        'follow_up_date' => 'date',
        'is_confidential' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }
}
