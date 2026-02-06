<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::with('department')->get();
        $departments = Department::where('is_active', true)->get();
        
        return Inertia::render('owner/programs/index', [
            'programs' => $programs,
            'departments' => $departments,
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
