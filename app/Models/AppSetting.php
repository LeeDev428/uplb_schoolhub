<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AppSetting extends Model
{
    protected $fillable = [
        'app_name',
        'logo_path',
        'favicon_path',
        'primary_color',
        'secondary_color',
        'has_k12',
        'has_college',
    ];

    protected $casts = [
        'has_k12' => 'boolean',
        'has_college' => 'boolean',
    ];

    /**
     * Get the singleton settings instance.
     */
    public static function current(): self
    {
        return self::firstOrCreate([], [
            'app_name' => 'School Management System',
            'primary_color' => '#1d4ed8',
            'secondary_color' => '#64748b',
            'has_k12' => true,
            'has_college' => true,
        ]);
    }

    /**
     * Get public URL for logo.
     */
    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }

    /**
     * Get public URL for favicon.
     */
    public function getFaviconUrlAttribute(): ?string
    {
        return $this->favicon_path ? Storage::url($this->favicon_path) : null;
    }
}
