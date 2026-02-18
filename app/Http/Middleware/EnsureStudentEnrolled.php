<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentEnrolled
{
    /**
     * Handle an incoming request.
     *
     * Routes protected by this middleware require the student to be officially enrolled.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Only apply to students
        if (!$user || $user->role !== 'student' || !$user->student_id) {
            return $next($request);
        }

        // Load student data
        $student = \App\Models\Student::find($user->student_id);
        
        if (!$student) {
            return $next($request);
        }

        // Check if student is enrolled
        if ($student->enrollment_status !== 'enrolled') {
            // For Inertia requests, return an Inertia response
            if ($request->header('X-Inertia')) {
                return inertia('student/not-enrolled', [
                    'student' => [
                        'first_name' => $student->first_name,
                        'last_name' => $student->last_name,
                        'enrollment_status' => $student->enrollment_status,
                    ],
                    'message' => 'You must be officially enrolled to access this page.',
                ]);
            }

            // For regular requests, redirect with error
            return redirect()->route('student.dashboard')
                ->with('error', 'You must be officially enrolled to access this page.');
        }

        return $next($request);
    }
}
