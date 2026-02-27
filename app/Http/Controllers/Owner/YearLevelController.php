<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\YearLevel;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class YearLevelController extends Controller
{
    public function index(Request $request)
    {
        $query = YearLevel::with('department');
        
        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('department', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Department filter
        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }
        
        // Classification filter
        if ($request->filled('classification') && $request->classification !== 'all') {
            $query->where('classification', $request->classification);
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        $yearLevels = $query->withCount(['sections'])->orderBy('level_number')->paginate(25)->withQueryString();
        $departments = Department::where('is_active', true)
            ->orderBy('classification')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('owner/year-levels/index', [
            'yearLevels' => $yearLevels,
            'departments' => $departments,
            'programs' => \App\Models\Program::where('is_active', true)->orderBy('name')->get(['id', 'name', 'department_id']),
            'filters' => [
                'search' => $request->search,
                'department_id' => $request->department_id,
                'classification' => $request->classification,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'program_id' => 'nullable|exists:programs,id',
            'name' => 'required|string|max:255',
            'level_number' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        // Auto-derive classification from the selected department
        $department = Department::findOrFail($validated['department_id']);
        $validated['classification'] = $department->classification;

        YearLevel::create($validated);

        return back()->with('success', 'Year Level created successfully');
    }

    public function update(Request $request, YearLevel $yearLevel)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'program_id' => 'nullable|exists:programs,id',
            'name' => 'required|string|max:255',
            'level_number' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        // Auto-derive classification from the selected department
        $department = Department::findOrFail($validated['department_id']);
        $validated['classification'] = $department->classification;

        $yearLevel->update($validated);

        return back()->with('success', 'Year Level updated successfully');
    }

    public function destroy(YearLevel $yearLevel)
    {
        $yearLevel->delete();

        return back()->with('success', 'Year Level deleted successfully');
    }
}
