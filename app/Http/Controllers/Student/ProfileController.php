<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display student's profile
     */
    public function index(Request $request): Response
    {
        $student = $request->user()->student;
        
        if (!$student) {
            abort(404, 'Student record not found');
        }

        return Inertia::render('student/profile', [
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id ?? $student->lrn,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'suffix' => $student->suffix,
                'full_name' => $student->full_name,
                'date_of_birth' => $student->date_of_birth?->format('M d, Y'),
                'gender' => $student->gender,
                'phone' => $student->phone,
                'email' => $student->email,
                'complete_address' => $student->complete_address,
                'city_municipality' => $student->city_municipality,
                'zip_code' => $student->zip_code,
                'religion' => $student->religion,
                'mother_tongue' => $student->mother_tongue,
                'dialects' => $student->dialects,
                'ethnicities' => $student->ethnicities,
                'enrollment_status' => $student->enrollment_status,
                'lrn' => $student->lrn,
                'program' => $student->program,
                'year_level' => $student->year_level,
                'section' => $student->section,
                'school_year' => $student->school_year,
                'student_type' => $student->student_type,
                'guardian_name' => $student->guardian_name,
                'guardian_relationship' => $student->guardian_relationship,
                'guardian_contact' => $student->guardian_contact,
                'guardian_email' => $student->guardian_email,
                'created_at' => $student->created_at->format('M d, Y'),
            ],
            'user' => [
                'username' => $request->user()->username,
                'email' => $request->user()->email,
            ],
        ]);
    }
}
