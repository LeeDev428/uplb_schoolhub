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
        'accounting' => redirect()->route('accounting.dashboard'),
        'student' => redirect()->route('student.dashboard'),
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

    // Academic Structure Management
    Route::resource('departments', \App\Http\Controllers\Owner\DepartmentController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
    Route::resource('programs', \App\Http\Controllers\Owner\ProgramController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
    Route::resource('year-levels', \App\Http\Controllers\Owner\YearLevelController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
    Route::resource('sections', \App\Http\Controllers\Owner\SectionController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
});

// Registrar Routes
Route::prefix('registrar')->name('registrar.')->middleware(['auth', 'verified', 'role:registrar'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\RegistrarDashboardController::class, 'index'])->name('dashboard');

    // Student CRUD Routes
    Route::resource('students', \App\Http\Controllers\StudentController::class)->only([
        'index', 'store', 'show', 'update', 'destroy'
    ]);
    
    // Student Enrollment Clearance
    Route::put('students/{student}/clearance', [App\Http\Controllers\StudentController::class, 'updateClearance'])->name('students.clearance.update');
    Route::put('students/{student}/drop', [App\Http\Controllers\StudentController::class, 'dropStudent'])->name('students.drop');

    // Requirements Tracking (view student requirements status)
    Route::get('requirements', [App\Http\Controllers\RequirementTrackingController::class, 'index'])->name('requirements.index');
    Route::get('requirements/export', [App\Http\Controllers\RequirementTrackingController::class, 'export'])->name('requirements.export');
    Route::post('requirements/test-reminder', [App\Http\Controllers\RequirementTrackingController::class, 'testReminder'])->name('requirements.test-reminder');
    Route::post('requirements/send-reminders', [App\Http\Controllers\RequirementTrackingController::class, 'sendReminders'])->name('requirements.send-reminders');
    
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
    
    Route::get('schedule', function () {
        return Inertia::render('registrar/schedule');
    })->name('schedule');
});

// Accounting Routes
Route::prefix('accounting')->name('accounting.')->middleware(['auth', 'verified', 'role:accounting'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'index'])->name('dashboard');
    
    // Student Fees Management
    Route::resource('fees', App\Http\Controllers\Accounting\StudentFeeController::class);
    
    // Student Payments Management
    Route::get('payments/create', [App\Http\Controllers\Accounting\StudentPaymentController::class, 'create'])->name('payments.create');
    Route::resource('payments', App\Http\Controllers\Accounting\StudentPaymentController::class)->except(['create']);
    
    // Reports
    Route::get('reports', function () {
        return Inertia::render('accounting/reports');
    })->name('reports');
    
    Route::get('settings', function () {
        return Inertia::render('accounting/settings');
    })->name('settings');
});

// Student Portal Routes
Route::prefix('student')->name('student.')->middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');
    Route::get('requirements', [App\Http\Controllers\Student\RequirementController::class, 'index'])->name('requirements');
    Route::get('profile', [App\Http\Controllers\Student\ProfileController::class, 'index'])->name('profile');
});

require __DIR__.'/settings.php';
