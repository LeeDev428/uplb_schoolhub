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
        $classification = $request->input('classification', 'all');
        
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section', 'teacher'])
            ->where('is_active', true);

        // Get departments based on classification
        $departmentsQuery = Department::query()->orderBy('name');
        if ($classification !== 'all') {
            $departmentsQuery->where('classification', $classification);
            $departmentIds = $departmentsQuery->pluck('id')->toArray();
            $query->whereIn('department_id', $departmentIds);
        }
        $departments = $departmentsQuery->get();

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
            'departments' => $departments,
            'filters' => $request->only(['search', 'classification', 'department_id']),
        ]);
    }
}
