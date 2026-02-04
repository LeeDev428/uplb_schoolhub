<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Requirement;
use App\Models\StudentRequirement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequirementTrackingController extends Controller
{
    /**
     * Display requirements tracking page
     */
    public function index(Request $request)
    {
        $studentType = $request->query('type', 'all');
        $search = $request->query('search');
        $status = $request->query('status');
        $program = $request->query('program');

        $query = Student::with(['requirements.requirement'])
            ->orderBy('last_name');

        // Filter by student type
        if ($studentType !== 'all') {
            $query->where('student_type', $studentType);
        }

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        // Program filter
        if ($program) {
            $query->where('program', $program);
        }

        $students = $query->paginate(15)->withQueryString();

        // Get all requirements
        $requirements = Requirement::active()->orderBy('order')->get();

        return Inertia::render('registrar/requirements/tracking', [
            'students' => $students,
            'requirements' => $requirements,
            'filters' => [
                'type' => $studentType,
                'search' => $search,
                'status' => $status,
                'program' => $program,
            ],
        ]);
    }
}
