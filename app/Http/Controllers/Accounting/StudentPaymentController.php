<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
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
     * Display a listing of payments.
     */
    public function index(Request $request): Response
    {
        $query = StudentPayment::with(['student', 'recordedBy']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function ($q2) use ($search) {
                      $q2->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%")
                         ->orWhere('lrn', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by date range
        if ($from = $request->input('from')) {
            $query->whereDate('payment_date', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->whereDate('payment_date', '<=', $to);
        }

        // Filter by payment type
        if ($paymentFor = $request->input('payment_for')) {
            $query->where('payment_for', $paymentFor);
        }

        $payments = $query->latest('payment_date')
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        // Calculate total for filtered results
        $total = $query->sum('amount');

        // Get all students with their fees
        $students = Student::orderBy('last_name')->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'lrn' => $student->lrn,
                    'full_name' => $student->full_name,
                ];
            });

        // Get all fees grouped by student
        $studentFees = StudentFee::with('student')
            ->where('balance', '>', 0)
            ->get()
            ->groupBy('student_id')
            ->map(function ($fees) {
                return $fees->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'school_year' => $fee->school_year,
                        'total_amount' => $fee->total_amount,
                        'total_paid' => $fee->total_paid,
                        'balance' => $fee->balance,
                    ];
                });
            });

        return Inertia::render('accounting/payments/index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'from', 'to', 'payment_for']),
            'total' => $total,
            'students' => $students,
            'studentFees' => $studentFees,
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
            'payment_for' => 'nullable|in:registration,tuition,misc,books,other',
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
}
