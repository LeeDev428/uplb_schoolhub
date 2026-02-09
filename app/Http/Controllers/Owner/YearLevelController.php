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
        
        // Filter by department if provided
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        
        $yearLevels = $query->orderBy('level_number')->get();
        $departments = Department::where('is_active', true)
            ->orderBy('classification')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('owner/year-levels/index', [
            'yearLevels' => $yearLevels,
            'departments' => $departments,
            'filters' => [
                'department_id' => $request->department_id,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'classification' => 'required|in:K-12,College',
            'name' => 'required|string|max:255',
            'level_number' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        YearLevel::create($validated);

        return back()->with('success', 'Year Level created successfully');
    }

    public function update(Request $request, YearLevel $yearLevel)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'classification' => 'required|in:K-12,College',
            'name' => 'required|string|max:255',
            'level_number' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $yearLevel->update($validated);

        return back()->with('success', 'Year Level updated successfully');
    }

    public function destroy(YearLevel $yearLevel)
    {
        $yearLevel->delete();

        return back()->with('success', 'Year Level deleted successfully');
    }
}
