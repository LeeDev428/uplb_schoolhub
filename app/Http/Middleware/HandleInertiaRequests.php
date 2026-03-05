<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\AppSetting;
use App\Models\DocumentRequest;
use App\Models\DropRequest;
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

        // Get student data if user is a student
        $studentData = null;
        if ($user && $user->role === 'student' && $user->student_id) {
            $student = \App\Models\Student::with('department:id,name,classification')
                ->select('id', 'enrollment_status', 'school_year', 'department_id', 'program')
                ->find($user->student_id);
            if ($student) {
                // Resolve department classification: prefer direct relation, fall back to program lookup
                $classification = $student->department?->classification;
                if (!$classification && $student->program) {
                    $classification = \App\Models\Program::where('programs.name', $student->program)
                        ->join('departments', 'programs.department_id', '=', 'departments.id')
                        ->value('departments.classification');
                }

                $studentData = [
                    'id' => $student->id,
                    'enrollment_status' => $student->enrollment_status,
                    'school_year' => $student->school_year,
                    'department_classification' => $classification,
                ];
            }
        }

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
                    'student' => $studentData,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'announcementCount' => $this->getAnnouncementCount($user),
            'pendingDocumentCount' => $this->getPendingDocumentCount($user),
            'pendingDropRequestCount' => $this->getPendingDropRequestCount($user),
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
                'sidebar_color'             => $settings->sidebar_color ?? '#1e293b',
                'sidebar_font_size'         => $settings->sidebar_font_size ?? '14',
                'has_k12'                   => (bool) $settings->has_k12,
                'has_college'               => (bool) $settings->has_college,
                'k12_enrollment_open'       => (bool) $settings->k12_enrollment_open,
                'college_enrollment_open'   => (bool) $settings->college_enrollment_open,
                'active_semester'           => (int) ($settings->active_semester ?? 1),
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
                'sidebar_color'  => '#1e293b',
                'sidebar_font_size' => '14',
                'has_k12'        => true,
                'has_college'    => true,
                'k12_enrollment_open'     => false,
                'college_enrollment_open' => false,
                'hero_image_urls'=> [],
                'alumni_items'   => [],
                'nav_links'      => [],
            ];
        }
    }

    /**
     * Get the count of pending drop requests awaiting accounting approval.
     */
    protected function getPendingDropRequestCount($user): int
    {
        if (!$user || !in_array($user->role, ['accounting', 'super-accounting'])) {
            return 0;
        }
        try {
            return DropRequest::where('registrar_status', 'approved')
                ->where('accounting_status', 'pending')
                ->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get the count of pending document requests for relevant roles.
     */
    protected function getPendingDocumentCount($user): int
    {
        if (!$user || !in_array($user->role, ['accounting', 'registrar', 'super-accounting', 'owner'])) {
            return 0;
        }
        try {
            if ($user->role === 'registrar') {
                // Registrar sees their own pending queue
                return DocumentRequest::where('registrar_status', 'pending')->count();
            } elseif (in_array($user->role, ['accounting', 'super-accounting'])) {
                // Accounting sees requests that registrar approved but accounting hasn't processed yet
                return DocumentRequest::where('registrar_status', 'approved')
                    ->where('accounting_status', 'pending')
                    ->count();
            } else {
                // Owner/others: total pending overall
                return DocumentRequest::where('status', 'pending')->count();
            }
        } catch (\Exception $e) {
            return 0;
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
