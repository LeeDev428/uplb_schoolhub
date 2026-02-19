<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentFeeItem extends Model
{
    protected $fillable = [
        'category',
        'name',
        'price',
        'students_availed',
        'processing_days',
        'processing_type',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'processing_days' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Scope a query to only include active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by processing type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('processing_type', $type);
    }

    /**
     * Get unique categories.
     */
    public static function getCategories()
    {
        return self::distinct()->pluck('category');
    }
}
