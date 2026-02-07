<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountingDashboardController extends Controller
{
    /**
     * Display the accounting dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'total_students' => Student::count(),
            'fully_paid' => StudentFee::whereColumn('balance', '<=', 0)->count(),
            'partial_paid' => StudentFee::where('total_paid', '>', 0)->whereColumn('balance', '>', 0)->count(),
            'unpaid' => StudentFee::where('total_paid', 0)->count(),
            'total_collectibles' => StudentFee::sum('balance'),
            'total_collected_today' => StudentPayment::whereDate('payment_date', today())->sum('amount'),
        ];

        // Recent payments
        $recentPayments = StudentPayment::with(['student', 'recordedBy'])
            ->latest('payment_date')
            ->latest('created_at')
            ->take(10)
            ->get();

        // Students with pending payments
        $pendingPayments = StudentFee::with('student')
            ->where('balance', '>', 0)
            ->orderBy('balance', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('accounting/dashboard', [
            'stats' => $stats,
            'recentPayments' => $recentPayments,
            'pendingPayments' => $pendingPayments,
        ]);
    }
}
