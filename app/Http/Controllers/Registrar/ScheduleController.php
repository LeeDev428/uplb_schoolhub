<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section', 'teacher'])
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->filled('department_id') && $request->input('department_id') !== 'all') {
            $query->where('department_id', $request->input('department_id'));
        }

        $schedules = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('registrar/schedule/index', [
            'schedules' => $schedules,
            'departments' => Department::orderBy('name')->get(),
            'filters' => $request->only(['search', 'department_id']),
        ]);
    }
}
