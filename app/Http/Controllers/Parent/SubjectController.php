<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $parent = $user->parent;
        
        // Get department IDs from all children
        $departmentIds = [];
        if ($parent) {
            $children = $parent->students()->get(['id', 'department_id', 'program']);
            foreach ($children as $child) {
                if ($child->department_id && !in_array($child->department_id, $departmentIds)) {
                    $departmentIds[] = $child->department_id;
                }
            }
        }

        $query = Subject::with(['department', 'yearLevel', 'teachers:id,first_name,last_name'])
            ->where('is_active', true);

        // Filter by children's departments
        if (!empty($departmentIds)) {
            $query->whereIn('department_id', $departmentIds);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        // Classification filter
        if ($request->filled('classification') && $request->input('classification') !== 'all') {
            $query->where('classification', $request->input('classification'));
        }

        $subjects = $query->orderBy('code')->paginate(15)->withQueryString();

        return Inertia::render('parent/subjects/index', [
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'type', 'classification']),
        ]);
    }
}
