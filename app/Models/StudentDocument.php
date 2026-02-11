<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentDocument extends Model
{
    protected $fillable = [
        'student_id',
        'requirement_id',
        'file_path',
        'original_filename',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'reviewer_notes',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = ['status_badge'];

    /**
     * Get the student who submitted the document
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the requirement this document fulfills
     */
    public function requirement(): BelongsTo
    {
        return $this->belongsTo(Requirement::class);
    }

    /**
     * Get the reviewer who approved/rejected the document
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope for pending documents
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved documents
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected documents
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Get status badge variant
     */
    public function getStatusBadgeAttribute(): array
    {
        return match ($this->status) {
            'pending' => ['label' => 'Pending', 'variant' => 'secondary'],
            'approved' => ['label' => 'Approved', 'variant' => 'default'],
            'rejected' => ['label' => 'Rejected', 'variant' => 'destructive'],
            default => ['label' => 'Unknown', 'variant' => 'outline'],
        };
    }

    /**
     * Get file size in human-readable format
     */
    public function getFileSizeAttribute(): string
    {
        if (!file_exists(storage_path('app/public/' . $this->file_path))) {
            return 'N/A';
        }
        $bytes = filesize(storage_path('app/public/' . $this->file_path));
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
