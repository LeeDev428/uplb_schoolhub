<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    private function getTeacher(): Teacher
    {
        $teacher = Teacher::find(Auth::user()->teacher_id);
        abort_unless($teacher, 404, 'Teacher profile not found.');
        return $teacher;
    }

    public function index(): Response
    {
        $teacher = $this->getTeacher();
        $teacher->load('department');

        return Inertia::render('teacher/profile', [
            'teacher' => [
                'id'               => $teacher->id,
                'first_name'       => $teacher->first_name,
                'last_name'        => $teacher->last_name,
                'full_name'        => $teacher->full_name,
                'email'            => $teacher->user?->email,
                'phone'            => $teacher->phone,
                'bio'              => $teacher->bio,
                'specialization'   => $teacher->specialization,
                'department'       => $teacher->department?->name,
                'employee_id'      => $teacher->employee_id,
                'photo_url'        => $teacher->photo_url,
                'show_on_landing'  => (bool) $teacher->show_on_landing,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $teacher = $this->getTeacher();

        $validated = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'phone'           => 'nullable|string|max:20',
            'bio'             => 'nullable|string|max:1000',
            'specialization'  => 'nullable|string|max:100',
            'show_on_landing' => 'boolean',
        ]);

        $teacher->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function updatePhoto(Request $request): RedirectResponse
    {
        $teacher = $this->getTeacher();

        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        // Delete old photo file if stored locally (skip if it's an external URL)
        if ($teacher->photo_url && str_starts_with($teacher->photo_url, '/storage/')) {
            $path = str_replace('/storage/', '', $teacher->photo_url);
            Storage::disk('public')->delete($path);
        }

        $path = $request->file('photo')->store('teacher-photos', 'public');
        $teacher->photo_url = Storage::url($path);
        $teacher->save();

        return redirect()->back()->with('success', 'Photo updated successfully.');
    }

    public function deletePhoto(): RedirectResponse
    {
        $teacher = $this->getTeacher();

        if ($teacher->photo_url && str_starts_with($teacher->photo_url, '/storage/')) {
            $path = str_replace('/storage/', '', $teacher->photo_url);
            Storage::disk('public')->delete($path);
        }

        $teacher->photo_url = null;
        $teacher->save();

        return redirect()->back()->with('success', 'Photo removed.');
    }
}
