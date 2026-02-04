<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Requirement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'requirement_category_id',
        'name',
        'description',
        'deadline_type',
        'custom_deadline',
        'applies_to_new_enrollee',
        'applies_to_transferee',
        'applies_to_returning',
        'is_required',
        'order',
        'is_active',
    ];

    protected $casts = [
        'custom_deadline' => 'date',
        'applies_to_new_enrollee' => 'boolean',
        'applies_to_transferee' => 'boolean',
        'applies_to_returning' => 'boolean',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the category for this requirement
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(RequirementCategory::class, 'requirement_category_id');
    }

    /**
     * Get student submissions for this requirement
     */
    public function studentRequirements(): HasMany
    {
        return $this->hasMany(StudentRequirement::class);
    }

    /**
     * Scope for active requirements
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for requirements by student type
     */
    public function scopeForStudentType($query, string $studentType)
    {
        return match ($studentType) {
            'new' => $query->where('applies_to_new_enrollee', true),
            'transferee' => $query->where('applies_to_transferee', true),
            'returning' => $query->where('applies_to_returning', true),
            default => $query,
        };
    }

    /**
     * Get deadline text
     */
    public function getDeadlineTextAttribute(): string
    {
        return match ($this->deadline_type) {
            'during_enrollment' => 'During Enrollment',
            'before_classes' => 'Before Classes Start',
            'custom' => $this->custom_deadline ? $this->custom_deadline->format('M d, Y') : 'Custom',
            default => 'Not Set',
        };
    }

    /**
     * Get applies to text
     */
    public function getAppliesToTextAttribute(): string
    {
        $applies = [];
        if ($this->applies_to_new_enrollee) $applies[] = 'New Enrollee';
        if ($this->applies_to_transferee) $applies[] = 'Transferee';
        if ($this->applies_to_returning) $applies[] = 'Returning';
        
        return implode(', ', $applies);
    }
}
