<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Student;
use App\Models\EnrollmentClearance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentClearanceController extends Controller
{
    /**
     * Display a listing of students pending accounting clearance.
     */
    public function index(Request $request)
    {
        $query = Student::with(['enrollmentClearance', 'fees'])
            ->whereHas('enrollmentClearance')
            ->orderBy('last_name')
            ->orderBy('first_name');

        // Filter by clearance status
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'pending') {
                $query->whereHas('enrollmentClearance', function ($q) {
                    $q->where('accounting_clearance', false);
                });
            } elseif ($request->status === 'cleared') {
                $query->whereHas('enrollmentClearance', function ($q) {
                    $q->where('accounting_clearance', true);
                });
            }
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Program filter
        if ($request->filled('program') && $request->input('program') !== 'all') {
            $query->where('program', $request->input('program'));
        }

        // Year level filter
        if ($request->filled('year_level') && $request->input('year_level') !== 'all') {
            $query->where('year_level', $request->input('year_level'));
        }

        // Department filter
        if ($departmentId = $request->input('department_id')) {
            $query->where('department_id', $departmentId);
        }

        // Classification filter
        if ($classification = $request->input('classification')) {
            $query->whereHas('department', function ($q) use ($classification) {
                $q->where('classification', $classification);
            });
        }

        $students = $query->paginate(20)->withQueryString();

        // Calculate balances for each student
        $students->getCollection()->transform(function ($student) {
            $totalFees = $student->fees->sum('total_amount');
            $totalPaid = $student->fees->sum('total_paid');
            $balance = $totalFees - $totalPaid;
            
            $student->total_fees = $totalFees;
            $student->total_paid = $totalPaid;
            $student->balance = $balance;
            $student->is_fully_paid = $balance <= 0;
            
            return $student;
        });

        // Get filter options
        $programs = Student::select('program')
            ->whereNotNull('program')
            ->where('program', '!=', '')
            ->distinct()
            ->pluck('program')
            ->sort()
            ->values();
            
        $yearLevels = Student::select('year_level')
            ->whereNotNull('year_level')
            ->where('year_level', '!=', '')
            ->distinct()
            ->pluck('year_level')
            ->sort()
            ->values();

        // Get stats
        $stats = [
            'total' => EnrollmentClearance::count(),
            'pending' => EnrollmentClearance::where('accounting_clearance', false)->count(),
            'cleared' => EnrollmentClearance::where('accounting_clearance', true)->count(),
        ];

        // Get departments and classifications
        $departments = Department::orderBy('name')->get(['id', 'name', 'code', 'classification']);
        $classifications = Department::distinct()->pluck('classification')->filter()->sort()->values();

        return Inertia::render('accounting/clearance/index', [
            'students' => $students,
            'programs' => $programs,
            'yearLevels' => $yearLevels,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'program', 'year_level', 'department_id', 'classification']),
            'departments' => $departments,
            'classifications' => $classifications,
        ]);
    }

    /**
     * Show clearance details for a specific student.
     */
    public function show(Student $student)
    {
        $student->load(['enrollmentClearance', 'fees.payments', 'requirements.requirement']);

        $totalFees = $student->fees->sum('total_amount');
        $totalPaid = $student->fees->sum('total_paid');
        $balance = $totalFees - $totalPaid;

        return Inertia::render('accounting/clearance/show', [
            'student' => $student,
            'totalFees' => $totalFees,
            'totalPaid' => $totalPaid,
            'balance' => $balance,
            'isFullyPaid' => $balance <= 0,
        ]);
    }

    /**
     * Update accounting clearance status for a student.
     */
    public function updateClearance(Request $request, Student $student)
    {
        $validated = $request->validate([
            'status' => 'required|boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        $status = $validated['status'];
        
        // Get or create enrollment clearance
        $clearance = $student->enrollmentClearance()->firstOrCreate([]);

        // Update clearance
        $clearance->update([
            'accounting_clearance' => $status,
            'accounting_cleared_at' => $status ? now() : null,
            'accounting_cleared_by' => $status ? Auth::id() : null,
            'accounting_notes' => $validated['notes'] ?? null,
        ]);

        // Update enrollment status if all clearances are complete
        if ($clearance->fresh()->isFullyCleared()) {
            $clearance->update(['enrollment_status' => 'completed']);
            $student->update(['enrollment_status' => 'enrolled']);
        } else {
            $clearance->update(['enrollment_status' => 'in_progress']);
        }

        return back()->with('success', $status 
            ? 'Student cleared by accounting successfully.' 
            : 'Accounting clearance removed.');
    }

    /**
     * Bulk clear students.
     */
    public function bulkClear(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'status' => 'required|boolean',
        ]);

        $count = 0;
        foreach ($validated['student_ids'] as $studentId) {
            $student = Student::find($studentId);
            if ($student) {
                $clearance = $student->enrollmentClearance()->firstOrCreate([]);
                $clearance->update([
                    'accounting_clearance' => $validated['status'],
                    'accounting_cleared_at' => $validated['status'] ? now() : null,
                    'accounting_cleared_by' => $validated['status'] ? Auth::id() : null,
                ]);

                if ($clearance->fresh()->isFullyCleared()) {
                    $clearance->update(['enrollment_status' => 'completed']);
                    $student->update(['enrollment_status' => 'enrolled']);
                }
                
                $count++;
            }
        }

        return back()->with('success', "{$count} students updated successfully.");
    }
}
