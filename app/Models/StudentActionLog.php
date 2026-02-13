<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentActionLog extends Model
{
    protected $fillable = [
        'student_id',
        'performed_by',
        'action',
        'action_type',
        'details',
        'notes',
        'changes',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    /**
     * Get the student this log belongs to.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Create a log entry for a student action.
     */
    public static function log(
        int $studentId,
        string $action,
        string $actionType = 'general',
        ?string $details = null,
        ?string $notes = null,
        ?array $changes = null,
        ?int $performedBy = null
    ): self {
        return self::create([
            'student_id' => $studentId,
            'performed_by' => $performedBy ?? auth()->id(),
            'action' => $action,
            'action_type' => $actionType,
            'details' => $details,
            'notes' => $notes,
            'changes' => $changes,
        ]);
    }
}
