<?php

namespace App\Http\Controllers\Librarian;

use App\Http\Controllers\Controller;
use App\Models\LibraryBook;
use App\Models\LibraryTransaction;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = LibraryTransaction::with([
            'book:id,title,author,isbn',
            'student:id,first_name,last_name,lrn',
            'librarian:id,name',
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('book', fn($bq) => $bq->where('title', 'like', "%{$search}%"))
                  ->orWhereHas('student', fn($sq) => $sq->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('lrn', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('transaction_type', $request->type);
        }

        $transactions = $query->latest()->paginate(25)->withQueryString();

        $books = LibraryBook::where('available_quantity', '>', 0)
            ->orderBy('title')
            ->get(['id', 'title', 'author', 'isbn', 'available_quantity']);

        $students = Student::orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'lrn']);

        return Inertia::render('librarian/transactions/index', [
            'transactions' => $transactions,
            'books' => $books,
            'students' => $students,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'type' => $request->type,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:library_books,id',
            'student_id' => 'required|exists:students,id',
            'borrow_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:borrow_date',
            'notes' => 'nullable|string',
        ]);

        $book = LibraryBook::findOrFail($validated['book_id']);

        if ($book->available_quantity <= 0) {
            return back()->withErrors(['book_id' => 'This book is not available for borrowing.']);
        }

        // Create borrow transaction
        LibraryTransaction::create([
            'book_id' => $validated['book_id'],
            'student_id' => $validated['student_id'],
            'librarian_id' => $request->user()->id,
            'transaction_type' => 'borrow',
            'borrow_date' => $validated['borrow_date'],
            'due_date' => $validated['due_date'],
            'status' => 'borrowed',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Decrease available quantity
        $book->decrement('available_quantity');
        if ($book->available_quantity <= 0) {
            $book->update(['is_available' => false]);
        }

        return back()->with('success', 'Book borrowed successfully.');
    }

    public function update(Request $request, LibraryTransaction $transaction)
    {
        $validated = $request->validate([
            'return_date' => 'nullable|date',
            'status' => 'required|in:borrowed,returned,overdue,lost',
            'penalty_amount' => 'nullable|numeric|min:0',
            'penalty_paid' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        // If returning the book
        if ($validated['status'] === 'returned' && $transaction->status === 'borrowed') {
            $validated['return_date'] = $validated['return_date'] ?? now()->toDateString();
            $validated['transaction_type'] = 'return';

            // Increase available quantity
            $book = $transaction->book;
            $book->increment('available_quantity');
            $book->update(['is_available' => true]);
        }

        $transaction->update($validated);

        return back()->with('success', 'Transaction updated successfully.');
    }
}
