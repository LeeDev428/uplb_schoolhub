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

        // Get paginated students with requirements and enrollmentClearance
        $students = $query->with(['requirements.requirement', 'enrollmentClearance'])->latest()->paginate(10)->withQueryString();

        // Compute dynamic requirements status for each student
        $students->getCollection()->transform(function ($student) {
            $total = $student->requirements->count();
            $approved = $student->requirements->where('status', 'approved')->count();
            $percentage = $total > 0 ? round(($approved / $total) * 100) : 0;
            
            $student->requirements_percentage = $percentage;
            $student->requirements_status = $percentage === 100 ? 'complete' : ($percentage > 0 ? 'pending' : 'incomplete');
            
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
            'filters' => $request->only(['search', 'type', 'program', 'year_level', 'enrollment_status', 'requirements_status']),
            // Academic structure data for Add/Edit form
            'departments' => $departments,
            'allPrograms' => $allPrograms,
            'allYearLevels' => $allYearLevels,
            'sections' => $sections,
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
            User::create([
                'name' => $student->first_name . ' ' . $student->last_name,
                'email' => $student->email,
                'username' => $username,
                'password' => Hash::make('password'),
                'role' => User::ROLE_STUDENT,
                'student_id' => $student->id,
            ]);

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
                    'relationship' => $student->guardian_relationship ?? 'guardian',
                ]);
            }
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
            'relationship' => $student->guardian_relationship ?? 'guardian',
        ]);

        // Create user account for parent (email-only login)
        User::create([
            'name' => $firstName . ' ' . $lastName,
            'email' => $student->guardian_email,
            'password' => Hash::make('password'),
            'role' => User::ROLE_PARENT,
            'parent_id' => $parent->id,
        ]);
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
            'enrollmentHistories.enrolledBy'
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
            'enrollmentClearance' => $student->enrollmentClearance,
            'actionLogs' => $student->actionLogs->sortByDesc('created_at')->values(),
            'enrollmentHistories' => $student->enrollmentHistories->sortByDesc('school_year')->values(),
            // Academic structure data for edit modal
            'departments' => Department::where('is_active', true)->get(['id', 'name', 'code', 'classification']),
            'programs' => Program::where('is_active', true)->with('department:id,name')->get(['id', 'name', 'department_id']),
            'yearLevels' => YearLevel::where('is_active', true)->with('department:id,name')->get(['id', 'name', 'department_id', 'level_number']),
            'sections' => Section::where('is_active', true)->with(['yearLevel:id,name', 'department:id,name', 'strand:id,name,code'])->get(['id', 'name', 'year_level_id', 'department_id', 'strand_id', 'code', 'capacity', 'room_number']),
        ]);
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

        // Build update array dynamically
        $updateData = [$clearanceType => $status];
        
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

        // Update enrollment status if all clearances are complete
        if ($clearance->isFullyCleared()) {
            $clearance->update(['enrollment_status' => 'completed']);
            $student->update(['enrollment_status' => 'enrolled']);
        } else {
            $clearance->update(['enrollment_status' => 'in_progress']);
        }

        return back()->with('success', 'Clearance status updated successfully');
    }

    /**
     * Drop a student (change enrollment status to dropped)
     */
    public function dropStudent(Student $student)
    {
        $student->update([
            'enrollment_status' => 'dropped',
        ]);

        return back()->with('success', 'Student dropped successfully');
    }
}
