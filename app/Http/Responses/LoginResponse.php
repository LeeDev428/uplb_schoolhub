<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Authentication failed. Please try again.');
        }

        // Redirect based on user role
        $route = match ($user->role) {
            'owner' => route('owner.dashboard'),
            'registrar' => route('registrar.dashboard'),
            'accounting' => route('accounting.dashboard'),
            'student' => route('student.dashboard'),
            'teacher' => route('teacher.dashboard'),
            'parent' => route('parent.dashboard'),
            'guidance' => route('guidance.dashboard'),
            'librarian' => route('librarian.dashboard'),
            'clinic' => route('clinic.dashboard'),
            'canteen' => route('canteen.dashboard'),
            default => route('dashboard'),
        };

        return redirect()->intended($route)->with('success', 'Welcome back, ' . $user->name . '!');
    }
}
