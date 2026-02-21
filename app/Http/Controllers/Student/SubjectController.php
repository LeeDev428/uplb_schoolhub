<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Program;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;
        
        // Get student's department from their program
        $query = Subject::with(['department', 'yearLevel', 'teachers:id,first_name,last_name'])
            ->where('is_active', true);

        // Filter by student's department (get from program)
        if ($student && $student->program) {
            $program = Program::where('name', $student->program)->first();
            if ($program) {
                $query->where('department_id', $program->department_id);
            }
        }

        // Filter by student's year level if they have one
        if ($student && $student->year_level) {
            $yearLevel = YearLevel::where('name', $student->year_level)->first();
            if ($yearLevel) {
                $query->where(function($q) use ($yearLevel) {
                    $q->where('year_level_id', $yearLevel->id)
                        ->orWhereNull('year_level_id');
                });
            }
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
