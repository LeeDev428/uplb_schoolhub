<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\BalanceAdjustment;
use App\Models\Department;
use App\Models\EnrollmentClearance;
use App\Models\Grant;
use App\Models\GrantRecipient;
use App\Models\PromissoryNote;
use App\Models\Student;
use App\Models\StudentActionLog;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentPaymentController extends Controller
{
    /**
     * Display Payment Processing dashboard.
     * Shows list of students with payment details and tabs for each student.
     */
    public function index(Request $request): Response
    {
        $selectedStudentId = $request->input('student_id');

        // Get students from student-accounts (registrar-cleared, in accounting queue or beyond)
        $query = Student::with(['department', 'enrollmentClearance'])
            ->whereHas('enrollmentClearance', function ($q) {
                $q->where('registrar_clearance', true);
            })
            ->whereNotIn('enrollment_status', ['not-enrolled', 'pending-registrar']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Filter by enrollment status
        if ($status = $request->input('enrollment_status')) {
            $query->where('enrollment_status', $status);
        }

        $students = $query->latest()->paginate(20)->withQueryString();

        // Transform students for list — aggregate ALL school years to match process page logic
        $students->through(function ($student) {
            // Combined calculation across ALL school years (same approach as process page)
            $allFees   = StudentFee::where('student_id', $student->id)->get();
            $totalFees = (float) $allFees->sum('total_amount');
            $discounts = (float) $allFees->sum('grant_discount');
            $totalPaid = (float) StudentPayment::where('student_id', $student->id)->sum('amount');
            $balance   = max(0, $totalFees - $discounts - $totalPaid);

            // Determine status
            $status = 'pending';

            // Check for approved promissory notes
            $hasApprovedPromissory = PromissoryNote::where('student_id', $student->id)
                ->where('status', 'approved')
                ->exists();

            if ($totalFees > 0 && $balance <= 0) {
                $status = 'fully_paid';
            } elseif ($hasApprovedPromissory) {
                $status = 'approved';
            } elseif ($allFees->where('is_overdue', true)->isNotEmpty() && $totalPaid <= 0) {
                $status = 'overdue';
            }

            return [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'lrn' => $student->lrn,
                'student_photo_url' => $student->student_photo_url,
                'program' => $student->program,
                'year_level' => $student->year_level,
                'section' => $student->section,
                'department' => $student->department?->name,
                'enrollment_status' => $student->enrollment_status,
                'enrollment_progress' => $student->enrollmentClearance,
                'total_fees' => $totalFees,
                'discounts' => $discounts,
                'total_paid' => $totalPaid,
                'balance' => $balance,
                'status' => $status,
            ];
        });

        $selectedStudent = null;
        $paymentData = null;

        // If a student is selected, load their full payment details
        if ($selectedStudentId) {
            $selectedStudent = Student::with(['department', 'enrollmentClearance'])->find($selectedStudentId);
            
            if ($selectedStudent) {
                // Get all student fees (current and previous years)
                $studentFees = StudentFee::where('student_id', $selectedStudentId)
                    ->with('payments')
                    ->orderBy('school_year', 'desc')
                    ->get();

                // Get promissory notes
                $promissoryNotes = PromissoryNote::where('student_id', $selectedStudentId)
                    ->with(['approvedBy'])
                    ->orderBy('date_submitted', 'desc')
                    ->get();

                // Get payment transactions
                $transactions = StudentPayment::where('student_id', $selectedStudentId)
                    ->with(['recordedBy', 'studentFee'])
                    ->orderBy('payment_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Calculate current and previous balances
                $currentYear = $selectedStudent->school_year
                    ?? \App\Models\AppSetting::current()?->school_year
                    ?? date('Y') . '-' . (date('Y') + 1);
                $currentFee = $studentFees->firstWhere('school_year', $currentYear);
                $previousFees = $studentFees->where('school_year', '!=', $currentYear);

                // Recalculate current year dynamically for accuracy (also syncs student_fees record)
                $freshFeeData = $this->calculateFeesForSchoolYear($selectedStudent, $currentYear);

                $paymentData = [
                    'student' => [
                        'id' => $selectedStudent->id,
                        'full_name' => $selectedStudent->full_name,
                        'lrn' => $selectedStudent->lrn,
                        'program' => $selectedStudent->program,
                        'year_level' => $selectedStudent->year_level,
                        'section' => $selectedStudent->section,
                        'department' => $selectedStudent->department?->name,
                        'classification' => $selectedStudent->department?->classification,
                        'enrollment_status' => $selectedStudent->enrollment_status,
                        'student_photo_url' => $selectedStudent->student_photo_url,
                    ],
                    'current_fee' => $freshFeeData ? [
                        'id' => $freshFeeData['id'],
                        'school_year' => $currentYear,
                        'total_amount' => $freshFeeData['total_amount'],
                        'grant_discount' => $freshFeeData['grant_discount'],
                        'total_paid' => $freshFeeData['total_paid'],
                        'balance' => $freshFeeData['balance'],
                        'is_overdue' => $freshFeeData['is_overdue'],
                        'due_date' => $freshFeeData['due_date'],
                        'categories' => $freshFeeData['categories'] ?? [],
                    ] : null,
                    'previous_balance' => $previousFees->sum('balance'),
                    'total_balance' => ($freshFeeData['balance'] ?? 0) + $previousFees->sum('balance'),
                    'school_year_fees' => $studentFees->map(function ($fee) {
                        return [
                            'id' => $fee->id,
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
                            'payments' => $fee->payments->map(function ($payment) {
                                return [
                                    'id' => $payment->id,
                                    'payment_date' => $payment->payment_date,
                                    'or_number' => $payment->or_number,
                                    'amount' => $payment->amount,
                                    'payment_for' => $payment->payment_for,
                                    'notes' => $payment->notes,
                                ];
                            }),
                        ];
                    }),
                    'promissory_notes' => $promissoryNotes->map(function ($note) {
                        return [
                            'id' => $note->id,
                            'date_submitted' => $note->date_submitted,
                            'due_date' => $note->due_date,
                            'amount' => $note->amount,
                            'reason' => $note->reason,
                            'notes' => $note->notes,
                            'status' => $note->status,
                            'approved_by' => $note->approvedBy?->name,
                            'approved_at' => $note->approved_at,
                            'document_url' => $note->document_url,
                        ];
                    }),
                    'transactions' => $transactions->map(function ($transaction) {
                        return [
                            'id' => $transaction->id,
                            'date_time' => $transaction->payment_date . ' ' . $transaction->created_at->format('H:i A'),
                            'payment_date' => $transaction->payment_date,
                            'or_number' => $transaction->or_number,
                            'mode' => $transaction->payment_mode ?? 'CASH',
                            'reference' => $transaction->reference_number ?? 'N/A',
                            'amount' => $transaction->amount,
                            'school_year' => $transaction->studentFee?->school_year,
                            'applied_to' => $transaction->payment_for,
                            'cashier' => $transaction->recordedBy?->name,
                            'notes' => $transaction->notes,
                        ];
                    }),
                ];
            }
        }

        // Calculate aggregate financial statistics for all students
        $currentYear = \App\Models\AppSetting::current()?->school_year ?? date('Y') . '-' . (date('Y') + 1);
        
        // Get all fees for current year to calculate statistics
        $allCurrentFees = StudentFee::where('school_year', $currentYear)->get();
        
        // Calculate original tuition (tuition_fee before grant discount)
        $totalTuitionFees = $allCurrentFees->sum('tuition_fee');
        $totalGrantDiscounts = $allCurrentFees->sum('grant_discount');
        
        // Calculate total fees after discount (registration + tuition + misc + books + other)
        $totalFeesAfterDiscount = $allCurrentFees->sum('total_amount');
        
        // Calculate previous balance (from all previous years)
        $totalPreviousBalance = StudentFee::where('school_year', '!=', $currentYear)->sum('balance');
        
        // Calculate total balance to pay (current year balance + previous balance)
        $totalCurrentBalance = $allCurrentFees->sum('balance');
        $totalBalanceToPay = $totalCurrentBalance + $totalPreviousBalance;

        return Inertia::render($this->viewPrefix() . '/payments/index', [
            'students' => $students,
            'selectedStudent' => $paymentData,
            'filters' => $request->only(['search', 'enrollment_status', 'student_id']),
            'statistics' => [
                'original_tuition' => $totalTuitionFees,
                'grant_deduction' => $totalGrantDiscounts,
                'total_tuition_fees' => $totalTuitionFees - $totalGrantDiscounts,
                'total_paid' => $allCurrentFees->sum('total_paid'),
                'previous_balance' => $totalPreviousBalance,
                'total_balance_to_pay' => $totalBalanceToPay,
            ],
        ]);
    }

    /**
     * Export payments data.
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'excel');
        
        // For now, return a simple response
        // Later implement with Laravel Excel or similar
        return response()->json([
            'message' => 'Export functionality - implement with Laravel Excel package',
            'type' => $type,
        ]);
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'student_fee_id' => 'required|exists:student_fees,id',
            'payment_date' => 'required|date',
            'or_number' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_mode' => 'nullable|in:CASH,GCASH,BANK',
            'reference_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'payment_for' => 'nullable|in:registration,tuition,misc,books,other',
            'notes' => 'nullable|string',
        ]);

        $validated['recorded_by'] = $request->user()->id;

        StudentPayment::create($validated);

        // Update the student fee balance
        $studentFee = StudentFee::find($validated['student_fee_id']);
        if ($studentFee) {
            $studentFee->updateBalance();
        }

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, StudentPayment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'payment_date' => 'required|date',
            'or_number' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'payment_for' => 'nullable|in:registration,tuition,misc,books,other',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);

        return redirect()->back()->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified payment.
     */
    public function destroy(StudentPayment $payment): RedirectResponse
    {
        $payment->delete();

        return redirect()->back()->with('success', 'Payment deleted successfully.');
    }

    /**
     * Show payment form for a specific student.
     */
    public function create(Request $request): Response
    {
        $studentId = $request->input('student_id');
        $student = null;
        $fees = collect();

        if ($studentId) {
            $student = \App\Models\Student::with('fees')->findOrFail($studentId);
            $fees = $student->fees;
        }

        return Inertia::render($this->viewPrefix() . '/payments/create', [
            'student' => $student,
            'fees' => $fees,
        ]);
    }

    /**
     * Show payment processing page for a specific student.
     * Fees are calculated DYNAMICALLY from fee_items table.
     */
    public function process(Request $request, Student $student): Response
    {
        // Load student with department for classification matching
        $student->load(['department', 'enrollmentClearance']);

        // Get unique school years from fee_items that apply to this student
        $schoolYears = $this->getApplicableSchoolYears($student);

        // Build fees array dynamically from fee_items
        $fees = collect();
        foreach ($schoolYears as $schoolYear) {
            $feeData = $this->calculateFeesForSchoolYear($student, $schoolYear);
            if ($feeData) {
                $fees->push($feeData);
            }
        }

        // Get all payments
        $payments = StudentPayment::where('student_id', $student->id)
            ->with(['recordedBy', 'studentFee'])
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date,
                    'or_number' => $payment->or_number,
                    'amount' => (float) $payment->amount,
                    'payment_for' => $payment->payment_for,
                    'payment_mode' => $payment->payment_mode ?? $payment->payment_method ?? 'CASH',
                    'notes' => $payment->notes,
                    'recorded_by' => $payment->recordedBy?->name,
                    'school_year' => $payment->studentFee?->school_year,
                    'created_at' => $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        // Get promissory notes
        $promissoryNotes = \App\Models\PromissoryNote::where('student_id', $student->id)
            ->with(['studentFee', 'reviewer'])
            ->orderBy('submitted_date', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'student_fee_id' => $note->student_fee_id,
                    'submitted_date' => $note->submitted_date->format('Y-m-d'),
                    'due_date' => $note->due_date->format('Y-m-d'),
                    'amount' => $note->amount !== null ? (float) $note->amount : null,
                    'reason' => $note->reason,
                    'status' => $note->status,
                    'school_year' => $note->studentFee?->school_year,
                    'reviewed_by' => $note->reviewer?->name,
                    'reviewed_at' => $note->reviewed_at?->format('Y-m-d H:i'),
                    'review_notes' => $note->review_notes,
                ];
            });

        // Calculate summary stats dynamically
        $totalFees = $fees->sum('total_amount');
        $totalDiscount = $fees->sum('grant_discount');
        $totalPaid = $payments->sum('amount');
        
        // Calculate previous balance (from school years before the student's latest enrolled year)
        $currentSchoolYear = \App\Models\AppSetting::current()?->school_year ?? (date('Y') . '-' . (date('Y') + 1));
        // Use the highest school year in fees as the "current" year — avoids treating future-year fees as previous
        $latestYear = $fees->isEmpty() ? $currentSchoolYear : $fees->sortByDesc('school_year')->first()['school_year'];
        $previousBalance = $fees->filter(fn($f) => $f['school_year'] < $latestYear)->sum('balance');
        $currentFeesBalance = $fees->where('school_year', $latestYear)->sum('balance');
        
        $summary = [
            'total_fees' => $totalFees,
            'total_discount' => $totalDiscount,
            'total_paid' => $totalPaid,
            'total_balance' => max(0, $totalFees - $totalDiscount - $totalPaid),
            'previous_balance' => $previousBalance,
            'current_fees_balance' => $currentFeesBalance > 0 ? $currentFeesBalance : max(0, $totalFees - $totalDiscount - $totalPaid),
        ];

        // Get grants/scholarships for this student
        $grants = \App\Models\GrantRecipient::where('student_id', $student->id)
            ->with('grant')
            ->get()
            ->map(function ($recipient) {
                return [
                    'id' => $recipient->id,
                    'name' => $recipient->grant->name,
                    'discount_amount' => (float) $recipient->discount_amount,
                    'school_year' => $recipient->school_year,
                    'status' => $recipient->status,
                ];
            });

        // Get balance adjustments for this student
        $balanceAdjustments = BalanceAdjustment::where('student_id', $student->id)
            ->with('adjuster:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($adj) {
                return [
                    'id' => $adj->id,
                    'amount' => (float) $adj->amount,
                    'reason' => $adj->reason,
                    'school_year' => $adj->school_year,
                    'notes' => $adj->notes,
                    'adjusted_by' => $adj->adjuster?->name,
                    'created_at' => $adj->created_at->format('M d, Y h:i A'),
                ];
            });

        // Get cashiers (accounting staff)
        $cashiers = \App\Models\User::where('role', 'accounting')
            ->orderBy('name')
            ->get(['id', 'name']);

        // Get current authenticated user for cashier field
        $currentUser = $request->user();

        return Inertia::render($this->viewPrefix() . '/payments/process', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'email' => $student->email,
                'program' => $student->program,
                'year_level' => $student->year_level,
                'section' => $student->section,
                'department' => $student->department?->name,
                'classification' => $student->department?->classification,
                'student_photo_url' => $student->student_photo_url,
                'enrollment_status' => $student->enrollment_status,
            ],
            'fees' => $fees->values(),
            'payments' => $payments,
            'promissoryNotes' => $promissoryNotes,
            'grants' => $grants,
            'summary' => $summary,
            'cashiers' => $cashiers,
            'balanceAdjustments' => $balanceAdjustments,
            'enrollmentClearance' => $student->enrollmentClearance ? [
                'id' => $student->enrollmentClearance->id,
                'accounting_clearance' => (bool) $student->enrollmentClearance->accounting_clearance,
                'accounting_cleared_at' => $student->enrollmentClearance->accounting_cleared_at?->format('Y-m-d H:i'),
                'accounting_notes' => $student->enrollmentClearance->accounting_notes,
            ] : null,
            'currentUser' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
            ],
        ]);
    }

    /**
     * Get all school years that have applicable fee items for this student.
     */
    private function getApplicableSchoolYears(Student $student): array
    {
        // Anchor to the registrar-assigned year to avoid auto-creating future-year fees.
        $enrolledYear = $student->school_year ?? \App\Models\AppSetting::current()?->school_year;

        $feeItemYears = \App\Models\FeeItem::where('is_active', true)
            ->whereNotNull('school_year')
            ->when($enrolledYear, fn($q) => $q->where('school_year', $enrolledYear))
            ->where(function ($query) use ($student, $enrolledYear) {
                // 'all' scope only if no explicit per-group assignments override it
                $query->where(function ($inner) {
                        $inner->where('assignment_scope', 'all')
                              ->whereDoesntHave('assignments');
                    })
                    // 'specific' scope with at least one direct filter field
                    ->orWhere(function ($q) use ($student) {
                        $q->where('assignment_scope', 'specific')
                          ->where(function ($inner) {
                              $inner->whereNotNull('classification')
                                    ->orWhereNotNull('department_id')
                                    ->orWhereNotNull('program_id')
                                    ->orWhereNotNull('year_level_id')
                                    ->orWhereNotNull('section_id');
                          });
                        $this->applyStudentFilters($q, $student);
                    })
                    // Or items explicitly assigned via the Assignments tab
                    ->orWhereHas('assignments', function ($q) use ($student, $enrolledYear) {
                        $this->applyAssignmentFilters($q, $student, $enrolledYear);
                    });
            })
            ->distinct()
            ->pluck('school_year');

        // Always include years that already have StudentFee records
        // (preserves existing payment history even if fee items no longer apply)
        $existingYears = StudentFee::where('student_id', $student->id)
            ->when($enrolledYear, fn($q) => $q->where('school_year', '<=', $enrolledYear))
            ->pluck('school_year');

        return $feeItemYears->merge($existingYears)
            ->unique()
            ->sort()
            ->values()
            ->toArray();
    }

    /**
     * Calculate fees dynamically for a specific school year.
     */
    private function calculateFeesForSchoolYear(Student $student, string $schoolYear): ?array
    {
        // Get applicable fee items (exclude Drop category - those are only charged via drop requests)
        $feeItems = \App\Models\FeeItem::with('category')
            ->where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereDoesntHave('category', function ($q) {
                $q->where('name', 'like', '%Drop%');
            })
            ->where(function ($query) use ($student, $schoolYear) {
                $query->where(function ($inner) {
                        $inner->where('assignment_scope', 'all')
                              ->whereDoesntHave('assignments');
                    })
                    ->orWhere(function ($q) use ($student) {
                        $q->where('assignment_scope', 'specific')
                          ->where(function ($inner) {
                              $inner->whereNotNull('classification')
                                    ->orWhereNotNull('department_id')
                                    ->orWhereNotNull('program_id')
                                    ->orWhereNotNull('year_level_id')
                                    ->orWhereNotNull('section_id');
                          });
                        $this->applyStudentFilters($q, $student);
                    })
                    ->orWhereHas('assignments', function ($q) use ($student, $schoolYear) {
                        $this->applyAssignmentFilters($q, $student, $schoolYear);
                    });
            })
            ->get();

        if ($feeItems->isEmpty()) {
            return null;
        }

        // Pre-fetch enrolled units for per-unit tuition calculation
        $enrolledUnits = \App\Models\StudentSubject::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->whereIn('status', ['enrolled'])
            ->join('subjects', 'subjects.id', '=', 'student_subjects.subject_id')
            ->sum('subjects.units');

        // Calculate total from fee items (per-unit items use unit_price × enrolled_units)
        $totalAmount = $feeItems->sum(function ($item) use ($enrolledUnits) {
            if ($item->is_per_unit) {
                return (float) $item->unit_price * (float) $enrolledUnits;
            }
            return (float) $item->selling_price;
        });

        // Get grant discount — always recalculate from Grant model so stale discount_amount is never used.
        // For the current school year apply ALL active grants regardless of their school_year label
        // (the form default can cause a year mismatch). For historical years use exact matching.
        $currentSchoolYear = \App\Models\AppSetting::current()?->school_year ?? $schoolYear;
        $grantRecipients = GrantRecipient::where('student_id', $student->id)
            ->when($schoolYear !== $currentSchoolYear, fn($q) => $q->where('school_year', $schoolYear))
            ->where('status', 'active')
            ->with('grant')
            ->get();
        $grantDiscount = 0.0;
        foreach ($grantRecipients as $recipient) {
            if ($recipient->grant) {
                $calculated = $recipient->grant->calculateDiscount((float) $totalAmount);
                if ((float) $recipient->discount_amount !== $calculated) {
                    $recipient->discount_amount = $calculated;
                    $recipient->save();
                }
                $grantDiscount += $calculated;
            }
        }

        // Get or create the student_fees record for tracking payments
        $studentFee = StudentFee::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->first();

        $isOverdue = $studentFee ? $studentFee->is_overdue : false;
        $dueDate = $studentFee?->due_date;
        $studentFeeId = $studentFee?->id;

        // Total paid = sum of actual payment records (always fresh)
        $totalPaid = $studentFee ? (float) $studentFee->payments()->sum('amount') : 0.0;

        if (!$studentFee) {
            $studentFee = StudentFee::create([
                'student_id'     => $student->id,
                'school_year'    => $schoolYear,
                'total_amount'   => $totalAmount,
                'grant_discount' => $grantDiscount,
                'total_paid'     => 0,
                'balance'        => max(0, $totalAmount - $grantDiscount),
            ]);
            $studentFeeId = $studentFee->id;
        } else {
            // Sync stored record: check total_amount, grant_discount, and balance for correctness
            $freshTotal    = (float) $totalAmount;
            $freshDiscount = (float) $grantDiscount;
            $freshBalance  = max(0, $freshTotal - $freshDiscount - $totalPaid);
            if ((float) $studentFee->total_amount   !== $freshTotal
                || (float) $studentFee->grant_discount !== $freshDiscount
                || (float) $studentFee->balance        !== $freshBalance) {
                $studentFee->total_amount    = $freshTotal;
                $studentFee->total_paid      = $totalPaid;
                $studentFee->grant_discount  = $freshDiscount;
                $studentFee->balance         = $freshBalance;
                $studentFee->save();
            }
        }

        // Calculate balance
        $balance = max(0, $totalAmount - $grantDiscount - $totalPaid);

        // Group items by category
        $itemsByCategory = $feeItems->groupBy('fee_category_id')->map(function ($items, $categoryId) use ($enrolledUnits) {
            $category = $items->first()->category;
            return [
                'category_id'   => $categoryId,
                'category_name' => $category->name ?? 'Other',
                'items'         => $items->map(function ($item) use ($enrolledUnits) {
                    $amount = $item->is_per_unit
                        ? (float) $item->unit_price * (float) $enrolledUnits
                        : (float) $item->selling_price;
                    return [
                        'id'           => $item->id,
                        'name'         => $item->name,
                        'amount'       => $amount,
                        'is_per_unit'  => (bool) $item->is_per_unit,
                        'unit_price'   => (float) $item->unit_price,
                        'enrolled_units'=> (float) $enrolledUnits,
                    ];
                })->values()->toArray(),
            ];
        })->values()->toArray();

        return [
            'id' => $studentFeeId,
            'school_year' => $schoolYear,
            'total_amount' => (float) $totalAmount,
            'grant_discount' => (float) $grantDiscount,
            'total_paid' => (float) $totalPaid,
            'balance' => (float) $balance,
            'status' => $balance <= 0 ? 'paid' : ($isOverdue ? 'overdue' : 'pending'),
            'is_overdue' => $isOverdue,
            'due_date' => $dueDate,
            'categories' => $itemsByCategory,
            'carried_forward_balance' => (float) ($studentFee->carried_forward_balance ?? 0),
            'carried_forward_from' => $studentFee->carried_forward_from ?? null,
        ];
    }

    /**
     * Record a school year balance rollover (carry forward) for a student.
     * Marks the current school year's StudentFee with how much was carried in from previous years.
     */
    public function carryForwardBalance(Request $request, Student $student): \Illuminate\Http\RedirectResponse
    {
        $currentSchoolYear = \App\Models\AppSetting::current()->school_year ?? date('Y') . '-' . (date('Y') + 1);

        // Sum outstanding balances from previous school years
        $previousFees = StudentFee::where('student_id', $student->id)
            ->where('school_year', '!=', $currentSchoolYear)
            ->where('balance', '>', 0)
            ->get();

        if ($previousFees->isEmpty()) {
            return redirect()->back()->with('error', 'No previous balance to carry forward.');
        }

        $totalPreviousBalance = $previousFees->sum('balance');
        $previousYears = $previousFees->pluck('school_year')->implode(', ');

        // Get or create the current year's StudentFee
        $currentFee = StudentFee::firstOrCreate(
            ['student_id' => $student->id, 'school_year' => $currentSchoolYear],
            ['total_amount' => 0, 'total_paid' => 0, 'balance' => 0, 'grant_discount' => 0]
        );

        $currentFee->carried_forward_balance = $totalPreviousBalance;
        $currentFee->carried_forward_from    = $previousYears;
        $currentFee->save();

        return redirect()->back()->with('success', "Carried forward ₱" . number_format($totalPreviousBalance, 2) . " from {$previousYears}.");
    }

    /**
     * Apply student-specific filters to fee_item_assignments query.
     */
    private function applyAssignmentFilters($query, Student $student, ?string $schoolYear = null): void
    {
        $query->where('is_active', true);

        // Students must always have department_id set at creation time
        if (!$student->department_id) {
            $query->whereRaw('1 = 0');
            return;
        }

        if ($student->department) {
            $query->where('classification', $student->department->classification);
        }

        $query->where('department_id', $student->department_id);

        $resolvedYearLevelId = $student->year_level_id;
        if (!$resolvedYearLevelId && $student->year_level) {
            $resolvedYearLevelId = \App\Models\YearLevel::where('department_id', $student->department_id)
                ->where('name', $student->year_level)
                ->value('id');
        }

        if ($resolvedYearLevelId) {
            $query->where(function ($sq) use ($resolvedYearLevelId) {
                $sq->whereNull('year_level_id')
                    ->orWhere('year_level_id', $resolvedYearLevelId);
            });
        } else {
            $query->whereNull('year_level_id');
        }
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

        // Note: program_id not filtered — Student model has no program_id FK;
        // department_id provides sufficient program-level scoping for College.

        // Match year level if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('year_level_id');

            if ($student->year_level_id) {
                $sq->orWhere('year_level_id', $student->year_level_id);
            } elseif ($student->year_level) {
                $sq->orWhereRaw('LOWER(TRIM(year_level)) = ?', [strtolower(trim((string) $student->year_level))]);
            }
        });

        // Match section if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('section_id')
                ->orWhere('section_id', $student->section_id);
        });
    }

    /**
     * Calculate student balance dynamically for a specific school year.
     */
    private function calculateStudentBalance(Student $student, string $schoolYear): float
    {
        // Calculate total from applicable fee items (exclude Drop category - those are only charged via drop requests)
        $totalAmount = \App\Models\FeeItem::where('school_year', $schoolYear)
            ->where('is_active', true)
            ->whereDoesntHave('category', function ($q) {
                $q->where('name', 'like', '%Drop%');
            })
            ->where(function ($query) use ($student, $schoolYear) {
                $query->where(function ($inner) {
                        $inner->where('assignment_scope', 'all')
                              ->whereDoesntHave('assignments');
                    })
                    ->orWhere(function ($q) use ($student) {
                        $q->where('assignment_scope', 'specific')
                          ->where(function ($inner) {
                              $inner->whereNotNull('classification')
                                    ->orWhereNotNull('department_id')
                                    ->orWhereNotNull('program_id')
                                    ->orWhereNotNull('year_level_id')
                                    ->orWhereNotNull('section_id');
                          });
                        $this->applyStudentFilters($q, $student);
                    })
                    ->orWhereHas('assignments', function ($q) use ($student, $schoolYear) {
                        $this->applyAssignmentFilters($q, $student, $schoolYear);
                    });
            })
            ->sum('selling_price');

        // Get grant discount from Grant model (always fresh, not stale discount_amount).
        // For the current school year apply ALL active grants (fixes year-label mismatch).
        $currentSchoolYear = \App\Models\AppSetting::current()?->school_year ?? $schoolYear;
        $grantRecipients = GrantRecipient::where('student_id', $student->id)
            ->when($schoolYear !== $currentSchoolYear, fn($q) => $q->where('school_year', $schoolYear))
            ->where('status', 'active')
            ->with('grant')
            ->get();
        $grantDiscount = 0.0;
        foreach ($grantRecipients as $recipient) {
            if ($recipient->grant) {
                $grantDiscount += $recipient->grant->calculateDiscount((float) $totalAmount);
            }
        }

        // Get total paid from actual payment records (always fresh)
        $studentFee = StudentFee::where('student_id', $student->id)
            ->where('school_year', $schoolYear)
            ->first();
        $totalPaid = $studentFee ? (float) $studentFee->payments()->sum('amount') : 0.0;

        return max(0, $totalAmount - $grantDiscount - $totalPaid);
    }

    /**
    /**
     * Manually create a new student_fees record for a specific school year.
     * Only available for super-accounting roles. Always logged.
     */
    public function addSchoolYear(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'school_year' => 'required|string|max:20',
            'total_amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ]);

        // Prevent duplicate school year records for this student
        $existing = StudentFee::where('student_id', $student->id)
            ->where('school_year', $validated['school_year'])
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', "A fee record for school year {$validated['school_year']} already exists.");
        }

        $fee = StudentFee::create([
            'student_id'    => $student->id,
            'school_year'   => $validated['school_year'],
            'total_amount'  => (float) $validated['total_amount'],
            'total_paid'    => 0,
            'balance'       => (float) $validated['total_amount'],
            'grant_discount' => 0,
            'status'        => 'pending',
        ]);

        StudentActionLog::log(
            studentId: $student->id,
            action: "School year fee record added for {$validated['school_year']} — {$validated['reason']}",
            actionType: 'fee_edit',
            details: "Created StudentFee #{$fee->id} for {$validated['school_year']}: ₱" . number_format($validated['total_amount'], 2),
            notes: null,
            changes: [
                'school_year'  => $validated['school_year'],
                'total_amount' => (float) $validated['total_amount'],
                'reason'       => $validated['reason'],
            ],
            performedBy: $request->user()->id,
        );

        return redirect()->back()->with('success', "Fee record for {$validated['school_year']} created.");
    }

    /**
     * Add balance to a student's fee record.
     * Only available for super-accounting role. Always logged.
     */
    public function addBalance(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'student_fee_id' => 'required|exists:student_fees,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $studentFee = StudentFee::findOrFail($validated['student_fee_id']);

        // Ensure the fee belongs to this student
        if ((int) $studentFee->student_id !== (int) $student->id) {
            return redirect()->back()->with('error', 'Fee record does not belong to this student.');
        }

        // Add the balance to the fee record
        $studentFee->total_amount = (float) $studentFee->total_amount + (float) $validated['amount'];
        $studentFee->balance = max(0, (float) $studentFee->total_amount - (float) $studentFee->grant_discount - (float) $studentFee->total_paid);
        $studentFee->save();

        // Log the balance adjustment
        BalanceAdjustment::create([
            'student_id' => $student->id,
            'student_fee_id' => $studentFee->id,
            'adjusted_by' => $request->user()->id,
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'school_year' => $studentFee->school_year,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Also log to student action logs
        StudentActionLog::log(
            studentId: $student->id,
            action: "Balance added: ₱" . number_format($validated['amount'], 2) . " — {$validated['reason']}",
            actionType: 'balance_adjustment',
            details: "Added ₱" . number_format($validated['amount'], 2) . " to {$studentFee->school_year} fees",
            notes: $validated['notes'] ?? null,
            changes: [
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
                'school_year' => $studentFee->school_year,
                'new_total_amount' => (float) $studentFee->total_amount,
                'new_balance' => (float) $studentFee->balance,
            ],
            performedBy: $request->user()->id,
        );

        return redirect()->back()->with('success', "Balance of ₱" . number_format($validated['amount'], 2) . " added successfully.");
    }

    /**
     * Edit a StudentFee record's discount and/or due date.
     * Only available for accounting roles. Always logged.
     */
    public function editFee(Request $request, Student $student, StudentFee $fee): RedirectResponse
    {
        // Ensure the fee belongs to this student
        if ((int) $fee->student_id !== (int) $student->id) {
            return redirect()->back()->with('error', 'Fee record does not belong to this student.');
        }

        $validated = $request->validate([
            'grant_discount' => 'nullable|numeric|min:0',
            'due_date'       => 'nullable|date',
            'reason'         => 'required|string|max:500',
        ]);

        $oldDiscount = (float) $fee->grant_discount;
        $oldDueDate  = $fee->due_date;

        if (isset($validated['grant_discount'])) {
            $fee->grant_discount = (float) $validated['grant_discount'];
        }
        if (array_key_exists('due_date', $validated)) {
            $fee->due_date = $validated['due_date'];
        }

        // Recalculate balance
        $fee->balance = max(0, (float) $fee->total_amount - (float) $fee->grant_discount - (float) $fee->total_paid);
        $fee->save();

        // Log the change
        StudentActionLog::log(
            studentId: $student->id,
            action: "Fee record edited for {$fee->school_year} — {$validated['reason']}",
            actionType: 'fee_edit',
            details: "Updated {$fee->school_year}: discount {$oldDiscount} → {$fee->grant_discount}; due date {$oldDueDate} → {$fee->due_date}",
            notes: null,
            changes: [
                'school_year'      => $fee->school_year,
                'old_discount'     => $oldDiscount,
                'new_discount'     => (float) $fee->grant_discount,
                'old_due_date'     => $oldDueDate,
                'new_due_date'     => $fee->due_date,
                'reason'           => $validated['reason'],
                'new_balance'      => (float) $fee->balance,
            ],
            performedBy: $request->user()->id,
        );

        return redirect()->back()->with('success', "Fee record for {$fee->school_year} updated.");
    }

    /**
     * Delete a StudentFee record (removes tracking record; fees recalculate next visit).
     * Only available for accounting roles. Always logged.
     */
    public function deleteFee(Request $request, Student $student, StudentFee $fee): RedirectResponse
    {
        // Ensure the fee belongs to this student
        if ((int) $fee->student_id !== (int) $student->id) {
            return redirect()->back()->with('error', 'Fee record does not belong to this student.');
        }

        // Prevent deletion if payments have been made
        if ((float) $fee->total_paid > 0) {
            return redirect()->back()->with('error', "Cannot delete fee record for {$fee->school_year} — payments of ₱" . number_format($fee->total_paid, 2) . " already recorded.");
        }

        $schoolYear = $fee->school_year;

        StudentActionLog::log(
            studentId: $student->id,
            action: "Fee record deleted for {$schoolYear}",
            actionType: 'fee_delete',
            details: "Deleted StudentFee #{$fee->id} for {$schoolYear}",
            notes: null,
            changes: ['school_year' => $schoolYear, 'fee_id' => $fee->id],
            performedBy: $request->user()->id,
        );

        $fee->delete();

        return redirect()->back()->with('success', "Fee record for {$schoolYear} deleted.");
    }
}
