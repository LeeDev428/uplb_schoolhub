<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\YearLevel;
use App\Models\Department;
use App\Models\Strand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index()
    {
        $sections = Section::with(['yearLevel', 'department', 'strand'])->get();
        $yearLevels = YearLevel::with('department')->where('is_active', true)->get();
        $departments = Department::where('is_active', true)->get();
        $strands = Strand::where('is_active', true)->get();
        
        return Inertia::render('owner/sections/index', [
            'sections' => $sections,
            'yearLevels' => $yearLevels,
            'departments' => $departments,
            'strands' => $strands,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'year_level_id' => 'required|exists:year_levels,id',
            'strand_id' => 'nullable|exists:strands,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'school_year' => 'required|string',
            'is_active' => 'boolean',
        ]);

        Section::create($validated);

        return back()->with('success', 'Section created successfully');
    }

    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'year_level_id' => 'required|exists:year_levels,id',
            'strand_id' => 'nullable|exists:strands,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'capacity' => 'nullable|integer|min:1',
            'school_year' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $section->update($validated);

        return back()->with('success', 'Section updated successfully');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return back()->with('success', 'Section deleted successfully');
    }
}
