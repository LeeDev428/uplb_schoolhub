<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'code',
        'name',
        'description',
        'classification',
        'units',
        'hours_per_week',
        'type',
        'year_level_id',
        'semester',
        'is_active',
    ];

    protected $casts = [
        'units' => 'decimal:1',
        'is_active' => 'boolean',
    ];

    /**
     * Get the department that owns the subject.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the year level (optional requirement).
     */
    public function yearLevel(): BelongsTo
    {
        return $this->belongsTo(YearLevel::class);
    }

    /**
     * Get the prerequisites for this subject.
     */
    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            Subject::class,
            'subject_prerequisites',
            'subject_id',
            'prerequisite_subject_id'
        );
    }

    /**
     * Get subjects that have this as a prerequisite.
     */
    public function dependentSubjects(): BelongsToMany
    {
        return $this->belongsToMany(
            Subject::class,
            'subject_prerequisites',
            'prerequisite_subject_id',
            'subject_id'
        );
    }

    /**
     * Scope to filter by department.
     */
    public function scopeByDepartment($query, $departmentId)
    {
        if ($departmentId && $departmentId !== 'all') {
            return $query->where('department_id', $departmentId);
        }
        return $query;
    }

    /**
     * Scope to filter by classification.
     */
    public function scopeByClassification($query, $classification)
    {
        if ($classification && $classification !== 'all') {
            return $query->where('classification', $classification);
        }
        return $query;
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, $status)
    {
        if ($status === 'active') {
            return $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            return $query->where('is_active', false);
        }
        return $query;
    }
}
