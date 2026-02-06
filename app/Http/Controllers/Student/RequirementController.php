<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RequirementController extends Controller
{
    /**
     * Display student's requirements list
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student()->with(['requirements.requirement'])->first();
        
        if (!$student) {
            abort(404, 'Student record not found');
        }

        $requirements = $student->requirements->map(function ($studentRequirement) {
            return [
                'id' => $studentRequirement->requirement->id,
                'name' => $studentRequirement->requirement->name,
                'description' => $studentRequirement->requirement->description,
                'status' => $studentRequirement->status,
                'submitted_at' => $studentRequirement->submitted_at?->format('M d, Y'),
                'approved_at' => $studentRequirement->approved_at?->format('M d, Y'),
                'notes' => $studentRequirement->notes,
            ];
        });

        return Inertia::render('student/requirements', [
            'requirements' => $requirements,
            'student' => [
                'name' => $student->full_name,
                'student_id' => $student->student_id,
            ],
        ]);
    }
}
