<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Department;
use App\Models\Program;
use App\Models\YearLevel;
use App\Models\Section;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section', 'teacher']);

        // Filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('department_id') && $request->input('department_id') !== 'all') {
            $query->where('department_id', $request->input('department_id'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('is_active', $request->input('status') === 'active');
        }

        $schedules = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('owner/schedules/index', [
            'schedules' => $schedules,
            'departments' => Department::orderBy('name')->get(),
            'programs' => Program::with('department')->orderBy('name')->get(),
            'yearLevels' => YearLevel::with('department')->orderBy('level_number')->get(),
            'sections' => Section::with(['department', 'yearLevel'])->orderBy('name')->get(),
            'teachers' => Teacher::where('is_active', true)->orderBy('last_name')->get(['id', 'first_name', 'last_name', 'suffix', 'department_id']),
            'filters' => $request->only(['search', 'department_id', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'program_id' => 'nullable|exists:programs,id',
            'year_level_id' => 'nullable|exists:year_levels,id',
            'section_id' => 'nullable|exists:sections,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'is_active' => 'boolean',
        ]);

        // Store the PDF file
        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('schedules', $fileName, 'public');

        Schedule::create([
            'title' => $validated['title'],
            'department_id' => $validated['department_id'],
            'program_id' => $validated['program_id'] ?? null,
            'year_level_id' => $validated['year_level_id'] ?? null,
            'section_id' => $validated['section_id'] ?? null,
            'teacher_id' => $validated['teacher_id'] ?? null,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Schedule uploaded successfully.');
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'program_id' => 'nullable|exists:programs,id',
            'year_level_id' => 'nullable|exists:year_levels,id',
            'section_id' => 'nullable|exists:sections,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'file' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        $data = [
            'title' => $validated['title'],
            'department_id' => $validated['department_id'],
            'program_id' => $validated['program_id'] ?? null,
            'year_level_id' => $validated['year_level_id'] ?? null,
            'section_id' => $validated['section_id'] ?? null,
            'teacher_id' => $validated['teacher_id'] ?? null,
            'is_active' => $validated['is_active'] ?? $schedule->is_active,
        ];

        // If new file is uploaded, delete old and store new
        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($schedule->file_path);
            
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('schedules', $fileName, 'public');
            
            $data['file_path'] = $filePath;
            $data['file_name'] = $file->getClientOriginalName();
        }

        $schedule->update($data);

        return redirect()->back()->with('success', 'Schedule updated successfully.');
    }

    public function destroy(Schedule $schedule)
    {
        // Delete the file
        Storage::disk('public')->delete($schedule->file_path);
        
        $schedule->delete();

        return redirect()->back()->with('success', 'Schedule deleted successfully.');
    }
}
