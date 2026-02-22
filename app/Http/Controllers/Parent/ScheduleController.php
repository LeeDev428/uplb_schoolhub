<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $parent = $user->parent;
        
        // Get department IDs from all children
        $departmentIds = [];
        if ($parent) {
            $children = $parent->students()->get(['id', 'department_id']);
            foreach ($children as $child) {
                if ($child->department_id && !in_array($child->department_id, $departmentIds)) {
                    $departmentIds[] = $child->department_id;
                }
            }
        }
        
        $query = Schedule::with(['department', 'program', 'yearLevel', 'section', 'teacher'])
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
