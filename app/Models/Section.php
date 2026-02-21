<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    protected $fillable = [
        'department_id',
        'year_level_id',
        'strand_id',
        'teacher_id',
        'name',
        'code',
        'capacity',
        'room_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'capacity' => 'integer',
    ];

    /**
     * Teacher (adviser/homeroom) assigned to this section
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /**
     * Department this section belongs to
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Year level this section belongs to
     */
    public function yearLevel(): BelongsTo
    {
        return $this->belongsTo(YearLevel::class);
    }

    /**
     * Strand for this section (SHS only)
     */
    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    /**
     * Students in this section
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Scope for active sections
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific department
     */
    public function scopeForDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope for specific year level
     */
    public function scopeForYearLevel($query, $yearLevelId)
    {
        return $query->where('year_level_id', $yearLevelId);
    }

    /**
     * Scope for specific strand
     */
    public function scopeForStrand($query, $strandId)
    {
        return $query->where('strand_id', $strandId);
    }

    /**
     * Get full section display name with department and year level
     */
    public function getFullNameAttribute(): string
    {
        $name = $this->name;
        
        if ($this->yearLevel) {
            $name = "{$this->yearLevel->name} - {$name}";
        }
        
        if ($this->strand) {
            $name .= " ({$this->strand->code})";
        }
        
        return $name;
    }
}
