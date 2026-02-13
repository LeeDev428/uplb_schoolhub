<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->get('role', 'all');
        $classification = $request->input('classification', 'all');
        $query = User::query();

        // Exclude owner from the list (owners manage others, not themselves)
        $query->where('role', '!=', User::ROLE_OWNER);

        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'verified') {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        // Filter departments by classification
        $departmentsQuery = Department::active()->orderBy('name');
        if ($classification !== 'all') {
            $departmentsQuery->where('classification', $classification);
        }
        $departments = $departmentsQuery->get(['id', 'name', 'code', 'classification']);

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        // Get counts per role for the tabs
        $roleCounts = User::where('role', '!=', User::ROLE_OWNER)
            ->selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        return Inertia::render('owner/users/index', [
            'users' => $users,
            'roleCounts' => $roleCounts,
            'departments' => $departments,
            'filters' => [
                'role' => $request->role,
                'search' => $request->search,
                'status' => $request->status,
                'classification' => $classification,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'nullable|string|max:255|unique:users,username',
            'role' => ['required', Rule::in([
                User::ROLE_REGISTRAR,
                User::ROLE_ACCOUNTING,
                User::ROLE_STUDENT,
                User::ROLE_TEACHER,
                User::ROLE_PARENT,
                User::ROLE_GUIDANCE,
                User::ROLE_LIBRARIAN,
                User::ROLE_CLINIC,
                User::ROLE_CANTEEN,
            ])],
            'phone' => 'nullable|string|max:20',
            // Teacher-specific fields
            'employee_id' => 'nullable|string|max:50',
            'department_id' => 'nullable|exists:departments,id',
            'specialization' => 'nullable|string|max:255',
            'employment_status' => 'nullable|in:full-time,part-time,contractual',
        ]);

        // Create user with default password
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? null,
            'password' => Hash::make('password'), // Default password
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
        ];

        // If creating a teacher, also create teacher record
        if ($validated['role'] === User::ROLE_TEACHER && !empty($validated['employee_id'])) {
            $nameParts = explode(' ', $validated['name'], 2);
            $teacher = Teacher::create([
                'employee_id' => $validated['employee_id'],
                'first_name' => $nameParts[0],
                'last_name' => $nameParts[1] ?? '',
                'email' => $validated['email'],
                'department_id' => $validated['department_id'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'employment_status' => $validated['employment_status'] ?? 'full-time',
                'hire_date' => now(),
            ]);
            $userData['teacher_id'] = $teacher->id;
        }

        User::create($userData);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'role' => ['required', Rule::in([
                User::ROLE_REGISTRAR,
                User::ROLE_ACCOUNTING,
                User::ROLE_STUDENT,
                User::ROLE_TEACHER,
                User::ROLE_PARENT,
                User::ROLE_GUIDANCE,
                User::ROLE_LIBRARIAN,
                User::ROLE_CLINIC,
                User::ROLE_CANTEEN,
            ])],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? $user->username,
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Don't allow deleting owners
        if ($user->role === User::ROLE_OWNER) {
            return back()->with('error', 'Cannot delete owner accounts.');
        }

        // Also delete related teacher/parent records
        if ($user->teacher_id) {
            Teacher::find($user->teacher_id)?->delete();
        }
        if ($user->parent_id) {
            ParentModel::find($user->parent_id)?->delete();
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
