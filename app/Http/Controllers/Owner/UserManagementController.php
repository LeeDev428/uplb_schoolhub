<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Status filter (placeholder - can add is_active field later)
        
        $users = $query->with(['student', 'teacher', 'parent'])
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $departments = Department::where('is_active', true)->get(['id', 'name']);

        return Inertia::render('owner/users/index', [
            'users' => $users,
            'departments' => $departments,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'nullable|string|unique:users,username',
            'password' => 'required|string|min:8',
            'role' => 'required|in:owner,registrar,accounting,teacher,student,parent,guidance,librarian,clinic,canteen',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        // Generate username if not provided
        if (!$validated['username']) {
            $validated['username'] = $this->generateUsername($validated['email']);
        }

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return back()->with('success', 'User created successfully!');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'username' => 'nullable|string|unique:users,username,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:owner,registrar,accounting,teacher,student,parent,guidance,librarian,clinic,canteen',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'User updated successfully!');
    }

    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account!']);
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully!');
    }

    private function generateUsername($email)
    {
        $base = Str::before($email, '@');
        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }
}
