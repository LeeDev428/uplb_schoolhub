<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section', 'teacher'])
            ->where('is_active', true);

        // Filter by assigned teacher
        if ($teacher) {
            $query->where('teacher_id', $teacher->id);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $schedules = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('teacher/schedules/index', [
            'schedules' => $schedules,
            'filters' => $request->only(['search']),
        ]);
    }
}
