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
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

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
