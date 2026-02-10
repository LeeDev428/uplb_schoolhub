<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LibraryBook extends Model
{
    use HasFactory, SoftDeletes;

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
        'quantity' => 'integer',
        'available_quantity' => 'integer',
        'is_available' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(LibraryTransaction::class, 'book_id');
    }

    public function updateAvailability(): void
    {
        $this->is_available = $this->available_quantity > 0;
        $this->save();
    }
}
