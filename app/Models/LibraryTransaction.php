<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'student_id',
        'librarian_id',
        'transaction_type',
        'borrow_date',
        'due_date',
        'return_date',
        'status',
        'penalty_amount',
        'penalty_paid',
        'notes',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'penalty_amount' => 'decimal:2',
        'penalty_paid' => 'boolean',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function librarian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'librarian_id');
    }

    public function calculatePenalty(): void
    {
        if ($this->status === 'overdue' && !$this->return_date) {
            $daysOverdue = now()->diffInDays($this->due_date);
            $this->penalty_amount = $daysOverdue * 5; // 5 per day
            $this->save();
        }
    }
}
