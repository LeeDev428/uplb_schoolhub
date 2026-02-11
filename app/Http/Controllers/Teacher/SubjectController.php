<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Subject::with(['department', 'yearLevel'])
            ->where('is_active', true);

        // Filter by teacher's department if they have one
        if ($user->department_id) {
            $query->where('department_id', $user->department_id);
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

        return Inertia::render('teacher/subjects/index', [
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'type', 'classification']),
        ]);
    }
}
