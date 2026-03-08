<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Department;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementViewController extends Controller
{
    // Roles that can create announcements
    private const CAN_CREATE_ROLES = ['owner', 'registrar', 'accounting', 'teacher'];

    /**
     * Display announcements for the current user's role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $role = $user->role;

        $query = Announcement::query()
            ->with(['creator', 'department'])
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->forRole($role);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        $announcements = $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $canCreate = in_array($role, self::CAN_CREATE_ROLES);

        return Inertia::render("{$role}/announcements/index", [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'priority']),
            'role' => $role,
            'canCreate' => $canCreate,
            'departments' => $canCreate
                ? Department::where('is_active', true)->orderBy('name')->get(['id', 'name'])
                : [],
        ]);
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $role = $user->role;

        // Only allowed roles can create
        if (!in_array($role, self::CAN_CREATE_ROLES)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'content'        => 'required|string',
            'priority'       => 'required|in:low,normal,high,urgent',
            'target_roles'   => 'required|array|min:1',
            'target_roles.*' => 'in:' . implode(',', Announcement::AVAILABLE_ROLES),
            'department_id'  => 'nullable|exists:departments,id',
            'classification' => 'nullable|in:K-12,College,All',
            'program'        => 'nullable|string|max:255',
            'grade_level'    => 'nullable|string|max:255',
            'is_pinned'      => 'boolean',
        ]);

        $validated['created_by']     = $user->id;
        $validated['published_at']   = now();
        $validated['is_active']      = true;
        $validated['target_audience'] = 'custom';

        Announcement::create($validated);

        return redirect()->back()->with('success', 'Announcement created successfully!');
    }
}
