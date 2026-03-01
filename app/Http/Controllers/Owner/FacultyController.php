<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FacultyController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'department_id'     => 'required|exists:departments,id',
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'middle_name'       => 'nullable|string|max:100',
            'suffix'            => 'nullable|string|max:20',
            'employee_id'       => 'required|string|max:50|unique:teachers,employee_id',
            'email'             => 'required|email|max:150|unique:teachers,email',
            'specialization'    => 'nullable|string|max:200',
            'employment_status' => 'nullable|in:full-time,part-time,contractual',
            'is_active'         => 'nullable|in:0,1',
            'show_on_landing'   => 'nullable|in:0,1',
            'photo'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path     = $request->file('photo')->store('faculty/photos', 'public');
            $photoUrl = Storage::url($path);
        }

        Teacher::create([
            'department_id'     => $request->input('department_id'),
            'first_name'        => $request->input('first_name'),
            'last_name'         => $request->input('last_name'),
            'middle_name'       => $request->input('middle_name'),
            'suffix'            => $request->input('suffix'),
            'employee_id'       => $request->input('employee_id'),
            'email'             => $request->input('email'),
            'specialization'    => $request->input('specialization'),
            'employment_status' => $request->input('employment_status', 'full-time'),
            'is_active'         => $request->boolean('is_active', true),
            'show_on_landing'   => $request->boolean('show_on_landing', true),
            'photo_url'         => $photoUrl,
        ]);

        return back()->with('success', 'Faculty member added successfully.');
    }

    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $request->validate([
            'department_id'     => 'required|exists:departments,id',
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'middle_name'       => 'nullable|string|max:100',
            'suffix'            => 'nullable|string|max:20',
            'employee_id'       => 'required|string|max:50|unique:teachers,employee_id,' . $teacher->id,
            'email'             => 'required|email|max:150|unique:teachers,email,' . $teacher->id,
            'specialization'    => 'nullable|string|max:200',
            'employment_status' => 'nullable|in:full-time,part-time,contractual',
            'is_active'         => 'nullable|in:0,1',
            'show_on_landing'   => 'nullable|in:0,1',
            'photo'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $updateData = [
            'department_id'     => $request->input('department_id'),
            'first_name'        => $request->input('first_name'),
            'last_name'         => $request->input('last_name'),
            'middle_name'       => $request->input('middle_name'),
            'suffix'            => $request->input('suffix'),
            'employee_id'       => $request->input('employee_id'),
            'email'             => $request->input('email'),
            'specialization'    => $request->input('specialization'),
            'employment_status' => $request->input('employment_status', 'full-time'),
            'is_active'         => $request->boolean('is_active', true),
            'show_on_landing'   => $request->boolean('show_on_landing', true),
        ];

        if ($request->hasFile('photo')) {
            // Delete old locally stored photo
            if ($teacher->photo_url && str_starts_with($teacher->photo_url, '/storage/')) {
                $oldPath = ltrim(str_replace('/storage/', '', $teacher->photo_url), '/');
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('photo')->store('faculty/photos', 'public');
            $updateData['photo_url'] = Storage::url($path);
        }

        $teacher->update($updateData);

        return back()->with('success', 'Faculty member updated successfully.');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $teacher->delete();

        return back()->with('success', 'Faculty member removed successfully.');
    }
}
