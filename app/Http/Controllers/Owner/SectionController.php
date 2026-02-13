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
    public function index(Request $request)
    {
        $query = Section::with(['yearLevel.department', 'department', 'strand']);
        
        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('room_number', 'like', "%{$search}%");
            });
        }
        
        // Department filter
        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }
        
        // Year Level filter
        if ($request->filled('year_level_id') && $request->year_level_id !== 'all') {
            $query->where('year_level_id', $request->year_level_id);
        }
        
        // Strand filter
        if ($request->filled('strand_id') && $request->strand_id !== 'all') {
            $query->where('strand_id', $request->strand_id);
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }
        
        $sections = $query->orderBy('name')->paginate(25)->withQueryString();
        $yearLevels = YearLevel::with('department')->where('is_active', true)->orderBy('level_number')->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();
        $strands = Strand::where('is_active', true)->orderBy('code')->get();
        
        return Inertia::render('owner/sections/index', [
            'sections' => $sections,
            'yearLevels' => $yearLevels,
            'departments' => $departments,
            'strands' => $strands,
            'filters' => [
                'search' => $request->search,
                'department_id' => $request->department_id,
                'year_level_id' => $request->year_level_id,
                'strand_id' => $request->strand_id,
                'status' => $request->status,
            ],
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
            'room_number' => 'nullable|string|max:50',
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
            'room_number' => 'nullable|string|max:50',
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
