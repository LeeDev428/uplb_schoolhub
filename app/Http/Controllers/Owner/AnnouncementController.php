<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index(Request $request)
    {
        $query = Announcement::with(['department:id,name', 'creator:id,name'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Priority filter
        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $query->where('priority', $request->input('priority'));
        }

        // Target role filter (filter by specific role in target_roles array)
        if ($request->filled('target_role') && $request->input('target_role') !== 'all') {
            $query->whereJsonContains('target_roles', $request->input('target_role'));
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->input('status') === 'active') {
                $query->where('is_active', true);
            } elseif ($request->input('status') === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $announcements = $query->paginate(15)->withQueryString();

        $departments = Department::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/announcements/index', [
            'announcements' => $announcements,
            'departments' => $departments,
            'availableRoles' => Announcement::AVAILABLE_ROLES,
            'filters' => $request->only(['search', 'priority', 'target_role', 'status']),
        ]);
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_roles' => 'required|array|min:1',
            'target_roles.*' => 'in:' . implode(',', Announcement::AVAILABLE_ROLES),
            'department_id' => 'nullable|exists:departments,id',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:published_at',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,doc,docx',
        ]);

        $validated['created_by'] = Auth::id();
        
        // If no published_at is set, publish immediately
        if (!isset($validated['published_at']) || empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('announcements', 'public');
            $validated['attachment_path'] = $path;
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_type'] = $file->getMimeType();
        }
        unset($validated['attachment']);

        // Set target_audience to 'custom' since we're using target_roles
        $validated['target_audience'] = count($validated['target_roles']) === count(Announcement::AVAILABLE_ROLES) ? 'all' : 'custom';

        Announcement::create($validated);

        return redirect()->route('owner.announcements.index')
            ->with('success', 'Announcement created successfully!');
    }

    /**
     * Update the specified announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_roles' => 'required|array|min:1',
            'target_roles.*' => 'in:' . implode(',', Announcement::AVAILABLE_ROLES),
            'department_id' => 'nullable|exists:departments,id',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:published_at',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,doc,docx',
            'remove_attachment' => 'boolean',
        ]);

        // If published_at is cleared, set to now (publish immediately)
        if (!isset($validated['published_at']) || empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // If expires_at is cleared, set to null
        if (!isset($validated['expires_at']) || empty($validated['expires_at'])) {
            $validated['expires_at'] = null;
        }

        // Handle file removal
        if ($request->boolean('remove_attachment') && $announcement->attachment_path) {
            Storage::disk('public')->delete($announcement->attachment_path);
            $validated['attachment_path'] = null;
            $validated['attachment_name'] = null;
            $validated['attachment_type'] = null;
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($announcement->attachment_path) {
                Storage::disk('public')->delete($announcement->attachment_path);
            }
            $file = $request->file('attachment');
            $path = $file->store('announcements', 'public');
            $validated['attachment_path'] = $path;
            $validated['attachment_name'] = $file->getClientOriginalName();
            $validated['attachment_type'] = $file->getMimeType();
        }
        unset($validated['attachment'], $validated['remove_attachment']);

        // Set target_audience based on selected roles
        $validated['target_audience'] = count($validated['target_roles']) === count(Announcement::AVAILABLE_ROLES) ? 'all' : 'custom';

        $announcement->update($validated);

        return redirect()->route('owner.announcements.index')
            ->with('success', 'Announcement updated successfully!');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement)
    {
        // Delete attachment if exists
        if ($announcement->attachment_path) {
            Storage::disk('public')->delete($announcement->attachment_path);
        }

        $announcement->delete();

        return redirect()->route('owner.announcements.index')
            ->with('success', 'Announcement deleted successfully!');
    }

    /**
     * Toggle the pinned status of an announcement.
     */
    public function togglePin(Announcement $announcement)
    {
        $announcement->update(['is_pinned' => !$announcement->is_pinned]);

        return redirect()->route('owner.announcements.index')
            ->with('success', $announcement->is_pinned ? 'Announcement pinned!' : 'Announcement unpinned!');
    }

    /**
     * Toggle the active status of an announcement.
     */
    public function toggleStatus(Announcement $announcement)
    {
        $announcement->update(['is_active' => !$announcement->is_active]);

        return redirect()->route('owner.announcements.index')
            ->with('success', $announcement->is_active ? 'Announcement activated!' : 'Announcement deactivated!');
    }
}
