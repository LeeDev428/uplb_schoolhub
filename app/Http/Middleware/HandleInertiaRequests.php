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
                'app_name' => $settings->app_name,
                'logo_url' => $settings->logo_url,
                'favicon_url' => $settings->favicon_url,
                'primary_color' => $settings->primary_color,
                'secondary_color' => $settings->secondary_color,
            ];
        } catch (\Exception $e) {
            return [
                'app_name' => config('app.name'),
                'logo_url' => null,
                'favicon_url' => null,
                'primary_color' => '#1d4ed8',
                'secondary_color' => '#64748b',
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
