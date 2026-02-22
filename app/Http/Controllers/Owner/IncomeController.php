<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use App\Models\DocumentRequest;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    /**
     * Today's Income — payments received today.
     */
    public function today(): Response
    {
        $today      = Carbon::today();
        $yesterday  = Carbon::yesterday();

        // Today's collections
        $todayPayments = StudentPayment::whereDate('payment_date', $today)->get();
        $todayDocs     = DocumentRequest::where('is_paid', true)->whereDate('updated_at', $today)->get();

        $todayFees = (float) $todayPayments->sum('amount');
        $todayDoc  = (float) $todayDocs->sum('fee');
        $todayTotal = $todayFees + $todayDoc;

        // Yesterday's total for comparison
        $yesterdayTotal = (float) StudentPayment::whereDate('payment_date', $yesterday)->sum('amount')
                        + (float) DocumentRequest::where('is_paid', true)->whereDate('updated_at', $yesterday)->sum('fee');

        // Target = average daily collection over last 30 days (or 0 if no data)
        $thirtyDaysAgo = Carbon::today()->subDays(30);
        $last30Sum = (float) StudentPayment::whereBetween('payment_date', [$thirtyDaysAgo, $today])->sum('amount');
        $dailyTarget = $last30Sum > 0 ? round($last30Sum / 30, 2) : 1;

        $achievement = $dailyTarget > 0 ? ($todayTotal / $dailyTarget) * 100 : ($todayTotal > 0 ? 100 : 0);

        // Hourly breakdown for today
        $hourlyData = [];
        for ($h = 6; $h <= 22; $h++) {
            $start   = $today->copy()->setHour($h)->startOfHour();
            $end     = $today->copy()->setHour($h)->endOfHour();
            $amount  = (float) StudentPayment::whereBetween('created_at', [$start, $end])->sum('amount');
            $hourlyData[] = [
                'hour'   => $h,
                'label'  => sprintf('%02d:00 %s', $h > 12 ? $h - 12 : ($h === 0 ? 12 : $h), $h >= 12 ? 'PM' : 'AM'),
                'amount' => $amount,
                'count'  => (int) StudentPayment::whereBetween('created_at', [$start, $end])->count(),
            ];
        }

        // Payment method breakdown
        $byMethod = [
            'cash'  => (float) $todayPayments->where('payment_method', 'CASH')->sum('amount'),
            'gcash' => (float) $todayPayments->where('payment_method', 'GCASH')->sum('amount'),
            'bank'  => (float) $todayPayments->where('payment_method', 'BANK')->sum('amount'),
        ];

        // Recent transactions today
        $recent = StudentPayment::with('student:id,first_name,last_name,middle_name,suffix')
            ->whereDate('payment_date', $today)
            ->orderByDesc('created_at')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'id'           => $p->id,
                'student_name' => $p->student?->full_name ?? 'Unknown',
                'amount'       => (float) $p->amount,
                'method'       => $p->payment_method ?? 'CASH',
                'or_number'    => $p->or_number ?? 'N/A',
                'time'         => Carbon::parse($p->created_at)->format('h:i A'),
            ]);

        return Inertia::render('owner/income/today', [
            'income' => [
                'title'       => "Today's Income",
                'amount'      => $todayTotal,
                'target'      => $dailyTarget,
                'achievement' => round($achievement, 2),
                'period'      => $today->format('l, F j, Y'),
                'variant'     => 'today',
            ],
            'fees'        => $todayFees,
            'documents'   => $todayDoc,
            'yesterday'   => $yesterdayTotal,
            'byMethod'    => $byMethod,
            'hourlyData'  => $hourlyData,
            'recent'      => $recent,
            'count'       => $todayPayments->count() + $todayDocs->count(),
        ]);
    }

    /**
     * Overall Income — all-time / current school year totals.
     */
    public function overall(): Response
    {
        $currentYear = date('Y');

        $totalCollected = (float) StudentPayment::sum('amount');
        $totalDocFees   = (float) DocumentRequest::where('is_paid', true)->sum('fee');
        $grandTotal     = $totalCollected + $totalDocFees;

        $totalBilled    = (float) StudentFee::sum('total_amount');
        $totalBalance   = (float) StudentFee::where('balance', '>', 0)->sum('balance');

        $achievement = $totalBilled > 0 ? ($grandTotal / $totalBilled) * 100 : ($grandTotal > 0 ? 100 : 0);

        // Monthly breakdown for current year
        $monthlyData = [];
        for ($m = 1; $m <= 12; $m++) {
            $start   = Carbon::create($currentYear, $m, 1)->startOfMonth();
            $end     = Carbon::create($currentYear, $m, 1)->endOfMonth();
            $amount  = (float) StudentPayment::whereBetween('payment_date', [$start, $end])->sum('amount');
            $monthlyData[] = [
                'month'  => Carbon::create($currentYear, $m, 1)->format('M'),
                'amount' => $amount,
            ];
        }

        // Top paying students
        $topStudents = StudentPayment::with('student:id,first_name,last_name,middle_name,suffix')
            ->selectRaw('student_id, SUM(amount) as total')
            ->groupBy('student_id')
            ->orderByDesc('total')
            ->take(10)
            ->get()
            ->map(fn($p) => [
                'student_name' => $p->student?->full_name ?? 'Unknown',
                'total'        => (float) $p->total,
            ]);

        return Inertia::render('owner/income/overall', [
            'income' => [
                'title'       => 'Overall Income',
                'amount'      => $grandTotal,
                'target'      => $totalBilled,
                'achievement' => round($achievement, 2),
                'period'      => 'All Time',
                'variant'     => 'overall',
            ],
            'totalCollected'  => $totalCollected,
            'totalDocFees'    => $totalDocFees,
            'totalBilled'     => $totalBilled,
            'totalBalance'    => $totalBalance,
            'monthlyData'     => $monthlyData,
            'topStudents'     => $topStudents,
            'fullyPaidCount'  => (int) StudentFee::where('balance', '<=', 0)->count(),
            'partialCount'    => (int) StudentFee::where('total_paid', '>', 0)->where('balance', '>', 0)->count(),
            'unpaidCount'     => (int) StudentFee::where('total_paid', 0)->where('balance', '>', 0)->count(),
            'year'            => (int) $currentYear,
        ]);
    }

    /**
     * Expected Income — projected total based on outstanding balances + fees.
     */
    public function expected(): Response
    {
        $totalBilled    = (float) StudentFee::sum('total_amount');
        $totalCollected = (float) StudentPayment::sum('amount');
        $totalBalance   = (float) StudentFee::where('balance', '>', 0)->sum('balance');
        $totalDocExpected = (float) DocumentRequest::where('is_paid', false)->sum('fee');

        $expectedTotal  = $totalBilled; // Full fees if everyone pays
        $achievement    = $expectedTotal > 0 ? ($totalCollected / $expectedTotal) * 100 : 0;
        $projected      = $expectedTotal > 0 ? (($totalCollected + $totalBalance) / $expectedTotal) * 100 : 0;

        // Monthly projection based on trend
        $last3Months = [];
        for ($i = 2; $i >= 0; $i--) {
            $date   = Carbon::now()->subMonths($i);
            $amount = (float) StudentPayment::whereYear('payment_date', $date->year)
                ->whereMonth('payment_date', $date->month)->sum('amount');
            $last3Months[] = ['month' => $date->format('M Y'), 'amount' => $amount];
        }
        $avgMonthly      = count($last3Months) > 0 ? array_sum(array_column($last3Months, 'amount')) / count($last3Months) : 0;
        $monthsToFull    = $avgMonthly > 0 ? ceil($totalBalance / $avgMonthly) : null;

        // Balance breakdown by department
        $byDepartment = StudentFee::with('student.department')
            ->where('balance', '>', 0)
            ->get()
            ->groupBy(fn($f) => $f->student?->department?->name ?? 'Unknown')
            ->map(fn($group, $dept) => [
                'department' => $dept,
                'count'      => $group->count(),
                'balance'    => (float) $group->sum('balance'),
            ])
            ->sortByDesc('balance')
            ->take(8)
            ->values();

        return Inertia::render('owner/income/expected', [
            'income' => [
                'title'       => 'Expected Income',
                'amount'      => $totalBilled,
                'target'      => $totalBilled,
                'achievement' => round($achievement, 2),
                'period'      => 'Projected Collection',
                'variant'     => 'expected',
                'projected'   => round($projected, 2),
            ],
            'totalBilled'        => $totalBilled,
            'totalCollected'     => $totalCollected,
            'totalBalance'       => $totalBalance,
            'totalDocExpected'   => $totalDocExpected,
            'avgMonthlyIncome'   => round($avgMonthly, 2),
            'monthsToFullPay'    => $monthsToFull,
            'last3Months'        => $last3Months,
            'byDepartment'       => $byDepartment,
            'studentCount'       => (int) StudentFee::where('balance', '>', 0)->count(),
        ]);
    }
}
