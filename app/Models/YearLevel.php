<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class YearLevel extends Model
{
    protected $fillable = [
        'department_id',
        'classification',
        'name',
        'level_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level_number' => 'integer',
    ];

    /**
     * Department this year level belongs to
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Sections under this year level
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Strands available for this year level (SHS only)
     */
    public function strands(): BelongsToMany
    {
        return $this->belongsToMany(Strand::class)->withTimestamps();
    }

    /**
     * Students in this year level
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Scope for K-12 year levels
     */
    public function scopeK12($query)
    {
        return $query->where('classification', 'K-12');
    }

    /**
     * Scope for College year levels
     */
    public function scopeCollege($query)
    {
        return $query->where('classification', 'College');
    }

    /**
     * Scope for active year levels
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
}
