<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use App\Models\StudentActionLog;
use App\Models\Department;
use App\Models\Program;
use App\Models\YearLevel;
use App\Models\Section;
use App\Models\Requirement;
use App\Models\StudentRequirement;
use App\Models\ParentModel;
use App\Models\Subject;
use App\Models\StudentSubject;
use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Student::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('student_type', $request->type);
        }

        // Program filter
        if ($request->filled('program') && $request->program !== 'all') {
            $query->where('program', $request->program);
        }

        // Year level filter
        if ($request->filled('year_level') && $request->year_level !== 'all') {
            $query->where('year_level', $request->year_level);
        }

        // Enrollment status filter
        if ($request->filled('enrollment_status') && $request->enrollment_status !== 'all') {
            $query->where('enrollment_status', $request->enrollment_status);
        }

        // Requirements status filter
        if ($request->filled('requirements_status') && $request->requirements_status !== 'all') {
            $query->where('requirements_status', $request->requirements_status);
        }

        // Follow Up Sectioning: students without a section assigned
        if ($request->input('needs_sectioning') === '1') {
            $query->where(function ($q) {
                $q->whereNull('section')->orWhere('section', '');
            });
        }

        // School year filter
        if ($request->filled('school_year') && $request->school_year !== 'all') {
            $query->where('school_year', $request->school_year);
        }

        // Get paginated students with requirements and enrollmentClearance
        $students = $query->with(['requirements.requirement', 'enrollmentClearance', 'user'])->latest()->paginate(10)->withQueryString();

        // Compute dynamic requirements status for each student
        $students->getCollection()->transform(function ($student) {
            $total = $student->requirements->count();
            $approved = $student->requirements->where('status', 'approved')->count();
            $percentage = $total > 0 ? round(($approved / $total) * 100) : 0;
            
            $student->requirements_percentage = $percentage;
            $student->requirements_status = $percentage === 100 ? 'complete' : ($percentage > 0 ? 'pending' : 'incomplete');
            $student->email_verified = $student->user && $student->user->email_verified_at !== null;
            
            return $student;
        });

        // Get statistics
        $stats = [
            'allStudents' => Student::count(),
            'officiallyEnrolled' => Student::where('enrollment_status', 'enrolled')->count(),
            'notEnrolled' => Student::where('enrollment_status', 'not-enrolled')->count(),
            'registrarPending' => Student::where('enrollment_status', 'pending-registrar')->count(),
            'accountingPending' => Student::where('enrollment_status', 'pending-accounting')->count(),
            'graduated' => Student::where('enrollment_status', 'graduated')->count(),
            'dropped' => Student::where('enrollment_status', 'dropped')->count(),
        ];

        // Get unique values for filters
        $programs = Student::select('program')->distinct()->pluck('program');
        $yearLevels = Student::select('year_level')->distinct()->pluck('year_level');
        $schoolYears = Student::whereNotNull('school_year')->distinct()->pluck('school_year')->sort()->values();

        // Get academic structure data for the form
        $departments = Department::where('is_active', true)->get(['id', 'name', 'classification']);
        $allPrograms = Program::where('is_active', true)->with('department:id,name')->get(['id', 'name', 'department_id']);
        $allYearLevels = YearLevel::where('is_active', true)->with('department:id,name')->get(['id', 'name', 'department_id', 'level_number']);
        $sections = Section::where('is_active', true)
            ->with(['yearLevel:id,name', 'department:id,name', 'strand:id,name,code'])
            ->get(['id', 'name', 'year_level_id', 'department_id', 'strand_id', 'code', 'capacity', 'room_number']);

        return Inertia::render('registrar/students/index', [
            'students' => $students,
            'stats' => $stats,
            'programs' => $programs,
            'yearLevels' => $yearLevels,
            'schoolYears' => $schoolYears,
            'filters' => $request->only(['search', 'type', 'program', 'year_level', 'enrollment_status', 'requirements_status', 'needs_sectioning', 'school_year']),
            // Academic structure data for Add/Edit form
            'departments' => $departments,
            'allPrograms' => $allPrograms,
            'allYearLevels' => $allYearLevels,
            'sections' => $sections,
            // Class list: all students split by gender sorted A-Z
            'classListMale' => Student::whereNull('deleted_at')
                ->select('id','first_name','last_name','middle_name','suffix','lrn','gender','program','year_level','section','enrollment_status','student_photo_url')
                ->whereRaw("LOWER(gender) = 'male'")
                ->orderBy('last_name')->orderBy('first_name')
                ->get(),
            'classListFemale' => Student::whereNull('deleted_at')
                ->select('id','first_name','last_name','middle_name','suffix','lrn','gender','program','year_level','section','enrollment_status','student_photo_url')
                ->whereRaw("LOWER(gender) = 'female'")
                ->orderBy('last_name')->orderBy('first_name')
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            
            // Handle photo upload
            if ($request->hasFile('student_photo')) {
                $path = $request->file('student_photo')->store('student-photos', 'public');
                $data['student_photo_url'] = '/storage/' . $path;
            }
            unset($data['student_photo']);
            
            $student = Student::create($data);

            // Generate random username and create User account for student
            $username = $this->generateUniqueUsername($student);
            $studentUser = User::create([
                'name' => $student->first_name . ' ' . $student->last_name,
                'email' => $student->email,
                'username' => $username,
                'password' => Hash::make('password'),
                'role' => User::ROLE_STUDENT,
                'student_id' => $student->id,
            ]);

            // Send email verification with login credentials
            try {
                $studentUser->sendEmailVerificationNotification();
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to send student verification email: ' . $e->getMessage());
            }

            // Automatically create parent/guardian record and user account
            if ($student->guardian_email) {
                $this->createParentRecordForStudent($student);
            }

            // Automatically assign all active requirements to the new student
            $requirements = Requirement::where('is_active', true)->get();

            foreach ($requirements as $requirement) {
                StudentRequirement::create([
                    'student_id' => $student->id,
                    'requirement_id' => $requirement->id,
                    'status' => 'pending',
                ]);
            }

            return redirect()->route('registrar.students.index')
                ->with('success', "Student added successfully! Username: {$username}, Password: password");
        });
    }

    /**
     * Create parent record and user account for a student's guardian.
     * If a parent with the same email already exists, link the student instead.
     */
    private function createParentRecordForStudent(Student $student): void
    {
        // Check if parent with this email already exists
        $existingParent = ParentModel::where('email', $student->guardian_email)->first();

        if ($existingParent) {
            // Link student to existing parent if not already linked
            if (!$existingParent->students()->where('student_id', $student->id)->exists()) {
                $existingParent->students()->attach($student->id, [
                    'relationship_type' => $student->guardian_relationship ?? 'guardian',
                ]);
            }
            return;
        }

        // If no ParentModel exists but a User already holds that email, skip creating a new user
        // (avoids duplicate-entry SQL error when the same guardian is shared across students).
        if (User::where('email', $student->guardian_email)->exists()) {
            return;
        }

        // Parse guardian name into first/last
        $nameParts = explode(' ', trim($student->guardian_name ?? 'Guardian'), 2);
        $firstName = $nameParts[0] ?? 'Guardian';
        $lastName = $nameParts[1] ?? $student->last_name;

        // Create parent record
        $parent = ParentModel::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $student->guardian_email,
            'phone' => $student->guardian_contact,
            'relationship' => $student->guardian_relationship ?? 'guardian',
            'is_active' => true,
        ]);

        // Link student to parent via pivot
        $parent->students()->attach($student->id, [
            'relationship_type' => $student->guardian_relationship ?? 'guardian',
        ]);

        // Create user account for parent (email-only login)
        $parentUser = User::create([
            'name' => $firstName . ' ' . $lastName,
            'email' => $student->guardian_email,
            'password' => Hash::make('password'),
            'role' => User::ROLE_PARENT,
            'parent_id' => $parent->id,
        ]);

        // Send email verification with login credentials
        try {
            $parentUser->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to send parent verification email: ' . $e->getMessage());
        }
    }

    /**
     * Resend email verification notification for a student's account.
     */
    public function resendVerification(Student $student)
    {
        $user = User::where('student_id', $student->id)->first();

        if (!$user) {
            return back()->withErrors(['error' => 'No user account found for this student.']);
        }

        if ($user->hasVerifiedEmail()) {
            return back()->with('info', 'This email is already verified.');
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to send notification: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Verification email resent to ' . $user->email);
    }

    /**
     * Update a student's email (and linked user email) then resend verification.
     */
    public function updateEmail(Request $request, Student $student)
    {
        // Resolve the student's linked user account so we can exclude it from the
        // unique-email check on the users table (otherwise re-submitting the same
        // email would fail validation).
        $studentUser = User::where('student_id', $student->id)->first();

        $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('students', 'email')->ignore($student->id),
                \Illuminate\Validation\Rule::unique('users', 'email')->ignore($studentUser?->id),
            ],
        ]);

        $student->update(['email' => $request->email]);

        if ($studentUser) {
            // Set email and clear verification — email_verified_at is not in $fillable
            // so we assign it directly to bypass mass-assignment protection.
            $studentUser->email             = $request->email;
            $studentUser->email_verified_at = null;
            $studentUser->save();

            try {
                $studentUser->sendEmailVerificationNotification();
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to resend email after update: ' . $e->getMessage());
            }
        }

        // Redirect to the show page (not back()) so Inertia re-runs show() and
        // returns a fresh emailVerified = false prop to the frontend.
        return redirect()->route('registrar.students.show', $student)
            ->with('success', 'Email updated and verification sent to ' . $request->email . '.');
    }

    /**
     * Generate unique username for student
     */
    private function generateUniqueUsername(Student $student): string
    {
        // Use first name initial + last name + random digits
        $base = strtolower(substr($student->first_name, 0, 1) . $student->last_name);
        $base = preg_replace('/[^a-z0-9]/', '', $base); // Remove special characters
        
        $username = $base . rand(100, 999);
        
        // Ensure uniqueness
        while (User::where('username', $username)->exists()) {
            $username = $base . rand(100, 999);
        }
        
        return $username;
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        $student->load([
            'requirements.requirement.category', 
            'enrollmentClearance',
            'actionLogs.performer',
            'enrollmentHistories.enrolledBy',
            'user',
        ]);
        
        // Auto-assign requirements if none exist for this student
        if ($student->requirements->isEmpty()) {
            $requirements = Requirement::where('is_active', true)->get();
            foreach ($requirements as $requirement) {
                StudentRequirement::firstOrCreate([
                    'student_id' => $student->id,
                    'requirement_id' => $requirement->id,
                ], [
                    'status' => 'pending',
                ]);
            }
            // Reload requirements
            $student->load('requirements.requirement.category');
        }

        // Calculate requirements completion percentage
        $totalRequirements = $student->requirements->count();
        $completedRequirements = $student->requirements->where('status', 'approved')->count();
        $requirementsPercentage = $totalRequirements > 0 ? round(($completedRequirements / $totalRequirements) * 100) : 0;

        // Create or update enrollment clearance record
        if (!$student->enrollmentClearance) {
            $student->enrollmentClearance()->create([
                'requirements_complete_percentage' => $requirementsPercentage,
                'requirements_complete' => $requirementsPercentage === 100,
            ]);
            $student->load('enrollmentClearance');
        } else {
            $student->enrollmentClearance->update([
                'requirements_complete_percentage' => $requirementsPercentage,
                'requirements_complete' => $requirementsPercentage === 100,
            ]);
        }

        return Inertia::render('registrar/students/show', [
            'student' => $student,
            'requirementsCompletion' => $requirementsPercentage,
            'emailVerified' => $student->user && $student->user->email_verified_at !== null,
            'enrollmentClearance' => $student->enrollmentClearance,
            'actionLogs' => $student->actionLogs->sortByDesc('created_at')->values(),
            'enrollmentHistories' => $student->enrollmentHistories->sortByDesc('school_year')->values(),
            // Academic structure data for edit modal
            'departments' => Department::where('is_active', true)->get(['id', 'name', 'code', 'classification']),
            'programs' => Program::where('is_active', true)->with('department:id,name')->get(['id', 'name', 'department_id']),
            'yearLevels' => YearLevel::where('is_active', true)->with('department:id,name')->get(['id', 'name', 'department_id', 'level_number']),
            'sections' => Section::where('is_active', true)->with(['yearLevel:id,name', 'department:id,name', 'strand:id,name,code'])->get(['id', 'name', 'year_level_id', 'department_id', 'strand_id', 'code', 'capacity', 'room_number']),
            // College subjects curriculum (only for college departments)
            'collegeSubjects' => $this->getCollegeSubjectData($student),
            'currentSchoolYear' => AppSetting::current()->school_year ?? (date('Y') . '-' . (date('Y') + 1)),
        ]);
    }

    /**
     * Build the college curriculum data for a student, annotated with enrollment status.
     * Returns null for non-college students.
     */
    private function getCollegeSubjectData(Student $student): ?array
    {
        // Only applicable to college departments
        $dept = \App\Models\Department::find($student->department_id);
        if (!$dept || $dept->classification !== 'College') {
            return null;
        }

        $schoolYear = AppSetting::current()->school_year ?? (date('Y') . '-' . (date('Y') + 1));

        $subjects = Subject::with(['yearLevel:id,name,level_number'])
            ->where('department_id', $student->department_id)
            ->where('classification', 'College')
            ->where('is_active', true)
            ->orderBy('year_level_id')
            ->orderBy('semester')
            ->orderBy('code')
            ->get();

        // All enrollment records for this student (all years)
        $allEnrollments = StudentSubject::where('student_id', $student->id)
            ->get()
            ->groupBy(fn ($e) => "{$e->subject_id}_{$e->semester}");

        // Current year enrolled units
        $enrolledUnits = StudentSubject::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->where('status', 'enrolled')
            ->join('subjects', 'subjects.id', '=', 'student_subjects.subject_id')
            ->sum('subjects.units');

        $completedUnits = StudentSubject::where('student_id', $student->id)
            ->where('status', 'completed')
            ->join('subjects', 'subjects.id', '=', 'student_subjects.subject_id')
            ->sum('subjects.units');

        $annotated = $subjects->map(function ($subject) use ($allEnrollments, $schoolYear) {
            $key = "{$subject->id}_{$subject->semester}";
            $enrollmentRecords = $allEnrollments[$key] ?? collect([]);

            // Determine display status: prefer current year's record, else look at historical
            $currentRecord  = $enrollmentRecords->firstWhere('school_year', $schoolYear);
            $historicalPass = $enrollmentRecords->firstWhere('status', 'completed');

            $displayStatus = null;
            if ($currentRecord) {
                $displayStatus = $currentRecord->status;
            } elseif ($historicalPass) {
                $displayStatus = 'completed';
            }

            return [
                'id'              => $subject->id,
                'code'            => $subject->code,
                'name'            => $subject->name,
                'units'           => (float) $subject->units,
                'type'            => $subject->type,
                'semester'        => $subject->semester,
                'year_level_name' => $subject->yearLevel?->name ?? 'N/A',
                'level_number'    => $subject->yearLevel?->level_number ?? 0,
                'status'          => $displayStatus,
                'enrollment_id'   => $currentRecord?->id,
                'grade'           => $currentRecord?->grade ?? $historicalPass?->grade,
            ];
        });

        $grouped = $annotated
            ->sortBy(['level_number', 'semester', 'code'])
            ->groupBy('year_level_name')
            ->map(fn ($items) => $items->values());

        return [
            'school_year'     => $schoolYear,
            'enrolled_units'  => (float) $enrolledUnits,
            'completed_units' => (float) $completedUnits,
            'by_year_level'   => $grouped,
        ];
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        $data = $request->validated();
        
        // Handle photo upload
        if ($request->hasFile('student_photo')) {
            // Delete old photo if exists
            if ($student->student_photo_url) {
                $oldPath = str_replace('/storage/', '', $student->student_photo_url);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('student_photo')->store('student-photos', 'public');
            $data['student_photo_url'] = '/storage/' . $path;
        }
        unset($data['student_photo']);
        
        $student->update($data);

        return redirect()->route('registrar.students.index')
            ->with('success', 'Student updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->route('registrar.students.index')
            ->with('success', 'Student deleted successfully!');
    }

    /**
     * Update enrollment clearance status for a student.
     */
    public function updateClearance(Request $request, Student $student)
    {
        $validated = $request->validate([
            'clearance_type' => 'required|in:requirements_complete,registrar_clearance,accounting_clearance,official_enrollment',
            'status' => 'required|boolean',
        ]);

        $clearanceType = $validated['clearance_type'];
        $status = $validated['status'];

        // Get or create enrollment clearance
        $clearance = $student->enrollmentClearance()->firstOrCreate([]);

        // Always sync requirements_complete from actual approved requirements so it's
        // never stale when the registrar checks/toggles the other clearance fields.
        $reqTotal    = $student->requirements()->count();
        $reqApproved = $student->requirements()->where('status', 'approved')->count();
        $reqPct      = $reqTotal > 0 ? (int) round(($reqApproved / $reqTotal) * 100) : 0;

        // Build update array dynamically
        $updateData = [
            $clearanceType => $status,
            // Always keep requirements_complete in sync with actual approvals
            'requirements_complete'            => $reqPct >= 100,
            'requirements_complete_percentage' => $reqPct,
        ];
        
        // Add timestamp and user fields for specific clearance types (not requirements_complete)
        if ($clearanceType !== 'requirements_complete') {
            $timestampField = str_replace('_clearance', '_cleared_at', $clearanceType);
            $timestampField = str_replace('_enrollment', '_enrolled_at', $timestampField);
            $userField = str_replace('_clearance', '_cleared_by', $clearanceType);
            $userField = str_replace('_enrollment', '_enrolled_by', $userField);
            
            $updateData[$timestampField] = $status ? now() : null;
            $updateData[$userField] = $status ? auth()->id() : null;
        } else {
            $updateData['requirements_completed_at'] = $status ? now() : null;
            $updateData['requirements_completed_by'] = $status ? auth()->id() : null;
        }

        // Update clearance
        $clearance->update($updateData);

        // Create StudentFee record when registrar clearance is approved
        if ($clearanceType === 'registrar_clearance' && $status) {
            $newSchoolYear = $student->school_year;

            // Sum any unpaid balances from previous school years
            $previousFees = \App\Models\StudentFee::where('student_id', $student->id)
                ->where('school_year', '!=', $newSchoolYear)
                ->where('balance', '>', 0)
                ->get();

            $carriedBalance = $previousFees->sum('balance');
            $carriedFrom    = $previousFees->pluck('school_year')->unique()->sort()->implode(', ');

            \App\Models\StudentFee::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'school_year' => $newSchoolYear,
                ],
                [
                    'registration_fee'          => 0,
                    'tuition_fee'               => 0,
                    'misc_fee'                  => 0,
                    'books_fee'                 => 0,
                    'other_fees'                => 0,
                    'total_amount'              => 0,
                    'total_paid'                => 0,
                    'balance'                   => 0,
                    'grant_discount'            => 0,
                    'carried_forward_balance'   => $carriedBalance > 0 ? $carriedBalance : 0,
                    'carried_forward_from'      => $carriedBalance > 0 ? $carriedFrom : null,
                ]
            );
        }

        // Update enrollment status if all clearances are complete
        if ($clearance->fresh()->isFullyCleared()) {
            $clearance->update(['enrollment_status' => 'completed']);
            $student->update(['enrollment_status' => 'enrolled']);
        } else {
            $clearance->update(['enrollment_status' => 'in_progress']);
            // If student was previously enrolled, revert to not-enrolled
            if ($student->enrollment_status === 'enrolled') {
                $student->update(['enrollment_status' => 'not-enrolled']);
            }
        }

        return back()->with('success', 'Clearance status updated successfully');
    }

    /**
     * Drop a student (change enrollment status to dropped).
     * Automatically creates a pending refund request if the student has any payments on record.
     */
    public function dropStudent(Student $student)
    {
        $student->update([
            'enrollment_status' => 'dropped',
        ]);

        // Auto-create a refund request if student has made payments
        $totalPaid = $student->fees()->sum('total_paid');

        if ($totalPaid > 0) {
            $latestFee = $student->fees()->latest()->first();

            \App\Models\RefundRequest::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'status'     => 'pending',
                ],
                [
                    'student_fee_id' => $latestFee?->id,
                    'type'           => 'refund',
                    'amount'         => (float) $totalPaid,
                    'reason'         => 'Student dropped — auto-generated refund request.',
                ]
            );
        }

        return back()->with('success', 'Student dropped successfully.' . ($totalPaid > 0 ? ' A refund request has been created for accounting review.' : ''));
    }

    /**
     * Bulk archive selected students (soft delete).
     */
    public function bulkArchive(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
        ]);

        $count = Student::whereIn('id', $validated['student_ids'])->delete();

        return back()->with('success', "{$count} student(s) archived successfully.");
    }

    /**
     * Re-enroll a student (Registrar initiates enrollment for new school year).
     * Sets the student to pending-registrar or directly to pending-accounting if registrar clearance is auto-granted.
     */
    public function reEnroll(Request $request, Student $student)
    {
        $settings = AppSetting::current();
        $currentSchoolYear = $settings->school_year ?? (date('Y') . '-' . (date('Y') + 1));

        // Check if enrollment is open for student's classification
        $dept = Department::find($student->department_id);
        $classification = $dept?->classification ?? 'K-12';
        
        if (!$settings->isEnrollmentOpen($classification)) {
            return back()->with('error', "Enrollment for {$classification} is currently closed. Open it in App Settings first.");
        }

        // Don't allow if already enrolled for this school year
        if ($student->enrollment_status === 'enrolled' && $student->school_year === $currentSchoolYear) {
            return back()->with('error', 'Student is already enrolled for the current school year.');
        }

        $validated = $request->validate([
            'year_level'       => 'required|string|max:100',
            'program'          => 'nullable|string|max:255',
            'section'          => 'nullable|string|max:100',
            'department_id'    => 'nullable|exists:departments,id',
            'section_id'       => 'nullable|exists:sections,id',
            'year_level_id'    => 'nullable|exists:year_levels,id',
            'auto_clear'       => 'boolean', // If true, skip pending-registrar and go to pending-accounting
        ]);

        $oldStatus     = $student->enrollment_status;
        $oldYearLevel  = $student->year_level;
        $oldSchoolYear = $student->school_year;
        $autoClear     = $validated['auto_clear'] ?? false;

        // Determine enrollment status - if registrar auto-clears, go to pending-accounting
        $newStatus = $autoClear ? 'pending-accounting' : 'pending-registrar';

        // Update student record
        $student->update([
            'enrollment_status' => $newStatus,
            'school_year'       => $currentSchoolYear,
            'year_level'        => $validated['year_level'],
            'program'           => $validated['program'] ?? $student->program,
            'section'           => $validated['section'] ?? null,
            'department_id'     => $validated['department_id'] ?? $student->department_id,
            'section_id'        => $validated['section_id'] ?? null,
            'year_level_id'     => $validated['year_level_id'] ?? $student->year_level_id,
        ]);

        // If auto-clear, also update the enrollment clearance
        if ($autoClear) {
            $clearance = $student->enrollmentClearance()->firstOrCreate([]);
            $clearance->update([
                'registrar_clearance'   => true,
                'registrar_cleared_at'  => now(),
                'registrar_cleared_by'  => auth()->id(),
            ]);

            // Create StudentFee record for the new school year
            $previousFees = \App\Models\StudentFee::where('student_id', $student->id)
                ->where('school_year', '!=', $currentSchoolYear)
                ->where('balance', '>', 0)
                ->get();

            $carriedBalance = $previousFees->sum('balance');
            $carriedFrom    = $previousFees->pluck('school_year')->unique()->sort()->implode(', ');

            \App\Models\StudentFee::firstOrCreate(
                [
                    'student_id' => $student->id,
                    'school_year' => $currentSchoolYear,
                ],
                [
                    'registration_fee'          => 0,
                    'tuition_fee'               => 0,
                    'misc_fee'                  => 0,
                    'books_fee'                 => 0,
                    'other_fees'                => 0,
                    'total_amount'              => 0,
                    'total_paid'                => 0,
                    'balance'                   => 0,
                    'grant_discount'            => 0,
                    'carried_forward_balance'   => $carriedBalance > 0 ? $carriedBalance : 0,
                    'carried_forward_from'      => $carriedBalance > 0 ? $carriedFrom : null,
                ]
            );
        }

        // Log the action
        StudentActionLog::create([
            'student_id'   => $student->id,
            'performed_by' => auth()->id(),
            'action'       => 'Re-Enrollment Initiated by Registrar',
            'action_type'  => 'enrollment',
            'details'      => "Registrar initiated re-enrollment for {$currentSchoolYear}. Year Level: {$validated['year_level']}." . ($autoClear ? ' Registrar clearance auto-granted.' : ''),
            'changes'      => [
                'enrollment_status' => ['from' => $oldStatus, 'to' => $newStatus],
                'school_year'       => ['from' => $oldSchoolYear, 'to' => $currentSchoolYear],
                'year_level'        => ['from' => $oldYearLevel, 'to' => $validated['year_level']],
            ],
        ]);

        $statusText = $autoClear ? 'pending-accounting (registrar cleared)' : 'pending-registrar';
        return back()->with('success', "Student re-enrolled for {$currentSchoolYear}. Status: {$statusText}");
    }

    /**
     * Deactivate a student — reset to "back to zero" state.
     * Sets is_active = false, enrollment_status = not-enrolled, clears section.
     * The student must register again when reactivated.
     */
    public function deactivate(Request $request, Student $student)
    {
        $oldStatus = $student->enrollment_status;

        $student->update([
            'is_active'         => false,
            'enrollment_status' => 'not-enrolled',
            'section'           => null,
            'section_id'        => null,
        ]);

        // Clear any pending enrollment clearance so re-enrollment starts fresh
        if ($student->enrollmentClearance) {
            $student->enrollmentClearance()->update([
                'registrar_clearance'   => false,
                'accounting_clearance'  => false,
                'official_enrollment'   => false,
                'registrar_cleared_at'  => null,
                'registrar_cleared_by'  => null,
                'accounting_cleared_at' => null,
                'accounting_cleared_by' => null,
                'official_enrolled_at'  => null,
                'official_enrolled_by'  => null,
                'enrollment_status'     => 'not_started',
            ]);
        }

        StudentActionLog::create([
            'student_id'   => $student->id,
            'performed_by' => auth()->id(),
            'action'       => 'Student Deactivated',
            'action_type'  => 'status_change',
            'details'      => "Student deactivated by registrar. Enrollment reset to zero — must re-register to enroll again.",
            'changes'      => [
                'is_active'         => ['from' => true, 'to' => false],
                'enrollment_status' => ['from' => $oldStatus, 'to' => 'not-enrolled'],
                'section'           => ['from' => $student->getOriginal('section'), 'to' => null],
            ],
        ]);

        return back()->with('success', 'Student deactivated. They must re-register to enroll again.');
    }

    /**
     * Activate a previously deactivated student.
     * Sets is_active = true; enrollment_status stays not-enrolled (they must re-register).
     */
    public function activateStudent(Request $request, Student $student)
    {
        $student->update(['is_active' => true]);

        StudentActionLog::create([
            'student_id'   => $student->id,
            'performed_by' => auth()->id(),
            'action'       => 'Student Activated',
            'action_type'  => 'status_change',
            'details'      => 'Student reactivated by registrar. Enrollment status remains not-enrolled — student must re-register.',
            'changes'      => [
                'is_active' => ['from' => false, 'to' => true],
            ],
        ]);

        return back()->with('success', 'Student activated. They can now proceed to re-register for enrollment.');
    }

    /**
     * Bulk deactivate selected students.
     */
    public function bulkDeactivate(Request $request)
    {
        $validated = $request->validate([
            'student_ids'   => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
        ]);

        $students = Student::whereIn('id', $validated['student_ids'])->get();

        foreach ($students as $student) {
            $student->update([
                'is_active'         => false,
                'enrollment_status' => 'not-enrolled',
                'section'           => null,
                'section_id'        => null,
            ]);

            if ($student->enrollmentClearance) {
                $student->enrollmentClearance()->update([
                    'registrar_clearance'   => false,
                    'accounting_clearance'  => false,
                    'official_enrollment'   => false,
                    'registrar_cleared_at'  => null,
                    'registrar_cleared_by'  => null,
                    'accounting_cleared_at' => null,
                    'accounting_cleared_by' => null,
                    'official_enrolled_at'  => null,
                    'official_enrolled_by'  => null,
                    'enrollment_status'     => 'not_started',
                ]);
            }

            StudentActionLog::create([
                'student_id'   => $student->id,
                'performed_by' => auth()->id(),
                'action'       => 'Student Deactivated (Bulk)',
                'action_type'  => 'status_change',
                'details'      => 'Student deactivated via bulk action by registrar.',
                'changes'      => ['is_active' => ['from' => true, 'to' => false]],
            ]);
        }

        return back()->with('success', "{$students->count()} student(s) deactivated successfully.");
    }
}
