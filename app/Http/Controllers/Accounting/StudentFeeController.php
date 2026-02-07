<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentFeeController extends Controller
{
    /**
     * Display a listing of student fees.
     */
    public function index(Request $request): Response
    {
        $query = StudentFee::with('student');

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Filter by payment status
        if ($status = $request->input('status')) {
            if ($status === 'paid') {
                $query->whereColumn('balance', '<=', 0);
            } elseif ($status === 'partial') {
                $query->where('total_paid', '>', 0)->whereColumn('balance', '>', 0);
            } elseif ($status === 'unpaid') {
                $query->where('total_paid', 0);
            }
        }

        // Filter by school year
        if ($schoolYear = $request->input('school_year')) {
            $query->where('school_year', $schoolYear);
        }

        $fees = $query->latest()->paginate(20)->withQueryString();

        $schoolYears = StudentFee::distinct()->pluck('school_year')->sort()->values();

        return Inertia::render('accounting/fees/index', [
            'fees' => $fees,
            'filters' => $request->only(['search', 'status', 'school_year']),
            'schoolYears' => $schoolYears,
        ]);
    }

    /**
     * Store a newly created fee record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'school_year' => 'required|string',
            'registration_fee' => 'required|numeric|min:0',
            'tuition_fee' => 'required|numeric|min:0',
            'misc_fee' => 'required|numeric|min:0',
            'books_fee' => 'required|numeric|min:0',
            'other_fees' => 'nullable|numeric|min:0',
        ]);

        $validated['other_fees'] = $validated['other_fees'] ?? 0;
        $validated['total_amount'] = 
            $validated['registration_fee'] + 
            $validated['tuition_fee'] + 
            $validated['misc_fee'] + 
            $validated['books_fee'] + 
            $validated['other_fees'];
        $validated['balance'] = $validated['total_amount'];

        StudentFee::create($validated);

        return redirect()->back()->with('success', 'Fee record created successfully.');
    }

    /**
     * Update the specified fee record.
     */
    public function update(Request $request, StudentFee $fee): RedirectResponse
    {
        $validated = $request->validate([
            'registration_fee' => 'required|numeric|min:0',
            'tuition_fee' => 'required|numeric|min:0',
            'misc_fee' => 'required|numeric|min:0',
            'books_fee' => 'required|numeric|min:0',
            'other_fees' => 'nullable|numeric|min:0',
        ]);

        $validated['other_fees'] = $validated['other_fees'] ?? 0;
        $validated['total_amount'] = 
            $validated['registration_fee'] + 
            $validated['tuition_fee'] + 
            $validated['misc_fee'] + 
            $validated['books_fee'] + 
            $validated['other_fees'];
        
        // Recalculate balance
        $validated['balance'] = $validated['total_amount'] - $fee->total_paid;

        $fee->update($validated);

        return redirect()->back()->with('success', 'Fee record updated successfully.');
    }

    /**
     * Remove the specified fee record.
     */
    public function destroy(StudentFee $fee): RedirectResponse
    {
        $fee->delete();

        return redirect()->back()->with('success', 'Fee record deleted successfully.');
    }
}
