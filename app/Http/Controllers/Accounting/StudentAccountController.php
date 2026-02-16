<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use App\Models\FeeItem;
use App\Models\GrantRecipient;
use App\Models\Department;
use App\Models\YearLevel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentAccountController extends Controller
{
    /**
     * Display a listing of student accounts.
     * Fees are calculated DYNAMICALLY from fee_items table.
     */
    public function index(Request $request): Response
    {
        // Get unique school years from fee_items
        $schoolYears = FeeItem::where('is_active', true)
            ->whereNotNull('school_year')
            ->distinct()
            ->pluck('school_year')
            ->sort()
            ->values();

        $selectedSchoolYear = $request->input('school_year', $schoolYears->first());

        // Get students with enrollment clearance
        $studentsQuery = Student::with(['department'])
            ->whereHas('enrollmentClearance', function ($q) {
                $q->where('registrar_clearance', true)
                  ->orWhere('requirements_complete', true);
            });

        // Search
        if ($search = $request->input('search')) {
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Filter by department
        if ($departmentId = $request->input('department_id')) {
            $studentsQuery->where('department_id', $departmentId);
        }

        // Filter by classification
        if ($classification = $request->input('classification')) {
            $studentsQuery->whereHas('department', function ($q) use ($classification) {
                $q->where('classification', $classification);
            });
        }

        $students = $studentsQuery->latest()->paginate(20)->withQueryString();

        // Calculate fees dynamically for each student
        $accounts = $students->through(function ($student) use ($selectedSchoolYear) {
            $feeData = $this->calculateStudentFees($student, $selectedSchoolYear);
            
            // Get grants
            $grants = GrantRecipient::where('student_id', $student->id)
                ->where('school_year', $selectedSchoolYear)
                ->where('status', 'active')
                ->with('grant')
                ->get();

            return [
                'id' => $feeData['student_fee_id'] ?? $student->id,
                'student' => [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'lrn' => $student->lrn,
                    'program' => $student->program,
                    'year_level' => $student->year_level,
                    'section' => $student->section,
                    'department' => $student->department?->name,
                ],
                'school_year' => $selectedSchoolYear,
                'total_amount' => $feeData['total_amount'],
                'grant_discount' => $feeData['grant_discount'],
                'total_paid' => $feeData['total_paid'],
                'balance' => $feeData['balance'],
                'is_overdue' => $feeData['is_overdue'],
                'due_date' => $feeData['due_date'],
                'payment_status' => $feeData['payment_status'],
                'payments_count' => $feeData['payments_count'],
                'grants' => $grants->map(fn($gr) => [
                    'name' => $gr->grant->name,
                    'discount' => $gr->discount_amount,
                ]),
            ];
        });

        // Filter by payment status (after calculation)
        if ($status = $request->input('status')) {
            $accounts->setCollection(
                $accounts->getCollection()->filter(function ($account) use ($status) {
                    return $account['payment_status'] === $status;
                })->values()
            );
        }

        // Calculate stats dynamically
        $allStudentIds = Student::whereHas('enrollmentClearance', function ($q) {
            $q->where('registrar_clearance', true)
              ->orWhere('requirements_complete', true);
        })->pluck('id');

        $stats = $this->calculateStats($allStudentIds, $selectedSchoolYear);

        // Get all active departments with their classifications
        $departments = Department::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'classification']);

        // Get unique classifications from departments
        $classifications = Department::where('is_active', true)
            ->distinct()
            ->pluck('classification')
            ->filter()
            ->values();

        // Get all active year levels with their names
        $yearLevels = YearLevel::where('is_active', true)
            ->with('department:id,name')
            ->orderBy('level_number')
            ->get(['id', 'name', 'level_number', 'department_id', 'classification'])
            ->map(function ($yl) {
                return [
                    'id' => $yl->id,
                    'name' => $yl->name,
                    'level_number' => $yl->level_number,
                    'department' => $yl->department?->name,
                    'classification' => $yl->classification,
                ];
            });

        return Inertia::render('accounting/student-accounts/index', [
            'accounts' => $accounts,
            'schoolYears' => $schoolYears,
            'stats' => $stats,
            'departments' => $departments,
            'classifications' => $classifications,
            'yearLevels' => $yearLevels,
            'filters' => $request->only(['search', 'status', 'school_year', 'department_id', 'classification']),
        ]);
    }

    /**
     * Calculate fees dynamically for a student.
     */
    private function calculateStudentFees(Student $student, ?string $schoolYear): array
    {
        if (!$schoolYear) {
            return [
                'student_fee_id' => null,
                'total_amount' => 0,
                'grant_discount' => 0,
                'total_paid' => 0,
                'balance' => 0,
                'is_overdue' => false,
                'due_date' => null,
                'payment_status' => 'unpaid',
                'payments_count' => 0,
            ];
        }

        // Calculate total from applicable fee items
        $totalAmount = FeeItem::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->where(function ($query) use ($student) {
                $query->where('assignment_scope', 'all')
                    ->orWhere(function ($q) use ($student) {
                        $q->where('assignment_scope', 'specific');
                        $this->applyStudentFilters($q, $student);
                    });
            })
            ->sum('selling_price');

        // Get grant discount
        $grantDiscount = GrantRecipient::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->where('status', 'active')
            ->sum('discount_amount');

        // Get payment info from student_fees (if exists)
        $studentFee = StudentFee::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->first();

        $totalPaid = $studentFee ? (float) $studentFee->total_paid : 0;
        $isOverdue = $studentFee ? $studentFee->is_overdue : false;
        $dueDate = $studentFee?->due_date;

        // Get payments count
        $paymentsCount = StudentPayment::where('student_id', $student->id)
            ->whereHas('studentFee', function ($q) use ($schoolYear) {
                $q->where('school_year', $schoolYear);
            })
            ->count();

        // Calculate balance
        $balance = max(0, $totalAmount - $grantDiscount - $totalPaid);

        // Determine payment status
        $paymentStatus = 'unpaid';
        if ($isOverdue) {
            $paymentStatus = 'overdue';
        } elseif ($totalAmount > 0 && $balance <= 0) {
            $paymentStatus = 'paid';
        } elseif ($totalPaid > 0) {
            $paymentStatus = 'partial';
        }

        return [
            'student_fee_id' => $studentFee?->id,
            'total_amount' => (float) $totalAmount,
            'grant_discount' => (float) $grantDiscount,
            'total_paid' => $totalPaid,
            'balance' => $balance,
            'is_overdue' => $isOverdue,
            'due_date' => $dueDate,
            'payment_status' => $paymentStatus,
            'payments_count' => $paymentsCount,
        ];
    }

    /**
     * Calculate stats for dashboard.
     */
    private function calculateStats($studentIds, ?string $schoolYear): array
    {
        if (!$schoolYear || $studentIds->isEmpty()) {
            return [
                'total_students' => 0,
                'total_receivables' => 0,
                'total_collected' => 0,
                'total_balance' => 0,
                'overdue_count' => 0,
                'fully_paid' => 0,
            ];
        }

        $totalReceivables = 0;
        $totalCollected = 0;
        $totalBalance = 0;
        $overdueCount = 0;
        $fullyPaidCount = 0;

        foreach ($studentIds as $studentId) {
            $student = Student::with('department')->find($studentId);
            if (!$student) continue;

            $feeData = $this->calculateStudentFees($student, $schoolYear);
            
            $totalReceivables += $feeData['total_amount'];
            $totalCollected += $feeData['total_paid'];
            $totalBalance += $feeData['balance'];
            
            if ($feeData['is_overdue']) {
                $overdueCount++;
            }
            
            if ($feeData['total_amount'] > 0 && $feeData['balance'] <= 0) {
                $fullyPaidCount++;
            }
        }

        return [
            'total_students' => $studentIds->count(),
            'total_receivables' => $totalReceivables,
            'total_collected' => $totalCollected,
            'total_balance' => $totalBalance,
            'overdue_count' => $overdueCount,
            'fully_paid' => $fullyPaidCount,
        ];
    }

    /**
     * Apply student-specific filters to fee item query.
     */
    private function applyStudentFilters($query, Student $student): void
    {
        // Match classification if set
        if ($student->department) {
            $query->where(function ($sq) use ($student) {
                $sq->whereNull('classification')
                    ->orWhere('classification', $student->department->classification);
            });
        }

        // Match department if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('department_id')
                ->orWhere('department_id', $student->department_id);
        });

        // Match program if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('program_id')
                ->orWhere('program_id', $student->program_id);
        });

        // Match year level if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('year_level_id')
                ->orWhere('year_level_id', $student->year_level_id);
        });

        // Match section if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('section_id')
                ->orWhere('section_id', $student->section_id);
        });
    }

    /**
     * Mark a student account as overdue.
     */
    public function markOverdue(StudentFee $fee): RedirectResponse
    {
        $fee->markOverdue();

        return redirect()->back()->with('success', 'Account marked as overdue.');
    }

    /**
     * Clear overdue status.
     */
    public function clearOverdue(StudentFee $fee): RedirectResponse
    {
        $fee->clearOverdue();

        return redirect()->back()->with('success', 'Overdue status cleared.');
    }

    /**
     * Bulk mark accounts as overdue based on filters.
     */
    public function bulkMarkOverdue(Request $request): RedirectResponse
    {
        $request->validate([
            'classification' => 'nullable|string',
            'department_id' => 'nullable|string',
            'year_level' => 'nullable|string',
            'overdue_date' => 'required|date',
        ]);

        $query = StudentFee::where('balance', '>', 0)
            ->where('is_overdue', false);

        if ($classification = $request->classification) {
            if ($classification !== 'all') {
                $query->whereHas('student', function ($q) use ($classification) {
                    $q->where('classification', $classification);
                });
            }
        }

        if ($departmentId = $request->department_id) {
            if ($departmentId !== 'all') {
                $query->whereHas('student', function ($q) use ($departmentId) {
                    $q->where('department_id', $departmentId);
                });
            }
        }

        if ($yearLevel = $request->year_level) {
            if ($yearLevel !== 'all') {
                $query->whereHas('student', function ($q) use ($yearLevel) {
                    $q->where('year_level', $yearLevel);
                });
            }
        }

        $count = $query->count();
        
        $query->update([
            'is_overdue' => true,
            'due_date' => $request->overdue_date,
        ]);

        return redirect()->back()->with('success', "{$count} accounts marked as overdue.");
    }

    /**
     * Get detailed account information.
     */
    public function show(StudentFee $fee): Response
    {
        $fee->load(['student', 'payments.recordedBy']);

        $grants = GrantRecipient::where('student_id', $fee->student_id)
            ->where('school_year', $fee->school_year)
            ->with('grant')
            ->get();

        return Inertia::render('accounting/student-accounts/show', [
            'account' => [
                'id' => $fee->id,
                'student' => $fee->student,
                'school_year' => $fee->school_year,
                'registration_fee' => $fee->registration_fee,
                'tuition_fee' => $fee->tuition_fee,
                'misc_fee' => $fee->misc_fee,
                'books_fee' => $fee->books_fee,
                'other_fees' => $fee->other_fees,
                'total_amount' => $fee->total_amount,
                'grant_discount' => $fee->grant_discount,
                'total_paid' => $fee->total_paid,
                'balance' => $fee->balance,
                'is_overdue' => $fee->is_overdue,
                'due_date' => $fee->due_date,
                'payment_status' => $fee->getPaymentStatus(),
                'payments' => $fee->payments,
                'grants' => $grants,
            ],
        ]);
    }
}
