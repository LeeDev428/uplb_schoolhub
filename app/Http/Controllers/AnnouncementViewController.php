<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementViewController extends Controller
{
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

        return Inertia::render("{$role}/announcements/index", [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'priority']),
            'role' => $role,
        ]);
    }
}
