<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PromissoryNote;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PromissoryNoteController extends Controller
{
    /**
     * Display a listing of the student's promissory notes.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $student = $user->student;
        
        if (!$student) {
            return Inertia::render('student/promissory-notes/index', [
                'notes' => [],
                'studentFees' => [],
                'stats' => [
                    'total' => 0,
                    'pending' => 0,
                    'approved' => 0,
                    'declined' => 0,
                ],
            ]);
        }

        $notes = PromissoryNote::where('student_id', $student->id)
            ->with(['studentFee', 'reviewer'])
            ->latest('submitted_date')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'student_fee_id' => $note->student_fee_id,
                    'submitted_date' => $note->submitted_date->format('M d, Y'),
                    'due_date' => $note->due_date->format('M d, Y'),
                    'amount' => $note->amount !== null ? (float) $note->amount : null,
                    'reason' => $note->reason,
                    'status' => $note->status,
                    'reviewed_by' => $note->reviewer?->name,
                    'reviewed_at' => $note->reviewed_at?->format('M d, Y h:i A'),
                    'review_notes' => $note->review_notes,
                    'school_year' => $note->studentFee?->school_year,
                ];
            });

        // Get available student fees for new promissory note requests
        $studentFees = StudentFee::where('student_id', $student->id)
            ->where('balance', '>', 0)
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'school_year' => $fee->school_year,
                    'total_amount' => (float) $fee->total_amount,
                    'balance' => (float) $fee->balance,
                ];
            });

        $stats = [
            'total' => $notes->count(),
            'pending' => $notes->where('status', 'pending')->count(),
            'approved' => $notes->where('status', 'approved')->count(),
            'declined' => $notes->where('status', 'declined')->count(),
        ];

        return Inertia::render('student/promissory-notes/index', [
            'notes' => $notes,
            'studentFees' => $studentFees,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created promissory note request.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $student = $user->student;
        
        if (!$student) {
            return back()->withErrors(['error' => 'Student record not found.']);
        }

        $validated = $request->validate([
            'student_fee_id' => 'nullable|exists:student_fees,id',
            'amount' => 'nullable|numeric|min:0.01',
            'due_date' => 'required|date|after:today',
            'reason' => 'required|string|max:1000',
        ]);

        // If fee is provided, check if it belongs to this student
        $fee = null;
        if (!empty($validated['student_fee_id'])) {
            $fee = StudentFee::where('id', $validated['student_fee_id'])
                ->where('student_id', $student->id)
                ->first();

            if (!$fee) {
                return back()->withErrors(['error' => 'Invalid fee selected.']);
            }

            // Check if amount doesn't exceed balance (only if amount is provided)
            if (!empty($validated['amount']) && $validated['amount'] > $fee->balance) {
                return back()->withErrors(['amount' => 'Amount cannot exceed the remaining balance.']);
            }
        }

        // Check for existing pending promissory note for this student
        $existingQuery = PromissoryNote::where('student_id', $student->id)
            ->where('status', 'pending');
        
        if (!empty($validated['student_fee_id'])) {
            $existingQuery->where('student_fee_id', $validated['student_fee_id']);
        }
        
        if ($existingQuery->exists()) {
            return back()->withErrors(['error' => 'You already have a pending promissory note.']);
        }

        PromissoryNote::create([
            'student_id' => $student->id,
            'student_fee_id' => $validated['student_fee_id'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'submitted_date' => now(),
            'due_date' => $validated['due_date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Promissory note request submitted successfully.');
    }

    /**
     * Cancel a promissory note request.
     */
    public function cancel(PromissoryNote $note): RedirectResponse
    {
        $user = auth()->user();
        $student = $user->student;
        
        if (!$student || $note->student_id !== $student->id) {
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        if ($note->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending promissory notes can be cancelled.']);
        }

        $note->delete();

        return back()->with('success', 'Promissory note cancelled successfully.');
    }
}
