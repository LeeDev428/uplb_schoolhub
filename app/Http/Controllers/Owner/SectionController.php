<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Section;
use App\Models\YearLevel;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index()
    {
        $sections = Section::with(['yearLevel', 'program'])->get();
        $yearLevels = YearLevel::where('is_active', true)->get();
        $programs = Program::where('is_active', true)->get();
        
        return Inertia::render('owner/sections/index', [
            'sections' => $sections,
            'yearLevels' => $yearLevels,
            'programs' => $programs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year_level_id' => 'required|exists:year_levels,id',
            'program_id' => 'nullable|exists:programs,id',
            'name' => 'required|string|max:255',
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
            'year_level_id' => 'required|exists:year_levels,id',
            'program_id' => 'nullable|exists:programs,id',
            'name' => 'required|string|max:255',
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
