<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Default dashboard - redirect based on role
Route::get('dashboard', function () {
    $user = Auth::user();

    if (! $user) {
        return redirect()->route('login');
    }

    return match ($user->role) {
        'owner' => redirect()->route('owner.dashboard'),
        'registrar' => redirect()->route('registrar.dashboard'),
        default => Inertia::render('dashboard'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// Owner Routes
Route::prefix('owner')->name('owner.')->middleware(['auth', 'verified', 'role:owner'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('owner/dashboard');
    })->name('dashboard');

    Route::get('income/today', function () {
        return Inertia::render('owner/dashboard');
    })->name('income.today');

    Route::get('income/overall', function () {
        return Inertia::render('owner/dashboard');
    })->name('income.overall');

    Route::get('income/expected', function () {
        return Inertia::render('owner/dashboard');
    })->name('income.expected');

    Route::get('departments', function () {
        return Inertia::render('owner/dashboard');
    })->name('departments');

    Route::get('calendar', function () {
        return Inertia::render('owner/dashboard');
    })->name('calendar');

    Route::get('reports', function () {
        return Inertia::render('owner/dashboard');
    })->name('reports');
});

// Registrar Routes
Route::prefix('registrar')->name('registrar.')->middleware(['auth', 'verified', 'role:registrar'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('registrar/dashboard');
    })->name('dashboard');

    // Student CRUD Routes
    Route::resource('students', \App\Http\Controllers\StudentController::class)->only([
        'index', 'store', 'show', 'update', 'destroy'
    ]);
    
    // Student Enrollment Clearance
    Route::put('students/{student}/clearance', [App\Http\Controllers\StudentController::class, 'updateClearance'])->name('students.clearance.update');

    // Requirements Tracking (view student requirements status)
    Route::get('requirements', [App\Http\Controllers\RequirementTrackingController::class, 'index'])->name('requirements.index');
    
    // Create Documents - Requirements Manager (CRUD for requirement definitions)
    Route::get('documents/create', [App\Http\Controllers\RequirementController::class, 'index'])->name('documents.create');
    Route::post('documents/requirements', [App\Http\Controllers\RequirementController::class, 'store'])->name('documents.requirements.store');
    Route::put('documents/requirements/{requirement}', [App\Http\Controllers\RequirementController::class, 'update'])->name('documents.requirements.update');
    Route::delete('documents/requirements/{requirement}', [App\Http\Controllers\RequirementController::class, 'destroy'])->name('documents.requirements.destroy');
    Route::post('documents/requirements/categories', [App\Http\Controllers\RequirementController::class, 'storeCategory'])->name('documents.requirements.categories.store');
    
    // Student Requirement Actions
    Route::put('student-requirements/{studentRequirement}/status', [App\Http\Controllers\StudentRequirementController::class, 'updateStatus'])->name('student-requirements.update-status');
    Route::post('student-requirements/{studentRequirement}/upload', [App\Http\Controllers\StudentRequirementController::class, 'uploadFile'])->name('student-requirements.upload');

    Route::get('documents/requests', function () {
        return Inertia::render('registrar/documents/requests');
    })->name('documents.requests');

    Route::get('deadlines', function () {
        return Inertia::render('registrar/deadlines');
    })->name('deadlines');

    Route::get('classes', function () {
        return Inertia::render('registrar/classes');
    })->name('classes');

    Route::get('reports', function () {
        return Inertia::render('registrar/reports');
    })->name('reports');

    Route::get('archived', function () {
        return Inertia::render('registrar/archived');
    })->name('archived');

    Route::get('settings', function () {
        return Inertia::render('registrar/settings');
    })->name('settings');
});

require __DIR__.'/settings.php';
