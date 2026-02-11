<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Program;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;
        
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section', 'teacher'])
            ->where('is_active', true);

        // Filter by student's department (from program)
        if ($student && $student->program) {
            $program = Program::where('name', $student->program)->first();
            if ($program) {
                $query->where('department_id', $program->department_id);
                
                // Further filter by program if specified in schedule
                $query->where(function($q) use ($program) {
                    $q->whereNull('program_id')
                        ->orWhere('program_id', $program->id);
                });
            }
        }

        // Filter by student's year level
        if ($student && $student->year_level) {
            $yearLevel = YearLevel::where('name', $student->year_level)->first();
            if ($yearLevel) {
                $query->where(function($q) use ($yearLevel) {
                    $q->whereNull('year_level_id')
                        ->orWhere('year_level_id', $yearLevel->id);
                });
            }
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $schedules = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('student/schedules/index', [
            'schedules' => $schedules,
            'filters' => $request->only(['search']),
        ]);
    }
}
