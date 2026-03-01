<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'classification',
        'name',
        'code',
        'level',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Auto-generate code from name when not provided.
     */
    protected static function booted(): void
    {
        static::creating(function (Department $department) {
            if (empty($department->code)) {
                $base = strtoupper(substr(str_replace(' ', '', $department->name ?? ''), 0, 4));
                $department->code = $base . '_' . uniqid();
            }
        });
    }

    /**
     * Programs under this department (college)
     */
    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    /**
     * Teachers in this department
     */
    public function teachers(): HasMany
    {
        return $this->hasMany(Teacher::class);
    }

    /**
     * Year levels under this department
     */
    public function yearLevels(): HasMany
    {
        return $this->hasMany(YearLevel::class)->orderBy('level_number');
    }

    /**
     * Sections under this department
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Students enrolled in this department
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Scope for K-12 departments only
     */
    public function scopeK12($query)
    {
        return $query->where('classification', 'K-12');
    }

    /**
     * Scope for College departments only
     */
    public function scopeCollege($query)
    {
        return $query->where('classification', 'College');
    }

    /**
     * Scope for active departments only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if department is Senior High School
     */
    public function isSeniorHighSchool(): bool
    {
        return $this->classification === 'K-12' && 
               (str_contains(strtolower($this->name), 'senior') || $this->code === 'SHS');
    }
}
