<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * All available target roles for announcements.
     */
    public const AVAILABLE_ROLES = [
        'registrar',
        'accounting', 
        'student',
        'teacher',
        'parent',
        'guidance',
        'librarian',
        'clinic',
        'canteen',
    ];

    protected $fillable = [
        'title',
        'content',
        'priority',
        'target_audience',
        'target_roles',
        'department_id',
        'created_by',
        'published_at',
        'expires_at',
        'is_pinned',
        'is_active',
        'attachment_path',
        'attachment_name',
        'attachment_type',
        'image_path',
        'image_name',
        'image_type',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_pinned' => 'boolean',
        'is_active' => 'boolean',
        'target_roles' => 'array',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeForAudience($query, string $audience)
    {
        return $query->where(function ($q) use ($audience) {
            $q->where('target_audience', 'all')
                ->orWhere('target_audience', $audience);
        });
    }

    /**
     * Scope to filter announcements by role using target_roles JSON field.
     */
    public function scopeForRole($query, string $role)
    {
        return $query->where(function ($q) use ($role) {
            $q->whereJsonContains('target_roles', $role)
                ->orWhere('target_audience', 'all');
        });
    }

    /**
     * Check if this announcement is targeted at a specific role.
     */
    public function isForRole(string $role): bool
    {
        if ($this->target_audience === 'all') {
            return true;
        }
        
        return in_array($role, $this->target_roles ?? []);
    }
}
