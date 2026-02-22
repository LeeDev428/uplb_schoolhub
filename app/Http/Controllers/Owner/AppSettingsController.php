<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = AppSetting::current();

        return Inertia::render('owner/app-settings', [
            'settings' => [
                'id'                        => $settings->id,
                'app_name'                  => $settings->app_name,
                'logo_url'                  => $settings->logo_url,
                'favicon_url'               => $settings->favicon_url,
                'primary_color'             => $settings->primary_color,
                'secondary_color'           => $settings->secondary_color,
                'has_k12'                   => (bool) $settings->has_k12,
                'has_college'               => (bool) $settings->has_college,
                // Landing page
                'hero_title'                => $settings->hero_title,
                'hero_subtitle'             => $settings->hero_subtitle,
                'hero_image_urls'           => $settings->hero_image_urls,
                'hero_images'               => $settings->hero_images ?? [],
                'faculty_section_title'     => $settings->faculty_section_title,
                'faculty_section_subtitle'  => $settings->faculty_section_subtitle,
                'message_title'             => $settings->message_title,
                'message_content'           => $settings->message_content,
                'message_author'            => $settings->message_author,
                'message_author_title'      => $settings->message_author_title,
                'message_author_photo_url'  => $settings->message_author_photo_url,
                'alumni_section_title'      => $settings->alumni_section_title,
                'alumni_section_subtitle'   => $settings->alumni_section_subtitle,
                'alumni_items'              => $settings->alumni_items_with_urls,
                'footer_tagline'            => $settings->footer_tagline,
                'footer_address'            => $settings->footer_address,
                'footer_phone'              => $settings->footer_phone,
                'footer_email'              => $settings->footer_email,
                'footer_facebook'           => $settings->footer_facebook,
                'nav_links'                 => $settings->nav_links ?? [],
            ],
        ]);
    }

    public function updateAcademicStructure(Request $request): RedirectResponse
    {
        $request->validate([
            'has_k12'     => 'required|boolean',
            'has_college' => 'required|boolean',
        ]);

        $settings = AppSetting::current();
        $settings->has_k12     = (bool) $request->input('has_k12');
        $settings->has_college = (bool) $request->input('has_college');
        $settings->save();

        return redirect()->back()->with('success', 'Academic structure updated.');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name'       => 'required|string|max:100',
            'primary_color'  => 'required|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'has_k12'        => 'nullable|in:0,1',
            'has_college'    => 'nullable|in:0,1',
            'logo'           => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'favicon'        => 'nullable|mimes:png,jpg,jpeg,ico,x-icon|max:512',
        ]);

        $settings = AppSetting::current();
        $settings->app_name       = $validated['app_name'];
        $settings->primary_color  = $validated['primary_color'];
        $settings->secondary_color = $validated['secondary_color'] ?? $settings->secondary_color;
        $settings->has_k12        = $request->input('has_k12') === '1';
        $settings->has_college    = $request->input('has_college') === '1';

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) Storage::delete($settings->logo_path);
            $settings->logo_path = $request->file('logo')->store('app', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($settings->favicon_path) Storage::delete($settings->favicon_path);
            $settings->favicon_path = $request->file('favicon')->store('app', 'public');
        }

        $settings->save();

        return redirect()->back()->with('success', 'App settings updated successfully.');
    }

    /**
     * Update the landing page content (hero, faculty, message, alumni, footer, navbar).
     */
    public function updateLandingPage(Request $request): RedirectResponse
    {
        $request->validate([
            'hero_title'               => 'nullable|string|max:200',
            'hero_subtitle'            => 'nullable|string|max:400',
            'hero_new_images.*'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'hero_remove_indices'      => 'nullable|string', // JSON array of indices to remove
            'faculty_section_title'    => 'nullable|string|max:200',
            'faculty_section_subtitle' => 'nullable|string|max:400',
            'message_title'            => 'nullable|string|max:200',
            'message_content'          => 'nullable|string|max:5000',
            'message_author'           => 'nullable|string|max:100',
            'message_author_title'     => 'nullable|string|max:100',
            'message_author_photo'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'alumni_section_title'     => 'nullable|string|max:200',
            'alumni_section_subtitle'  => 'nullable|string|max:400',
            'footer_tagline'           => 'nullable|string|max:300',
            'footer_address'           => 'nullable|string|max:300',
            'footer_phone'             => 'nullable|string|max:50',
            'footer_email'             => 'nullable|string|max:100',
            'footer_facebook'          => 'nullable|string|max:200',
        ]);

        $settings = AppSetting::current();

        $settings->hero_title              = $request->input('hero_title');
        $settings->hero_subtitle           = $request->input('hero_subtitle');
        $settings->faculty_section_title   = $request->input('faculty_section_title');
        $settings->faculty_section_subtitle = $request->input('faculty_section_subtitle');
        $settings->message_title           = $request->input('message_title');
        $settings->message_content         = $request->input('message_content');
        $settings->message_author          = $request->input('message_author');
        $settings->message_author_title    = $request->input('message_author_title');
        $settings->alumni_section_title    = $request->input('alumni_section_title');
        $settings->alumni_section_subtitle = $request->input('alumni_section_subtitle');
        $settings->footer_tagline          = $request->input('footer_tagline');
        $settings->footer_address          = $request->input('footer_address');
        $settings->footer_phone            = $request->input('footer_phone');
        $settings->footer_email            = $request->input('footer_email');
        $settings->footer_facebook         = $request->input('footer_facebook');

        // Handle hero images (remove then add)
        $heroImages = $settings->hero_images ?? [];
        $removeIndices = json_decode($request->input('hero_remove_indices', '[]'), true) ?? [];
        if (!empty($removeIndices)) {
            foreach ($removeIndices as $idx) {
                if (isset($heroImages[$idx])) {
                    Storage::delete($heroImages[$idx]);
                }
            }
            $heroImages = array_values(array_filter($heroImages, fn ($_, $i) => !in_array($i, $removeIndices), ARRAY_FILTER_USE_BOTH));
        }
        if ($request->hasFile('hero_new_images')) {
            foreach ($request->file('hero_new_images') as $file) {
                $heroImages[] = $file->store('landing/hero', 'public');
            }
        }
        $settings->hero_images = $heroImages;

        // Handle message author photo
        if ($request->hasFile('message_author_photo')) {
            if ($settings->message_author_photo) {
                Storage::delete($settings->message_author_photo);
            }
            $settings->message_author_photo = $request->file('message_author_photo')->store('landing/message', 'public');
        }

        $settings->save();

        return redirect()->back()->with('success', 'Landing page updated successfully.');
    }

    /**
     * Update alumni/notable graduates list (JSON body).
     */
    public function updateAlumni(Request $request): RedirectResponse
    {
        // Accept either a JSON string or a raw array (Inertia sends JSON string when serialized)
        $raw = $request->input('alumni', []);
        if (is_string($raw)) {
            $raw = json_decode($raw, true) ?? [];
        }

        $settings = AppSetting::current();
        $existing = $settings->alumni_items ?? [];

        // Preserve existing photo_path if still present
        $merged = array_map(function ($item, $i) use ($existing) {
            if (isset($existing[$i]['photo_path'])) {
                $item['photo_path'] = $existing[$i]['photo_path'];
            }
            return $item;
        }, $raw, array_keys($raw));

        $settings->alumni_items = $merged;
        $settings->save();

        return redirect()->back()->with('success', 'Alumni list updated.');
    }

    /**
     * Upload a photo for a specific alumni item.
     */
    public function uploadAlumniPhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'index' => 'required|integer|min:0',
        ]);

        $settings = AppSetting::current();
        $items    = $settings->alumni_items ?? [];
        $idx      = (int) $request->input('index');

        // Delete old photo
        if (!empty($items[$idx]['photo_path'])) {
            Storage::delete($items[$idx]['photo_path']);
        }
        $items[$idx]['photo_path'] = $request->file('photo')->store('landing/alumni', 'public');

        $settings->alumni_items = $items;
        $settings->save();

        return redirect()->back()->with('success', 'Alumni photo updated.');
    }

    /**
     * Update navbar links.
     */
    public function updateNavLinks(Request $request): RedirectResponse
    {
        // Accept either a JSON string or a raw array
        $raw = $request->input('nav_links', []);
        if (is_string($raw)) {
            $raw = json_decode($raw, true) ?? [];
        }

        $settings             = AppSetting::current();
        $settings->nav_links  = $raw;
        $settings->save();

        return redirect()->back()->with('success', 'Navigation links updated.');
    }
}
