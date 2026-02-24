<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentActive
{
    /**
     * Handle an incoming request.
     * Block students who have been dropped and deactivated.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Only check for student role
        if ($user->role !== 'student') {
            return $next($request);
        }

        // Check if student exists and is active
        if ($user->student_id) {
            $student = $user->student;
            
            if ($student && !$student->is_active) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->with('error', 
                    'Your account has been deactivated due to enrollment drop. Please visit the registrar\'s office to reactivate your account.'
                );
            }
        }

        return $next($request);
    }
}
