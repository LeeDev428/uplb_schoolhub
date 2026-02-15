<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the fee items for this category.
     */
    public function items(): HasMany
    {
        return $this->hasMany(FeeItem::class);
    }

    /**
     * Get active fee items for this category.
     */
    public function activeItems(): HasMany
    {
        return $this->hasMany(FeeItem::class)->where('is_active', true);
    }

    /**
     * Calculate total cost for this category.
     */
    public function getTotalCostAttribute(): float
    {
        return $this->activeItems()->sum('cost_price');
    }

    /**
     * Calculate total selling price for this category.
     */
    public function getTotalSellingAttribute(): float
    {
        return $this->activeItems()->sum('selling_price');
    }

    /**
     * Calculate total profit for this category.
     */
    public function getTotalProfitAttribute(): float
    {
        return $this->total_selling - $this->total_cost;
    }

    /**
     * Scope for active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordering by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
