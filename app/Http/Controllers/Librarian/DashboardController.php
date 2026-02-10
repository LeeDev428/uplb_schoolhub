<?php

namespace App\Http\Controllers\Librarian;

use App\Http\Controllers\Controller;
use App\Models\LibraryBook;
use App\Models\LibraryTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $stats = [
            'totalBooks' => LibraryBook::count(),
            'availableBooks' => LibraryBook::where('available_quantity', '>', 0)->count(),
            'activeBorrows' => LibraryTransaction::where('status', 'borrowed')->count(),
            'overdueBooks' => LibraryTransaction::where('status', 'overdue')->count(),
        ];

        $recentTransactions = LibraryTransaction::with([
            'book:id,title,author',
            'student:id,first_name,last_name,lrn',
        ])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('librarian/dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
