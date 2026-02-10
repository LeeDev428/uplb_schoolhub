<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LibraryBook extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'isbn',
        'title',
        'author',
        'publisher',
        'publication_year',
        'category',
        'shelf_location',
        'quantity',
        'available_quantity',
        'description',
        'cover_image',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'quantity' => 'integer',
        'available_quantity' => 'integer',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(LibraryTransaction::class, 'book_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('available_quantity', '>', 0);
    }
}
