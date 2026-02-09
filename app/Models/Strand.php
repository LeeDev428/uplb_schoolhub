<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Strand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Year levels that offer this strand (many-to-many)
     */
    public function yearLevels(): BelongsToMany
    {
        return $this->belongsToMany(YearLevel::class)->withTimestamps();
    }

    /**
     * Sections under this strand
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    /**
     * Students enrolled in this strand
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Scope for active strands only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
