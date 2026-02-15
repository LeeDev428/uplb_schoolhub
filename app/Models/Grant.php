<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'value',
        'school_year',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the recipients of this grant.
     */
    public function recipients(): HasMany
    {
        return $this->hasMany(GrantRecipient::class);
    }

    /**
     * Get active recipients of this grant.
     */
    public function activeRecipients(): HasMany
    {
        return $this->hasMany(GrantRecipient::class)->where('status', 'active');
    }

    /**
     * Calculate discount amount for a given total.
     */
    public function calculateDiscount(float $totalAmount): float
    {
        if ($this->type === 'fixed') {
            return min((float) $this->value, $totalAmount);
        }
        
        // Percentage discount
        return $totalAmount * ((float) $this->value / 100);
    }

    /**
     * Get formatted value with type indicator.
     */
    public function getFormattedValueAttribute(): string
    {
        if ($this->type === 'percentage') {
            return number_format($this->value, 2) . '%';
        }
        
        return '₱' . number_format($this->value, 2);
    }

    /**
     * Scope for active grants.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
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
}
