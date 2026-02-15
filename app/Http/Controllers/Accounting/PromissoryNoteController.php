<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\PromissoryNote;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PromissoryNoteController extends Controller
{
    /**
     * Display a listing of promissory notes.
     */
    public function index(Request $request): Response
    {
        $status = $request->get('status', 'all');
        
        $query = PromissoryNote::with(['student', 'studentFee', 'reviewer'])
            ->latest('submitted_date');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $notes = $query->paginate(15)->through(function ($note) {
            return [
                'id' => $note->id,
                'student_name' => $note->student->full_name ?? 'Unknown',
                'student_id' => $note->student_id,
                'submitted_date' => $note->submitted_date->format('Y-m-d'),
                'due_date' => $note->due_date->format('Y-m-d'),
                'amount' => (float) $note->amount,
                'reason' => $note->reason,
                'status' => $note->status,
                'reviewed_by' => $note->reviewer?->name,
                'reviewed_at' => $note->reviewed_at?->format('Y-m-d H:i'),
                'review_notes' => $note->review_notes,
                'school_year' => $note->studentFee?->school_year,
            ];
        });

        $stats = [
            'pending' => PromissoryNote::pending()->count(),
            'approved' => PromissoryNote::approved()->count(),
            'total' => PromissoryNote::count(),
        ];

        return Inertia::render('accounting/promissory-notes/index', [
            'notes' => $notes,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * Approve a promissory note.
     */
    public function approve(Request $request, PromissoryNote $note): RedirectResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $note->approve(auth()->id(), $request->notes);

        return back()->with('success', 'Promissory note approved successfully.');
    }

    /**
     * Decline a promissory note.
     */
    public function decline(Request $request, PromissoryNote $note): RedirectResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $note->decline(auth()->id(), $request->notes);

        return back()->with('success', 'Promissory note declined.');
    }
}
