<?php

namespace App\Http\Controllers\Student;

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
        
        // Get student's department from their enrollment
        $query = Subject::with(['department', 'yearLevel'])
            ->where('is_active', true);

        // Filter by student's department if they have one
        if ($user->department_id) {
            $query->where('department_id', $user->department_id);
        }

        // Filter by student's year level if they have one
        if ($user->year_level_id) {
            $query->where(function($q) use ($user) {
                $q->where('year_level_id', $user->year_level_id)
                    ->orWhereNull('year_level_id');
            });
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

        $subjects = $query->orderBy('code')->paginate(15)->withQueryString();

        return Inertia::render('student/subjects/index', [
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'type']),
        ]);
    }
}
