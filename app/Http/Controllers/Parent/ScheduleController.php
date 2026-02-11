<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $parent = $user->parent;
        
        // Get department IDs from all children's programs
        $departmentIds = [];
        if ($parent) {
            $children = Student::where('parent_id', $parent->id)->get();
            foreach ($children as $child) {
                if ($child->program) {
                    $program = Program::where('name', $child->program)->first();
                    if ($program && !in_array($program->department_id, $departmentIds)) {
                        $departmentIds[] = $program->department_id;
                    }
                }
            }
        }
        
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section'])
            ->where('is_active', true);

        // Filter by children's departments
        if (!empty($departmentIds)) {
            $query->whereIn('department_id', $departmentIds);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $schedules = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('parent/schedules/index', [
            'schedules' => $schedules,
            'filters' => $request->only(['search']),
        ]);
    }
}
