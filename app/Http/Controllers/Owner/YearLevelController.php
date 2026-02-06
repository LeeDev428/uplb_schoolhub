<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\YearLevel;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class YearLevelController extends Controller
{
    public function index()
    {
        $yearLevels = YearLevel::with('department')->get();
        $departments = Department::where('is_active', true)->get();
        
        return Inertia::render('owner/year-levels/index', [
            'yearLevels' => $yearLevels,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
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
