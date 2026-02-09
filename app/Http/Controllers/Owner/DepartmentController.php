<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::withCount(['yearLevels', 'sections', 'students']);
        
        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Classification filter
        if ($request->filled('classification') && $request->classification !== 'all') {
            $query->where('classification', $request->classification);
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        $departments = $query->orderBy('classification')->orderBy('name')->paginate(25)->withQueryString();
        
        return Inertia::render('owner/departments/index', [
            'departments' => $departments,
            'filters' => [
                'search' => $request->search,
                'classification' => $request->classification,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'classification' => 'required|in:K-12,College',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Department::create($validated);

        return back()->with('success', 'Department created successfully');
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'classification' => 'required|in:K-12,College',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code,' . $department->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $department->update($validated);

        return back()->with('success', 'Department updated successfully');
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return back()->with('success', 'Department deleted successfully');
    }
}
