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
        'footer_tagline',
        'footer_address',
        'footer_phone',
        'footer_email',
        'footer_facebook',
        'nav_links',
    ];

    protected $casts = [
        'has_k12'      => 'boolean',
        'has_college'  => 'boolean',
        'hero_images'  => 'array',
        'alumni_items' => 'array',
        'nav_links'    => 'array',
    ];

    public static function current(): self
    {
        return self::firstOrCreate([], [
            'app_name'      => 'School Management System',
            'primary_color' => '#1d4ed8',
            'secondary_color' => '#64748b',
            'has_k12'       => true,
            'has_college'   => true,
        ]);
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }

    public function getFaviconUrlAttribute(): ?string
    {
        return $this->favicon_path ? Storage::url($this->favicon_path) : null;
    }

    public function getMessageAuthorPhotoUrlAttribute(): ?string
    {
        return $this->message_author_photo ? Storage::url($this->message_author_photo) : null;
    }

    /** Return hero images as public URLs */
    public function getHeroImageUrlsAttribute(): array
    {
        if (empty($this->hero_images)) return [];
        return array_map(fn ($p) => Storage::url($p), $this->hero_images);
    }

    /** Return alumni items with resolved photo URLs */
    public function getAlumniItemsWithUrlsAttribute(): array
    {
        if (empty($this->alumni_items)) return [];
        return array_map(function ($item) {
            $item['photo_url'] = isset($item['photo_path']) ? Storage::url($item['photo_path']) : null;
            return $item;
        }, $this->alumni_items);
    }
}
