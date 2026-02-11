<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicDeadline extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'classification',
        'deadline_date',
        'deadline_time',
        'applies_to',
        'is_active',
        'send_reminder',
        'reminder_days_before',
    ];

    protected $casts = [
        'deadline_date' => 'date',
        'is_active' => 'boolean',
        'send_reminder' => 'boolean',
    ];

    /**
     * Get the requirements associated with this deadline.
     */
    public function requirements(): HasMany
    {
        return $this->hasMany(Requirement::class, 'deadline_id');
    }

    /**
     * Get formatted deadline display text.
     */
    public function getDeadlineDisplayAttribute(): string
    {
        $date = $this->deadline_date->format('M d, Y');
        $time = $this->deadline_time ? ' at ' . $this->deadline_time : '';
        return $date . $time;
    }
}
