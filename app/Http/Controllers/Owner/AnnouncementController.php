<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Target audience filter
        if ($request->filled('target_audience') && $request->input('target_audience') !== 'all') {
            $query->where('target_audience', $request->input('target_audience'));
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
            'filters' => $request->only(['search', 'priority', 'target_audience', 'status']),
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
            'target_audience' => 'required|in:all,students,teachers,parents,staff',
            'department_id' => 'nullable|exists:departments,id',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['created_by'] = Auth::id();
        
        // If no published_at is set, publish immediately
        if (empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

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
            'target_audience' => 'required|in:all,students,teachers,parents,staff',
            'department_id' => 'nullable|exists:departments,id',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $announcement->update($validated);

        return redirect()->route('owner.announcements.index')
            ->with('success', 'Announcement updated successfully!');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement)
    {
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
