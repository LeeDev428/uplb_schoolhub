<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_category_id',
        'name',
        'code',
        'description',
        'cost_price',
        'selling_price',
        'school_year',
        'program',
        'year_level',
        'classification',
        'department_id',
        'program_id',
        'year_level_id',
        'section_id',
        'assignment_scope',
        'is_required',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the category this item belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(FeeCategory::class, 'fee_category_id');
    }

    /**
     * Get the department this item is assigned to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the program this item is assigned to.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Get the year level this item is assigned to.
     */
    public function yearLevel(): BelongsTo
    {
        return $this->belongsTo(YearLevel::class);
    }

    /**
     * Get the section this item is assigned to.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the profit for this item.
     */
    public function getProfitAttribute(): float
    {
        return (float) $this->selling_price - (float) $this->cost_price;
    }

    /**
     * Scope for active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for required items.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope for a specific school year.
     */
    public function scopeForSchoolYear($query, string $schoolYear)
    {
        return $query->where(function ($q) use ($schoolYear) {
            $q->where('school_year', $schoolYear)
              ->orWhereNull('school_year');
        });
    }

    /**
     * Scope for a specific program.
     */
    public function scopeForProgram($query, string $program)
    {
        return $query->where(function ($q) use ($program) {
            $q->where('program', $program)
              ->orWhereNull('program');
        });
    }

    /**
     * Scope for a specific year level.
     */
    public function scopeForYearLevel($query, string $yearLevel)
    {
        return $query->where(function ($q) use ($yearLevel) {
            $q->where('year_level', $yearLevel)
              ->orWhereNull('year_level');
        });
    }
}
