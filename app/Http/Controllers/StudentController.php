<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\Request;
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

        // Get paginated students
        $students = $query->latest()->paginate(10)->withQueryString();

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

        return Inertia::render('registrar/students/index', [
            'students' => $students,
            'stats' => $stats,
            'programs' => $programs,
            'yearLevels' => $yearLevels,
            'filters' => $request->only(['search', 'type', 'program', 'year_level', 'enrollment_status', 'requirements_status']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStudentRequest $request)
    {
        Student::create($request->validated());

        return redirect()->route('registrar.students.index')
            ->with('success', 'Student added successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        $student->load(['requirements.requirement.category', 'enrollmentClearance']);

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
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

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

        // Update the specific clearance field
        $clearance->update([
            $clearanceType => $status,
            $clearanceType . '_at' => $status ? now() : null,
            $clearanceType . '_by' => $status ? auth()->id() : null,
        ]);

        // Update enrollment status if all clearances are complete
        if ($clearance->isFullyCleared()) {
            $clearance->update(['enrollment_status' => 'completed']);
            $student->update(['enrollment_status' => 'enrolled']);
        } else {
            $clearance->update(['enrollment_status' => 'in_progress']);
        }

        return back()->with('success', 'Clearance status updated successfully');
    }
}
