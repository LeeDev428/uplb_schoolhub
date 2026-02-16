<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\EnrollmentClearance;
use App\Models\PromissoryNote;
use App\Models\Student;
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

        // Get students from student-accounts (those with registrar clearance or complete enrollment)
        $query = Student::with(['department', 'enrollmentClearance'])
            ->whereHas('enrollmentClearance', function ($q) {
                $q->where('registrar_clearance', true)
                  ->orWhere('requirements_complete', true);
            });

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

        // Transform students for list
        $students->through(function ($student) {
            $currentFee = StudentFee::where('student_id', $student->id)
                ->where('school_year', $student->school_year ?? date('Y') . '-' . (date('Y') + 1))
                ->first();

            $previousFee = StudentFee::where('student_id', $student->id)
                ->where('school_year', '!=', $student->school_year ?? date('Y') . '-' . (date('Y') + 1))
                ->orderBy('created_at', 'desc')
                ->first();

            return [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'program' => $student->program,
                'year_level' => $student->year_level,
                'section' => $student->section,
                'department' => $student->department?->name,
                'enrollment_status' => $student->enrollment_status,
                'enrollment_progress' => $student->enrollmentClearance,
                'current_balance' => $currentFee?->balance ?? 0,
                'previous_balance' => $previousFee?->balance ?? 0,
                'total_balance' => ($currentFee?->balance ?? 0) + ($previousFee?->balance ?? 0),
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
                $currentYear = $selectedStudent->school_year ?? date('Y') . '-' . (date('Y') + 1);
                $currentFee = $studentFees->firstWhere('school_year', $currentYear);
                $previousFees = $studentFees->where('school_year', '!=', $currentYear);

                $paymentData = [
                    'student' => [
                        'id' => $selectedStudent->id,
                        'full_name' => $selectedStudent->full_name,
                        'lrn' => $selectedStudent->lrn,
                        'program' => $selectedStudent->program,
                        'year_level' => $selectedStudent->year_level,
                        'section' => $selectedStudent->section,
                        'department' => $selectedStudent->department?->name,
                        'enrollment_status' => $selectedStudent->enrollment_status,
                        'student_photo_url' => $selectedStudent->student_photo_url,
                    ],
                    'current_fee' => $currentFee ? [
                        'id' => $currentFee->id,
                        'school_year' => $currentFee->school_year,
                        'registration_fee' => $currentFee->registration_fee,
                        'tuition_fee' => $currentFee->tuition_fee,
                        'misc_fee' => $currentFee->misc_fee,
                        'books_fee' => $currentFee->books_fee,
                        'other_fees' => $currentFee->other_fees,
                        'total_amount' => $currentFee->total_amount,
                        'grant_discount' => $currentFee->grant_discount,
                        'total_paid' => $currentFee->total_paid,
                        'balance' => $currentFee->balance,
                        'is_overdue' => $currentFee->is_overdue,
                        'due_date' => $currentFee->due_date,
                    ] : null,
                    'previous_balance' => $previousFees->sum('balance'),
                    'total_balance' => ($currentFee?->balance ?? 0) + $previousFees->sum('balance'),
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

        return Inertia::render('accounting/payments/index', [
            'students' => $students,
            'selectedStudent' => $paymentData,
            'filters' => $request->only(['search', 'enrollment_status', 'student_id']),
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
            'payment_for' => 'nullable|in:general,registration,tuition,misc,books,other',
            'notes' => 'nullable|string',
        ]);

        $validated['recorded_by'] = auth()->id();

        StudentPayment::create($validated);

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

        return Inertia::render('accounting/payments/create', [
            'student' => $student,
            'fees' => $fees,
        ]);
    }

    /**
     * Show payment processing page for a specific student.
     */
    public function process(Student $student): Response
    {
        // Student already has program, year_level, section as string attributes
        // No need to load relationships here

        // Get all fees for this student with detailed breakdown
        $fees = StudentFee::where('student_id', $student->id)
            ->orderBy('school_year', 'desc')
            ->get()
            ->map(function ($fee) use ($student) {
                // Get all fee items that apply to this student for this school year
                $feeItemsQuery = \App\Models\FeeItem::with('category')
                    ->where('school_year', $fee->school_year)
                    ->where('is_active', true);

                // Filter items based on assignment scope
                $feeItemsQuery->where(function ($query) use ($student) {
                    // Include items with 'all' scope
                    $query->where('assignment_scope', 'all')
                        // Or items with 'specific' scope that match this student
                        ->orWhere(function ($q) use ($student) {
                            $q->where('assignment_scope', 'specific');
                            
                            // Match classification if set
                            if ($student->department) {
                                $q->where(function ($sq) use ($student) {
                                    $sq->whereNull('classification')
                                        ->orWhere('classification', $student->department->classification);
                                });
                            }
                            
                            // Match department if set
                            $q->where(function ($sq) use ($student) {
                                $sq->whereNull('department_id')
                                    ->orWhere('department_id', $student->department_id);
                            });
                            
                            // Match program if set
                            $q->where(function ($sq) use ($student) {
                                $sq->whereNull('program_id')
                                    ->orWhere('program_id', $student->program_id);
                            });
                            
                            // Match year level if set
                            $q->where(function ($sq) use ($student) {
                                $sq->whereNull('year_level_id')
                                    ->orWhere('year_level_id', $student->year_level_id);
                            });
                            
                            // Match section if set
                            $q->where(function ($sq) use ($student) {
                                $sq->whereNull('section_id')
                                    ->orWhere('section_id', $student->section_id);
                            });
                        });
                });

                $feeItems = $feeItemsQuery->get();

                // Group items by category
                $itemsByCategory = $feeItems->groupBy('fee_category_id')->map(function ($items, $categoryId) {
                    $category = $items->first()->category;
                    return [
                        'category_id' => $categoryId,
                        'category_name' => $category->name ?? 'Other',
                        'items' => $items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'name' => $item->name,
                                'amount' => (float) $item->selling_price,
                            ];
                        })->values()->toArray(),
                    ];
                })->values()->toArray();
                
                return [
                    'id' => $fee->id,
                    'school_year' => $fee->school_year,
                    'total_amount' => (float) $fee->total_amount,
                    'grant_discount' => (float) ($fee->grant_discount ?? 0),
                    'total_paid' => (float) $fee->total_paid,
                    'balance' => (float) $fee->balance,
                    'status' => $fee->balance <= 0 ? 'paid' : ($fee->is_overdue ? 'overdue' : 'pending'),
                    'is_overdue' => $fee->is_overdue,
                    'due_date' => $fee->due_date,
                    'categories' => $itemsByCategory,
                ];
            });

        // Get all payments
        $payments = StudentPayment::where('student_id', $student->id)
            ->with(['recordedBy'])
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date,
                    'or_number' => $payment->or_number,
                    'amount' => (float) $payment->amount,
                    'payment_for' => $payment->payment_for,
                    'notes' => $payment->notes,
                    'recorded_by' => $payment->recordedBy?->name,
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
                    'amount' => (float) $note->amount,
                    'reason' => $note->reason,
                    'status' => $note->status,
                    'school_year' => $note->studentFee?->school_year,
                    'reviewed_by' => $note->reviewer?->name,
                    'reviewed_at' => $note->reviewed_at?->format('Y-m-d H:i'),
                    'review_notes' => $note->review_notes,
                ];
            });

        // Calculate summary stats
        $summary = [
            'total_fees' => $fees->sum('total_amount'),
            'total_discount' => $fees->sum('grant_discount'),
            'total_paid' => $payments->sum('amount'),
            'total_balance' => $fees->sum('balance'),
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

        return Inertia::render('accounting/payments/process', [
            'student' => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'email' => $student->email,
                'program' => $student->program,
                'year_level' => $student->year_level,
                'section' => $student->section,
                'student_photo_url' => $student->student_photo_url,
            ],
            'fees' => $fees,
            'payments' => $payments,
            'promissoryNotes' => $promissoryNotes,
            'grants' => $grants,
            'summary' => $summary,
        ]);
    }
}
