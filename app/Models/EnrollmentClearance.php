<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentClearance extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'requirements_complete_percentage',
        'requirements_complete',
        'requirements_completed_at',
        'requirements_completed_by',
        'registrar_clearance',
        'registrar_cleared_at',
        'registrar_cleared_by',
        'registrar_notes',
        'accounting_clearance',
        'accounting_cleared_at',
        'accounting_cleared_by',
        'accounting_notes',
        'official_enrollment',
        'officially_enrolled_at',
        'officially_enrolled_by',
        'enrollment_status',
    ];

    protected $casts = [
        'requirements_complete' => 'boolean',
        'requirements_completed_at' => 'datetime',
        'registrar_clearance' => 'boolean',
        'registrar_cleared_at' => 'datetime',
        'accounting_clearance' => 'boolean',
        'accounting_cleared_at' => 'datetime',
        'official_enrollment' => 'boolean',
        'officially_enrolled_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requirementsCompletedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requirements_completed_by');
    }

    public function registrarClearedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrar_cleared_by');
    }

    public function accountingClearedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accounting_cleared_by');
    }

    public function officiallyEnrolledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'officially_enrolled_by');
    }

    // Helper methods
    public function getOverallProgressAttribute(): int
    {
        $completed = 0;
        if ($this->requirements_complete) $completed++;
        if ($this->registrar_clearance) $completed++;
        if ($this->accounting_clearance) $completed++;
        if ($this->official_enrollment) $completed++;
        
        return (int) round(($completed / 4) * 100);
    }

    public function isFullyCleared(): bool
    {
        return $this->requirements_complete && 
               $this->registrar_clearance && 
               $this->accounting_clearance && 
               $this->official_enrollment;
    }
}

