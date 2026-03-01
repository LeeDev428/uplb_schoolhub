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
        'school_year',
        'active_semester',
        'drop_request_deadline',
        'has_k12',
        'has_college',
        // Enrollment period settings
        'k12_enrollment_open',
        'k12_enrollment_start',
        'k12_enrollment_end',
        'college_enrollment_open',
        'college_enrollment_start',
        'college_enrollment_end',
        // Landing page
        'hero_title',
        'hero_subtitle',
        'hero_images',
        'faculty_section_title',
        'faculty_section_subtitle',
        'message_title',
        'message_content',
        'message_author',
        'message_author_title',
        'message_author_photo',
        'alumni_section_title',
        'alumni_section_subtitle',
        'alumni_items',
        'features_section_title',
        'features_section_subtitle',
        'features_show',
        'features_items',
        'footer_tagline',
        'footer_address',
        'footer_phone',
        'footer_email',
        'footer_facebook',
        'nav_links',
    ];

    protected $casts = [
        'has_k12'                  => 'boolean',
        'has_college'              => 'boolean',
        'k12_enrollment_open'      => 'boolean',
        'k12_enrollment_start'     => 'date',
        'k12_enrollment_end'       => 'date',
        'college_enrollment_open'  => 'boolean',
        'college_enrollment_start' => 'date',
        'college_enrollment_end'   => 'date',
        'features_show'            => 'boolean',
        'hero_images'              => 'array',
        'alumni_items'             => 'array',
        'features_items'           => 'array',
        'nav_links'                => 'array',
        'active_semester'           => 'integer',
        'drop_request_deadline'    => 'date',
    ];

    public static function current(): self
    {
        return self::firstOrCreate([], [
            'app_name'      => 'School Management System',
            'primary_color' => '#1d4ed8',
            'secondary_color' => '#64748b',
            'school_year'      => '2024-2025',
            'active_semester'  => 1,
            'has_k12'          => true,
            'has_college'      => true,
        ]);
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }

    public function getFaviconUrlAttribute(): ?string
    {
        return $this->favicon_path ? Storage::disk('public')->url($this->favicon_path) : null;
    }

    public function getMessageAuthorPhotoUrlAttribute(): ?string
    {
        return $this->message_author_photo ? Storage::disk('public')->url($this->message_author_photo) : null;
    }

    /** Return hero images as public URLs */
    public function getHeroImageUrlsAttribute(): array
    {
        if (empty($this->hero_images)) return [];
        return array_map(fn ($p) => Storage::disk('public')->url($p), $this->hero_images);
    }

    /** Return alumni items with resolved photo URLs */
    public function getAlumniItemsWithUrlsAttribute(): array
    {
        if (empty($this->alumni_items)) return [];
        return array_map(function ($item) {
            $item['photo_url'] = isset($item['photo_path']) ? Storage::disk('public')->url($item['photo_path']) : null;
            return $item;
        }, $this->alumni_items);
    }

    /**
     * Check if enrollment is currently open for a given classification.
     * Classification should be 'K-12' or 'College'.
     */
    public function isEnrollmentOpen(string $classification): bool
    {
        $today = now()->startOfDay();

        if (strtolower($classification) === 'k-12' || strtolower($classification) === 'k12') {
            if (!$this->k12_enrollment_open) {
                return false;
            }
            // If dates are set, check if within range
            if ($this->k12_enrollment_start && $today->lt($this->k12_enrollment_start)) {
                return false;
            }
            if ($this->k12_enrollment_end && $today->gt($this->k12_enrollment_end)) {
                return false;
            }
            return true;
        }

        if (strtolower($classification) === 'college') {
            if (!$this->college_enrollment_open) {
                return false;
            }
            if ($this->college_enrollment_start && $today->lt($this->college_enrollment_start)) {
                return false;
            }
            if ($this->college_enrollment_end && $today->gt($this->college_enrollment_end)) {
                return false;
            }
            return true;
        }

        return false;
    }
}
