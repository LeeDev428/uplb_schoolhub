<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
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
                'id' => $settings->id,
                'app_name' => $settings->app_name,
                'logo_url' => $settings->logo_url,
                'favicon_url' => $settings->favicon_url,
                'primary_color' => $settings->primary_color,
                'secondary_color' => $settings->secondary_color,
                'has_k12' => (bool) $settings->has_k12,
                'has_college' => (bool) $settings->has_college,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:100',
            'primary_color' => 'required|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            // Accept '0'/'1' strings from FormData (Inertia forceFormData serialises integers as strings)
            'has_k12' => 'nullable|in:0,1',
            'has_college' => 'nullable|in:0,1',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'favicon' => 'nullable|mimes:png,jpg,jpeg,ico,x-icon|max:512',
        ]);

        $settings = AppSetting::current();

        $settings->app_name = $validated['app_name'];
        $settings->primary_color = $validated['primary_color'];
        $settings->secondary_color = $validated['secondary_color'] ?? $settings->secondary_color;
        // Only '1' means true; any other value (including absent, '0', null) means false
        $settings->has_k12 = $request->input('has_k12') === '1';
        $settings->has_college = $request->input('has_college') === '1';

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::delete($settings->logo_path);
            }
            $settings->logo_path = $request->file('logo')->store('app', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($settings->favicon_path) {
                Storage::delete($settings->favicon_path);
            }
            $settings->favicon_path = $request->file('favicon')->store('app', 'public');
        }

        $settings->save();

        return redirect()->back()->with('success', 'App settings updated successfully.');
    }
}
