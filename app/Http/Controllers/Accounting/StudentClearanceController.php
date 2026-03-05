<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\FeeItem;
use App\Models\GrantRecipient;
use App\Models\Student;
use App\Models\StudentFee;
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
            ->whereHas('enrollmentClearance', function ($q) {
                $q->where('registrar_clearance', true);
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        // Filter by clearance status — default to 'pending'
        $status = $request->filled('status') ? $request->status : 'pending';

        if ($status !== 'all') {
            if ($status === 'pending') {
                $query->whereHas('enrollmentClearance', function ($q) {
                    $q->where(function ($q2) {
                        $q2->where('accounting_clearance', false)
                           ->orWhereNull('accounting_clearance');
                    });
                });
            } elseif ($status === 'cleared') {
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

        // Calculate balances dynamically from fee_items for each student
        $students->getCollection()->transform(function ($student) {
            $schoolYear = $student->school_year ?? date('Y') . '-' . (date('Y') + 1);

            // Dynamic total from applicable fee items (exclude Drop category)
            $totalFees = FeeItem::where('school_year', $schoolYear)
                ->where('is_active', true)
                ->whereDoesntHave('category', function ($q) {
                    $q->where('name', 'like', '%Drop%');
                })
                ->where(function ($query) use ($student) {
                    $query->where(function ($q) use ($student) {
                            $q->where('assignment_scope', 'specific');
                            $this->applyStudentFilters($q, $student);
                        })
                        ->orWhereHas('assignments', function ($q) use ($student) {
                            $this->applyAssignmentFilters($q, $student);
                        });
                })
                ->sum('selling_price');

            // Grant discount
            $grantDiscount = GrantRecipient::where('student_id', $student->id)
                ->where('school_year', $schoolYear)
                ->where('status', 'active')
                ->sum('discount_amount');

            // Total paid from student_fees
            $studentFee = StudentFee::where('student_id', $student->id)
                ->where('school_year', $schoolYear)
                ->first();
            $totalPaid = $studentFee ? (float) $studentFee->total_paid : 0;

            $balance = max(0, $totalFees - $grantDiscount - $totalPaid);

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
            'total' => EnrollmentClearance::where('registrar_clearance', true)->count(),
            'pending' => EnrollmentClearance::where('registrar_clearance', true)->where('accounting_clearance', false)->count(),
            'cleared' => EnrollmentClearance::where('registrar_clearance', true)->where('accounting_clearance', true)->count(),
        ];

        // Get departments and classifications
        $departments = Department::orderBy('name')->get(['id', 'name', 'code', 'classification']);
        $classifications = Department::distinct()->pluck('classification')->filter()->sort()->values();

        return Inertia::render($this->viewPrefix() . '/clearance/index', [
            'students' => $students,
            'programs' => $programs,
            'yearLevels' => $yearLevels,
            'departments' => $departments,
            'classifications' => $classifications,
            'stats' => $stats,
            'filters' => array_merge(
                $request->only(['search', 'program', 'year_level', 'department_id', 'classification']),
                ['status' => $status]
            ),
        ]);
    }

    /**
     * Show clearance details for a specific student.
     */
    public function show(Student $student)
    {
        $student->load(['enrollmentClearance', 'fees.payments', 'requirements.requirement']);

        $schoolYear = $student->school_year ?? date('Y') . '-' . (date('Y') + 1);

        // Dynamic fee calculation (same as index, excluding Drop fees)
        $totalFees = FeeItem::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereDoesntHave('category', function ($q) {
                $q->where('name', 'like', '%Drop%');
            })
            ->where(function ($query) use ($student) {
                $query->where(function ($q) use ($student) {
                        $q->where('assignment_scope', 'specific');
                        $this->applyStudentFilters($q, $student);
                    })
                    ->orWhereHas('assignments', function ($q) use ($student) {
                        $this->applyAssignmentFilters($q, $student);
                    });
            })
            ->sum('selling_price');

        $grantDiscount = \App\Models\GrantRecipient::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->where('status', 'active')
            ->sum('discount_amount');

        $studentFee = StudentFee::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->first();
        $totalPaid = $studentFee ? (float) $studentFee->total_paid : 0;
        $balance = max(0, $totalFees - $grantDiscount - $totalPaid);

        return Inertia::render($this->viewPrefix() . '/clearance/show', [
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

        // Update enrollment status based on clearance result
        $freshClearance = $clearance->fresh();
        if ($freshClearance->isFullyCleared()) {
            $clearance->update(['enrollment_status' => 'completed']);
            $student->update(['enrollment_status' => 'enrolled']);
        } elseif ($status) {
            // Accounting cleared but not fully enrolled → pending-enrollment
            $clearance->update(['enrollment_status' => 'in_progress']);
            $student->update(['enrollment_status' => 'pending-enrollment']);
        } else {
            // Accounting clearance revoked → back to pending-accounting
            $clearance->update(['enrollment_status' => 'in_progress']);
            $student->update(['enrollment_status' => 'pending-accounting']);
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

                $freshClearance = $clearance->fresh();
                if ($freshClearance->isFullyCleared()) {
                    $clearance->update(['enrollment_status' => 'completed']);
                    $student->update(['enrollment_status' => 'enrolled']);
                } elseif ($validated['status']) {
                    $clearance->update(['enrollment_status' => 'in_progress']);
                    $student->update(['enrollment_status' => 'pending-enrollment']);
                } else {
                    $clearance->update(['enrollment_status' => 'in_progress']);
                    $student->update(['enrollment_status' => 'pending-accounting']);
                }
                
                $count++;
            }
        }

        return back()->with('success', "{$count} students updated successfully.");
    }

    /**
     * Apply student-specific filters to fee item query.
     */
    private function applyStudentFilters($query, Student $student): void
    {
        if ($student->department) {
            $query->where(function ($sq) use ($student) {
                $sq->whereNull('classification')
                    ->orWhere('classification', $student->department->classification);
            });
        }

        $query->where(function ($sq) use ($student) {
            $sq->whereNull('department_id')
                ->orWhere('department_id', $student->department_id);
        });

        $query->where(function ($sq) use ($student) {
            $sq->whereNull('program_id')
                ->orWhere('program_id', $student->program_id);
        });

        $query->where(function ($sq) use ($student) {
            $sq->whereNull('year_level_id')
                ->orWhere('year_level_id', $student->year_level_id);
        });

        $query->where(function ($sq) use ($student) {
            $sq->whereNull('section_id')
                ->orWhere('section_id', $student->section_id);
        });
    }

    /**
     * Apply assignment-specific filters to fee_item_assignments query.
     */
    private function applyAssignmentFilters($query, Student $student): void
    {
        $query->where('is_active', true);

        if ($student->department) {
            $query->where(function ($sq) use ($student) {
                $sq->whereNull('classification')
                    ->orWhere('classification', $student->department->classification);
            });
        }

        $query->where(function ($sq) use ($student) {
            $sq->whereNull('department_id')
                ->orWhere('department_id', $student->department_id);
        });

        $query->where(function ($sq) use ($student) {
            $sq->whereNull('year_level_id')
                ->orWhere('year_level_id', $student->year_level_id);
        });
    }
}
