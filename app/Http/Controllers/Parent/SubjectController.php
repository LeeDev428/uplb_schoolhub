<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Student;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get children's departments
        $children = User::where('parent_id', $user->id)
            ->where('role', 'student')
            ->whereNotNull('department_id')
            ->pluck('department_id')
            ->unique()
            ->toArray();

        $query = Subject::with(['department', 'yearLevel'])
            ->where('is_active', true);

        // Filter by children's departments
        if (!empty($children)) {
            $query->whereIn('department_id', $children);
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
