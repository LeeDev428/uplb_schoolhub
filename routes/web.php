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

// Helper function to register announcements route for any role
function registerAnnouncementsRoute(): void {
    Route::get('announcements', [App\Http\Controllers\AnnouncementViewController::class, 'index'])->name('announcements.index');
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

    // Announcements
    Route::resource('announcements', \App\Http\Controllers\Owner\AnnouncementController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
    Route::post('announcements/{announcement}/toggle-pin', [\App\Http\Controllers\Owner\AnnouncementController::class, 'togglePin'])->name('announcements.toggle-pin');
    Route::post('announcements/{announcement}/toggle-status', [\App\Http\Controllers\Owner\AnnouncementController::class, 'toggleStatus'])->name('announcements.toggle-status');
});

// Registrar Routes
Route::prefix('registrar')->name('registrar.')->middleware(['auth', 'verified', 'role:registrar'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
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

    // Document Request Approvals - Approve student requests for documents (transcripts, certificates, etc.)
    Route::get('document-approvals', [App\Http\Controllers\Registrar\DocumentApprovalController::class, 'index'])->name('document-approvals.index');
    Route::post('document-approvals/{documentRequest}/approve', [App\Http\Controllers\Registrar\DocumentApprovalController::class, 'approve'])->name('document-approvals.approve');
    Route::post('document-approvals/{documentRequest}/reject', [App\Http\Controllers\Registrar\DocumentApprovalController::class, 'reject'])->name('document-approvals.reject');
    Route::get('document-approvals/{documentRequest}/receipt', [App\Http\Controllers\Registrar\DocumentApprovalController::class, 'viewReceipt'])->name('document-approvals.receipt');

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
    registerAnnouncementsRoute();
    
    Route::get('dashboard', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'index'])->name('dashboard');
    Route::get('main-dashboard', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'mainDashboard'])->name('main-dashboard');
    Route::get('account-dashboard', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'accountDashboard'])->name('account-dashboard');
    
    // Student Accounts Management
    Route::get('student-accounts', [App\Http\Controllers\Accounting\StudentAccountController::class, 'index'])->name('student-accounts.index');
    Route::get('student-accounts/{fee}', [App\Http\Controllers\Accounting\StudentAccountController::class, 'show'])->name('student-accounts.show');
    Route::post('student-accounts/{fee}/mark-overdue', [App\Http\Controllers\Accounting\StudentAccountController::class, 'markOverdue'])->name('student-accounts.mark-overdue');
    Route::post('student-accounts/{fee}/clear-overdue', [App\Http\Controllers\Accounting\StudentAccountController::class, 'clearOverdue'])->name('student-accounts.clear-overdue');
    Route::post('student-accounts/bulk-mark-overdue', [App\Http\Controllers\Accounting\StudentAccountController::class, 'bulkMarkOverdue'])->name('student-accounts.bulk-mark-overdue');
    
    // Student Fees Management (legacy)
    Route::resource('fees', App\Http\Controllers\Accounting\StudentFeeController::class);
    
    // Payment Processing
    Route::get('payments/create', [App\Http\Controllers\Accounting\StudentPaymentController::class, 'create'])->name('payments.create');
    Route::get('payments/process/{student}', [App\Http\Controllers\Accounting\StudentPaymentController::class, 'process'])->name('payments.process');
    Route::get('payments/export', [App\Http\Controllers\Accounting\StudentPaymentController::class, 'export'])->name('payments.export');
    Route::resource('payments', App\Http\Controllers\Accounting\StudentPaymentController::class)->except(['create']);
    
    // Promissory Notes
    Route::get('promissory-notes', [App\Http\Controllers\Accounting\PromissoryNoteController::class, 'index'])->name('promissory-notes.index');
    Route::post('promissory-notes', [App\Http\Controllers\Accounting\PromissoryNoteController::class, 'store'])->name('promissory-notes.store');
    Route::post('promissory-notes/{note}/approve', [App\Http\Controllers\Accounting\PromissoryNoteController::class, 'approve'])->name('promissory-notes.approve');
    Route::post('promissory-notes/{note}/decline', [App\Http\Controllers\Accounting\PromissoryNoteController::class, 'decline'])->name('promissory-notes.decline');
    
    // Document Requests Management
    Route::get('document-requests', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'index'])->name('document-requests.index');
    Route::post('document-requests', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'store'])->name('document-requests.store');
    Route::put('document-requests/{documentRequest}', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'update'])->name('document-requests.update');
    Route::delete('document-requests/{documentRequest}', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'destroy'])->name('document-requests.destroy');
    Route::post('document-requests/{documentRequest}/mark-paid', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'markPaid'])->name('document-requests.mark-paid');
    Route::post('document-requests/{documentRequest}/process', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'process'])->name('document-requests.process');
    Route::post('document-requests/{documentRequest}/mark-ready', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'markReady'])->name('document-requests.mark-ready');
    Route::post('document-requests/{documentRequest}/release', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'release'])->name('document-requests.release');
    Route::post('document-requests/{documentRequest}/cancel', [App\Http\Controllers\Accounting\DocumentRequestController::class, 'cancel'])->name('document-requests.cancel');

    // Document Request Approvals (new workflow - student-initiated requests)
    Route::get('document-approvals', [App\Http\Controllers\Accounting\DocumentApprovalController::class, 'index'])->name('document-approvals.index');
    Route::post('document-approvals/{documentRequest}/approve', [App\Http\Controllers\Accounting\DocumentApprovalController::class, 'approve'])->name('document-approvals.approve');
    Route::post('document-approvals/{documentRequest}/reject', [App\Http\Controllers\Accounting\DocumentApprovalController::class, 'reject'])->name('document-approvals.reject');
    Route::get('document-approvals/{documentRequest}/receipt', [App\Http\Controllers\Accounting\DocumentApprovalController::class, 'viewReceipt'])->name('document-approvals.receipt');
    
    // Student Grants Management
    Route::get('grants', [App\Http\Controllers\Accounting\GrantController::class, 'index'])->name('grants.index');
    Route::post('grants', [App\Http\Controllers\Accounting\GrantController::class, 'store'])->name('grants.store');
    Route::put('grants/{grant}', [App\Http\Controllers\Accounting\GrantController::class, 'update'])->name('grants.update');
    Route::delete('grants/{grant}', [App\Http\Controllers\Accounting\GrantController::class, 'destroy'])->name('grants.destroy');
    Route::post('grants/recipients', [App\Http\Controllers\Accounting\GrantController::class, 'assignRecipient'])->name('grants.assign-recipient');
    Route::put('grants/recipients/{recipient}', [App\Http\Controllers\Accounting\GrantController::class, 'updateRecipient'])->name('grants.update-recipient');
    Route::delete('grants/recipients/{recipient}', [App\Http\Controllers\Accounting\GrantController::class, 'removeRecipient'])->name('grants.remove-recipient');
    
    // Exam Approval
    Route::get('exam-approval', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'index'])->name('exam-approval.index');
    Route::post('exam-approval', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'store'])->name('exam-approval.store');
    Route::post('exam-approval/{approval}/approve', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'approve'])->name('exam-approval.approve');
    Route::post('exam-approval/{approval}/deny', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'deny'])->name('exam-approval.deny');
    Route::put('exam-approval/{approval}/paid-amount', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'updatePaidAmount'])->name('exam-approval.update-paid');
    Route::delete('exam-approval/{approval}', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'destroy'])->name('exam-approval.destroy');
    Route::post('exam-approval/bulk-approve', [App\Http\Controllers\Accounting\ExamApprovalController::class, 'bulkApprove'])->name('exam-approval.bulk-approve');
    
    // Fee Management (Administration)
    Route::get('fee-management', [App\Http\Controllers\Accounting\FeeManagementController::class, 'index'])->name('fee-management.index');
    Route::post('fee-management/categories', [App\Http\Controllers\Accounting\FeeManagementController::class, 'storeCategory'])->name('fee-management.store-category');
    Route::put('fee-management/categories/{category}', [App\Http\Controllers\Accounting\FeeManagementController::class, 'updateCategory'])->name('fee-management.update-category');
    Route::delete('fee-management/categories/{category}', [App\Http\Controllers\Accounting\FeeManagementController::class, 'destroyCategory'])->name('fee-management.destroy-category');
    Route::post('fee-management/items', [App\Http\Controllers\Accounting\FeeManagementController::class, 'storeItem'])->name('fee-management.store-item');
    Route::put('fee-management/items/{item}', [App\Http\Controllers\Accounting\FeeManagementController::class, 'updateItem'])->name('fee-management.update-item');
    Route::delete('fee-management/items/{item}', [App\Http\Controllers\Accounting\FeeManagementController::class, 'destroyItem'])->name('fee-management.destroy-item');
    Route::post('fee-management/recalculate', [App\Http\Controllers\Accounting\FeeManagementController::class, 'recalculateFees'])->name('fee-management.recalculate');
    
    // Document Fee Items
    Route::post('fee-management/document-fees', [App\Http\Controllers\Accounting\FeeManagementController::class, 'storeDocumentFee'])->name('fee-management.store-document-fee');
    Route::put('fee-management/document-fees/{documentFee}', [App\Http\Controllers\Accounting\FeeManagementController::class, 'updateDocumentFee'])->name('fee-management.update-document-fee');
    Route::delete('fee-management/document-fees/{documentFee}', [App\Http\Controllers\Accounting\FeeManagementController::class, 'destroyDocumentFee'])->name('fee-management.destroy-document-fee');
    
    // Fee Assignments (Bulk assign fees to classification/department/year_level)
    Route::get('fee-management/assignments', [App\Http\Controllers\Accounting\FeeManagementController::class, 'getAssignments'])->name('fee-management.get-assignments');
    Route::post('fee-management/assignments', [App\Http\Controllers\Accounting\FeeManagementController::class, 'saveAssignments'])->name('fee-management.save-assignments');
    
    // Online Transactions
    Route::get('online-transactions', [App\Http\Controllers\Accounting\OnlineTransactionController::class, 'index'])->name('online-transactions.index');
    Route::post('online-transactions/{transaction}/verify', [App\Http\Controllers\Accounting\OnlineTransactionController::class, 'verify'])->name('online-transactions.verify');
    Route::post('online-transactions/{transaction}/failed', [App\Http\Controllers\Accounting\OnlineTransactionController::class, 'markFailed'])->name('online-transactions.failed');
    Route::post('online-transactions/{transaction}/refund', [App\Http\Controllers\Accounting\OnlineTransactionController::class, 'refund'])->name('online-transactions.refund');
    Route::delete('online-transactions/{transaction}', [App\Http\Controllers\Accounting\OnlineTransactionController::class, 'destroy'])->name('online-transactions.destroy');
    
    // Student Clearance Management
    Route::get('clearance', [App\Http\Controllers\Accounting\StudentClearanceController::class, 'index'])->name('clearance.index');
    Route::get('clearance/{student}', [App\Http\Controllers\Accounting\StudentClearanceController::class, 'show'])->name('clearance.show');
    Route::put('clearance/{student}', [App\Http\Controllers\Accounting\StudentClearanceController::class, 'updateClearance'])->name('clearance.update');
    Route::post('clearance/bulk-clear', [App\Http\Controllers\Accounting\StudentClearanceController::class, 'bulkClear'])->name('clearance.bulk');
    
    // Reports
    Route::get('reports', [App\Http\Controllers\Accounting\ReportsController::class, 'index'])->name('reports');
    Route::get('reports/export', [App\Http\Controllers\Accounting\ReportsController::class, 'export'])->name('reports.export');
    
    // Dashboard exports
    Route::get('dashboard/export', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'export'])->name('dashboard.export');
    Route::get('account-dashboard/export', [App\Http\Controllers\Accounting\AccountingDashboardController::class, 'exportAccountDashboard'])->name('account-dashboard.export');
    
});

// Student Portal Routes
Route::prefix('student')->name('student.')->middleware(['auth', 'verified', 'role:student'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
    Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');
    Route::get('requirements', [App\Http\Controllers\Student\RequirementController::class, 'index'])->name('requirements');
    Route::get('profile', [App\Http\Controllers\Student\ProfileController::class, 'index'])->name('profile');
    
    // Document Requests (available to all students)
    Route::get('document-requests', [App\Http\Controllers\Student\DocumentRequestController::class, 'index'])->name('document-requests.index');
    Route::post('document-requests', [App\Http\Controllers\Student\DocumentRequestController::class, 'store'])->name('document-requests.store');
    Route::get('document-requests/history', [App\Http\Controllers\Student\DocumentRequestController::class, 'history'])->name('document-requests.history');
    Route::post('document-requests/{documentRequest}/cancel', [App\Http\Controllers\Student\DocumentRequestController::class, 'cancel'])->name('document-requests.cancel');
    
    // Promissory Notes (available to all students)
    Route::get('promissory-notes', [App\Http\Controllers\Student\PromissoryNoteController::class, 'index'])->name('promissory-notes.index');
    Route::post('promissory-notes', [App\Http\Controllers\Student\PromissoryNoteController::class, 'store'])->name('promissory-notes.store');
    Route::delete('promissory-notes/{note}/cancel', [App\Http\Controllers\Student\PromissoryNoteController::class, 'cancel'])->name('promissory-notes.cancel');
    
    // Online Payments (available to all students)
    Route::get('online-payments', [App\Http\Controllers\Student\OnlinePaymentController::class, 'index'])->name('online-payments.index');
    Route::post('online-payments', [App\Http\Controllers\Student\OnlinePaymentController::class, 'store'])->name('online-payments.store');
    
    // Routes that require enrollment
    Route::middleware(['enrolled'])->group(function () {
        Route::get('subjects', [App\Http\Controllers\Student\SubjectController::class, 'index'])->name('subjects');
        Route::get('schedules', [App\Http\Controllers\Student\ScheduleController::class, 'index'])->name('schedules');
        
        // Quizzes
        Route::get('quizzes', [App\Http\Controllers\Student\QuizController::class, 'index'])->name('quizzes.index');
        Route::get('quizzes/{quiz}', [App\Http\Controllers\Student\QuizController::class, 'show'])->name('quizzes.show');
        Route::post('quizzes/{quiz}/start', [App\Http\Controllers\Student\QuizController::class, 'start'])->name('quizzes.start');
        Route::get('quizzes/take/{attempt}', [App\Http\Controllers\Student\QuizController::class, 'take'])->name('quizzes.take');
        Route::post('quizzes/take/{attempt}/save', [App\Http\Controllers\Student\QuizController::class, 'saveResponse'])->name('quizzes.save-response');
        Route::post('quizzes/take/{attempt}/submit', [App\Http\Controllers\Student\QuizController::class, 'submit'])->name('quizzes.submit');
        Route::get('quizzes/result/{attempt}', [App\Http\Controllers\Student\QuizController::class, 'result'])->name('quizzes.result');
    });
});

// Teacher Portal Routes
Route::prefix('teacher')->name('teacher.')->middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
    Route::get('dashboard', [App\Http\Controllers\Teacher\DashboardController::class, 'index'])->name('dashboard');
    Route::get('students', [App\Http\Controllers\Teacher\StudentController::class, 'index'])->name('students.index');
    Route::get('students/{student}', [App\Http\Controllers\Teacher\StudentController::class, 'show'])->name('students.show');
    Route::get('classes', [App\Http\Controllers\Teacher\ClassController::class, 'index'])->name('classes.index');
    Route::get('classes/{section}', [App\Http\Controllers\Teacher\ClassController::class, 'show'])->name('classes.show');
    Route::get('subjects', [App\Http\Controllers\Teacher\SubjectController::class, 'index'])->name('subjects');
    Route::get('subjects/{subject}/students', [App\Http\Controllers\Teacher\SubjectController::class, 'students'])->name('subjects.students');
    Route::get('schedules', [App\Http\Controllers\Teacher\ScheduleController::class, 'index'])->name('schedules');
    Route::get('grades', [App\Http\Controllers\Teacher\GradeController::class, 'index'])->name('grades.index');
    Route::get('attendance', [App\Http\Controllers\Teacher\AttendanceController::class, 'index'])->name('attendance.index');
    
    // Quizzes
    Route::resource('quizzes', App\Http\Controllers\Teacher\QuizController::class);
    Route::post('quizzes/{quiz}/toggle-publish', [App\Http\Controllers\Teacher\QuizController::class, 'togglePublish'])->name('quizzes.toggle-publish');
    Route::post('quizzes/{quiz}/toggle-active', [App\Http\Controllers\Teacher\QuizController::class, 'toggleActive'])->name('quizzes.toggle-active');
    Route::get('quizzes/{quiz}/results', [App\Http\Controllers\Teacher\QuizController::class, 'results'])->name('quizzes.results');
    Route::post('quiz-attempts/{attempt}/grade', [App\Http\Controllers\Teacher\QuizController::class, 'gradeAttempt'])->name('quiz-attempts.grade');
});

// Guidance Counselor Portal Routes
Route::prefix('guidance')->name('guidance.')->middleware(['auth', 'verified', 'role:guidance'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
    Route::get('dashboard', [App\Http\Controllers\Guidance\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('records', App\Http\Controllers\Guidance\RecordController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
});

// Librarian Portal Routes
Route::prefix('librarian')->name('librarian.')->middleware(['auth', 'verified', 'role:librarian'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
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
    registerAnnouncementsRoute();
    
    Route::get('dashboard', function () {
        return Inertia::render('parent/dashboard');
    })->name('dashboard');
    Route::get('subjects', [App\Http\Controllers\Parent\SubjectController::class, 'index'])->name('subjects');
    Route::get('schedules', [App\Http\Controllers\Parent\ScheduleController::class, 'index'])->name('schedules');
});

// Clinic Portal Routes
Route::prefix('clinic')->name('clinic.')->middleware(['auth', 'verified', 'role:clinic'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
    Route::get('dashboard', function () {
        return Inertia::render('clinic/dashboard');
    })->name('dashboard');
});

// Canteen Portal Routes
Route::prefix('canteen')->name('canteen.')->middleware(['auth', 'verified', 'role:canteen'])->group(function () {
    registerSettingsRoutes();
    registerAnnouncementsRoute();
    
    Route::get('dashboard', function () {
        return Inertia::render('canteen/dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
