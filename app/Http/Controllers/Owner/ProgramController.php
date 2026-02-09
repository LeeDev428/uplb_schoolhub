<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = Program::with('department');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('department', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Department filter
        if ($request->filled('department_id') && $request->department_id !== 'all') {
            $query->where('department_id', $request->department_id);
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        $programs = $query->paginate(25)->withQueryString();
        $departments = Department::where('is_active', true)->get();
        
        return Inertia::render('owner/programs/index', [
            'programs' => $programs,
            'departments' => $departments,
            'filters' => [
                'search' => $request->search,
                'department_id' => $request->department_id,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_years' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        Program::create($validated);

        return back()->with('success', 'Program created successfully');
    }

    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_years' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $program->update($validated);

        return back()->with('success', 'Program updated successfully');
    }

    public function destroy(Program $program)
    {
        $program->delete();

        return back()->with('success', 'Program deleted successfully');
    }
}
