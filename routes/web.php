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
        'teacher' => redirect()->route('teacher.dashboard'),
        'parent' => redirect()->route('parent.dashboard'),
        'guidance' => redirect()->route('guidance.dashboard'),
        'librarian' => redirect()->route('librarian.dashboard'),
        'clinic' => redirect()->route('clinic.dashboard'),
        'canteen' => redirect()->route('canteen.dashboard'),
        default => Inertia::render('dashboard'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// Helper function to register settings routes for any role
function registerSettingsRoutes(): void {
    Route::redirect('settings', 'settings/profile');
    Route::get('settings/profile', [App\Http\Controllers\Settings\RoleSettingsController::class, 'editProfile'])->name('settings.profile');
    Route::patch('settings/profile', [App\Http\Controllers\Settings\RoleSettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::delete('settings/profile', [App\Http\Controllers\Settings\RoleSettingsController::class, 'destroyProfile'])->name('settings.profile.destroy');
    Route::get('settings/password', [App\Http\Controllers\Settings\RoleSettingsController::class, 'editPassword'])->name('settings.password');
    Route::put('settings/password', [App\Http\Controllers\Settings\RoleSettingsController::class, 'updatePassword'])->name('settings.password.update');
    Route::get('settings/two-factor', [App\Http\Controllers\Settings\RoleSettingsController::class, 'showTwoFactor'])->name('settings.two-factor');
    Route::get('settings/appearance', [App\Http\Controllers\Settings\RoleSettingsController::class, 'editAppearance'])->name('settings.appearance');
}

// Owner Routes
Route::prefix('owner')->name('owner.')->middleware(['auth', 'verified', 'role:owner'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', [App\Http\Controllers\Owner\OwnerDashboardController::class, 'index'])->name('dashboard');

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

    Route::get('calendar', [App\Http\Controllers\Owner\CalendarController::class, 'index'])->name('calendar');

    Route::get('reports', [App\Http\Controllers\Owner\ReportsController::class, 'index'])->name('reports');
    Route::get('reports/export/financial', [App\Http\Controllers\Owner\ReportsController::class, 'exportFinancial'])->name('reports.export.financial');
    Route::get('reports/export/students', [App\Http\Controllers\Owner\ReportsController::class, 'exportStudents'])->name('reports.export.students');

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
    Route::resource('subjects', \App\Http\Controllers\Owner\SubjectController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
    Route::resource('schedules', \App\Http\Controllers\Owner\ScheduleController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);

    // User Management
    Route::resource('users', \App\Http\Controllers\Owner\UserManagementController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
});

// Registrar Routes
Route::prefix('registrar')->name('registrar.')->middleware(['auth', 'verified', 'role:registrar'])->group(function () {
    registerSettingsRoutes();
    
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

    // Document Requests - Review student-submitted documents
    Route::get('documents/requests', [App\Http\Controllers\Registrar\DocumentRequestController::class, 'index'])->name('documents.requests');
    Route::post('documents/{document}/approve', [App\Http\Controllers\Registrar\DocumentRequestController::class, 'approve'])->name('documents.approve');
    Route::post('documents/{document}/reject', [App\Http\Controllers\Registrar\DocumentRequestController::class, 'reject'])->name('documents.reject');
    Route::delete('documents/{document}', [App\Http\Controllers\Registrar\DocumentRequestController::class, 'destroy'])->name('documents.destroy');

    // Academic Deadlines
    Route::resource('deadlines', \App\Http\Controllers\Registrar\RegistrarDeadlineController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);

    // Subjects Management
    Route::resource('subjects', \App\Http\Controllers\Registrar\RegistrarSubjectController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);

    Route::get('classes', [App\Http\Controllers\Registrar\ClassController::class, 'index'])->name('classes');
    Route::post('classes/assign', [App\Http\Controllers\Registrar\ClassController::class, 'assignStudents'])->name('classes.assign');
    Route::delete('classes/remove/{student}', [App\Http\Controllers\Registrar\ClassController::class, 'removeStudent'])->name('classes.remove');

    Route::get('reports', [App\Http\Controllers\Registrar\ReportsController::class, 'index'])->name('reports');

    Route::get('archived', function () {
        return Inertia::render('registrar/archived');
    })->name('archived');

    Route::get('schedule', [App\Http\Controllers\Registrar\ScheduleController::class, 'index'])->name('schedule');
});

// Accounting Routes
Route::prefix('accounting')->name('accounting.')->middleware(['auth', 'verified', 'role:accounting'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'index'])->name('dashboard');
    
    // Student Fees Management
    Route::resource('fees', App\Http\Controllers\Accounting\StudentFeeController::class);
    
    // Student Payments Management
    Route::get('payments/create', [App\Http\Controllers\Accounting\StudentPaymentController::class, 'create'])->name('payments.create');
    Route::resource('payments', App\Http\Controllers\Accounting\StudentPaymentController::class)->except(['create']);
    
    // Reports
    Route::get('reports', [App\Http\Controllers\Accounting\ReportsController::class, 'index'])->name('reports');
    Route::get('reports/export', [App\Http\Controllers\Accounting\ReportsController::class, 'export'])->name('reports.export');
    
});

// Student Portal Routes
Route::prefix('student')->name('student.')->middleware(['auth', 'verified', 'role:student'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');
    Route::get('requirements', [App\Http\Controllers\Student\RequirementController::class, 'index'])->name('requirements');
    Route::get('subjects', [App\Http\Controllers\Student\SubjectController::class, 'index'])->name('subjects');
    Route::get('schedules', [App\Http\Controllers\Student\ScheduleController::class, 'index'])->name('schedules');
    Route::get('profile', [App\Http\Controllers\Student\ProfileController::class, 'index'])->name('profile');
});

// Teacher Portal Routes
Route::prefix('teacher')->name('teacher.')->middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', [App\Http\Controllers\Teacher\DashboardController::class, 'index'])->name('dashboard');
    Route::get('students', [App\Http\Controllers\Teacher\StudentController::class, 'index'])->name('students.index');
    Route::get('students/{student}', [App\Http\Controllers\Teacher\StudentController::class, 'show'])->name('students.show');
    Route::get('classes', [App\Http\Controllers\Teacher\ClassController::class, 'index'])->name('classes.index');
    Route::get('classes/{section}', [App\Http\Controllers\Teacher\ClassController::class, 'show'])->name('classes.show');
    Route::get('subjects', [App\Http\Controllers\Teacher\SubjectController::class, 'index'])->name('subjects');
    Route::get('schedules', [App\Http\Controllers\Teacher\ScheduleController::class, 'index'])->name('schedules');
    Route::get('grades', [App\Http\Controllers\Teacher\GradeController::class, 'index'])->name('grades.index');
    Route::get('attendance', [App\Http\Controllers\Teacher\AttendanceController::class, 'index'])->name('attendance.index');
});

// Guidance Counselor Portal Routes
Route::prefix('guidance')->name('guidance.')->middleware(['auth', 'verified', 'role:guidance'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', [App\Http\Controllers\Guidance\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('records', App\Http\Controllers\Guidance\RecordController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
});

// Librarian Portal Routes
Route::prefix('librarian')->name('librarian.')->middleware(['auth', 'verified', 'role:librarian'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', [App\Http\Controllers\Librarian\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('books', App\Http\Controllers\Librarian\BookController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
    Route::resource('transactions', App\Http\Controllers\Librarian\TransactionController::class)->only([
        'index', 'store', 'update'
    ]);
});

// Parent Portal Routes
Route::prefix('parent')->name('parent.')->middleware(['auth', 'verified', 'role:parent'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', function () {
        return Inertia::render('parent/dashboard');
    })->name('dashboard');
    Route::get('subjects', [App\Http\Controllers\Parent\SubjectController::class, 'index'])->name('subjects');
    Route::get('schedules', [App\Http\Controllers\Parent\ScheduleController::class, 'index'])->name('schedules');
});

// Clinic Portal Routes
Route::prefix('clinic')->name('clinic.')->middleware(['auth', 'verified', 'role:clinic'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', function () {
        return Inertia::render('clinic/dashboard');
    })->name('dashboard');
});

// Canteen Portal Routes
Route::prefix('canteen')->name('canteen.')->middleware(['auth', 'verified', 'role:canteen'])->group(function () {
    registerSettingsRoutes();
    
    Route::get('dashboard', function () {
        return Inertia::render('canteen/dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
