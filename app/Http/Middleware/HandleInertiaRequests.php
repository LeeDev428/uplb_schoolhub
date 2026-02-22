<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'student_id' => $user->student_id,
                    'email_verified_at' => $user->email_verified_at,
                    'avatar' => $user->profile_photo_url,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'announcementCount' => $this->getAnnouncementCount($user),
            'appSettings' => $this->getAppSettings(),
        ];
    }

    /**
     * Get global app settings.
     */
    protected function getAppSettings(): array
    {
        try {
            $settings = AppSetting::current();
            return [
                'app_name'                  => $settings->app_name,
                'logo_url'                  => $settings->logo_url,
                'favicon_url'               => $settings->favicon_url,
                'primary_color'             => $settings->primary_color,
                'secondary_color'           => $settings->secondary_color,
                'has_k12'                   => (bool) $settings->has_k12,
                'has_college'               => (bool) $settings->has_college,
                // Landing page fields
                'hero_title'                => $settings->hero_title,
                'hero_subtitle'             => $settings->hero_subtitle,
                'hero_image_urls'           => $settings->hero_image_urls ?? [],
                'faculty_section_title'     => $settings->faculty_section_title,
                'faculty_section_subtitle'  => $settings->faculty_section_subtitle,
                'message_title'             => $settings->message_title,
                'message_content'           => $settings->message_content,
                'message_author'            => $settings->message_author,
                'message_author_title'      => $settings->message_author_title,
                'message_author_photo_url'  => $settings->message_author_photo_url,
                'alumni_section_title'      => $settings->alumni_section_title,
                'alumni_section_subtitle'   => $settings->alumni_section_subtitle,
                'alumni_items'              => $settings->alumni_items_with_urls ?? [],
                // Features section
                'features_section_title'    => $settings->features_section_title,
                'features_section_subtitle' => $settings->features_section_subtitle,
                'features_show'             => (bool) ($settings->features_show ?? true),
                'features_items'            => $settings->features_items ?? [],
                'footer_tagline'            => $settings->footer_tagline,
                'footer_address'            => $settings->footer_address,
                'footer_phone'              => $settings->footer_phone,
                'footer_email'              => $settings->footer_email,
                'footer_facebook'           => $settings->footer_facebook,
                'nav_links'                 => $settings->nav_links ?? [],
            ];
        } catch (\Exception $e) {
            return [
                'app_name'       => config('app.name'),
                'logo_url'       => null,
                'favicon_url'    => null,
                'primary_color'  => '#1d4ed8',
                'secondary_color'=> '#64748b',
                'has_k12'        => true,
                'has_college'    => true,
                'hero_image_urls'=> [],
                'alumni_items'   => [],
                'nav_links'      => [],
            ];
        }
    }

    /**
     * Get the count of active announcements for the user's role.
     */
    protected function getAnnouncementCount($user): int
    {
        if (!$user || !$user->role) {
            return 0;
        }

        return Announcement::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->forRole($user->role)
            ->count();
    }
}
