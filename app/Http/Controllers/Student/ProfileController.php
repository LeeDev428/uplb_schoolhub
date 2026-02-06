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
        $student = $request->user()->student()->with([
            'department',
            'program',
            'yearLevel',
            'section',
        ])->first();
        
        if (!$student) {
            abort(404, 'Student record not found');
        }

        return Inertia::render('student/profile', [
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'first_name' => $student->first_name,
                'middle_name' => $student->middle_name,
                'last_name' => $student->last_name,
                'full_name' => $student->full_name,
                'date_of_birth' => $student->date_of_birth?->format('M d, Y'),
                'gender' => $student->gender,
                'contact_number' => $student->contact_number,
                'email' => $student->email,
                'address' => $student->address,
                'enrollment_status' => $student->enrollment_status,
                'lrn' => $student->lrn,
                'department' => $student->department?->name,
                'program' => $student->program?->name,
                'year_level' => $student->yearLevel?->name,
                'section' => $student->section?->name,
                'guardian_name' => $student->guardian_name,
                'guardian_relationship' => $student->guardian_relationship,
                'guardian_contact' => $student->guardian_contact,
                'guardian_address' => $student->guardian_address,
                'created_at' => $student->created_at->format('M d, Y'),
            ],
            'user' => [
                'username' => $request->user()->username,
                'email' => $request->user()->email,
            ],
        ]);
    }
}
