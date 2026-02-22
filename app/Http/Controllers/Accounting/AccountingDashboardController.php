<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\DocumentRequest;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AccountingDashboardController extends Controller
{
    /**
     * Display the main accounting dashboard (overview).
     */
    public function index(Request $request): Response
    {
        $selectedYear = $request->get('year', date('Y'));
        
        $stats = [
            'total_students' => Student::count(),
            'fully_paid' => StudentFee::where('balance', '<=', 0)->count(),
            'partial_payment' => StudentFee::where('total_paid', '>', 0)->where('balance', '>', 0)->count(),
            'overdue' => StudentFee::where('is_overdue', true)->count(),
            'document_payments' => DocumentRequest::where('is_paid', true)->count(),
        ];

        // Monthly collections for the selected year
        $monthlyCollections = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthStart = Carbon::create($selectedYear, $month, 1)->startOfMonth();
            $monthEnd = Carbon::create($selectedYear, $month, 1)->endOfMonth();
            
            $amount = StudentPayment::whereBetween('payment_date', [$monthStart, $monthEnd])->sum('amount');
            
            // Get average time of payment
            $avgTime = StudentPayment::whereBetween('payment_date', [$monthStart, $monthEnd])
                ->whereNotNull('created_at')
                ->avg(DB::raw('HOUR(created_at)'));
            
            $timeFormatted = $avgTime ? sprintf('%02d:%02d %s', 
                $avgTime > 12 ? $avgTime - 12 : ($avgTime == 0 ? 12 : $avgTime),
                0,
                $avgTime >= 12 ? 'PM' : 'AM'
            ) : 'N/A';

            $monthlyCollections[] = [
                'month' => $month,
                'month_name' => Carbon::create($selectedYear, $month, 1)->format('M'),
                'amount' => (float) $amount,
                'time' => $timeFormatted,
            ];
        }

        // Outstanding balance by department
        $departmentBalances = Department::select('departments.name as department')
            ->selectRaw('COUNT(DISTINCT students.id) as student_count')
            ->selectRaw('COALESCE(SUM(student_fees.balance), 0) as balance')
            ->leftJoin('students', 'departments.id', '=', 'students.department_id')
            ->leftJoin('student_fees', 'students.id', '=', 'student_fees.student_id')
            ->where(function ($q) {
                $q->whereNull('student_fees.balance')
                  ->orWhere('student_fees.balance', '>', 0);
            })
            ->groupBy('departments.id', 'departments.name')
            ->orderBy('balance', 'desc')
            ->take(6)
            ->get()
            ->map(function ($dept) {
                return [
                    'department' => $dept->department,
                    'student_count' => (int) $dept->student_count,
                    'balance' => (float) $dept->balance,
                ];
            })
            ->toArray();

        $totalOutstanding = StudentFee::where('balance', '>', 0)->sum('balance');

        // Recent payment activities
        $recentPayments = StudentPayment::with(['student'])
            ->latest('payment_date')
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'student_name' => $payment->student->full_name ?? 'Unknown',
                    'student_photo_url' => $payment->student->student_photo_url ?? null,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->payment_method ?? 'CASH',
                    'or_number' => $payment->or_number ?? 'N/A',
                    'time_ago' => Carbon::parse($payment->created_at)->diffForHumans(),
                ];
            })
            ->toArray();

        // Calculate average collection time
        $avgHour = StudentPayment::whereYear('payment_date', $selectedYear)
            ->whereNotNull('created_at')
            ->avg(DB::raw('HOUR(created_at)'));
        
        $averageCollectionTime = $avgHour ? sprintf('%d:%02d %s',
            $avgHour > 12 ? floor($avgHour - 12) : ($avgHour == 0 ? 12 : floor($avgHour)),
            ($avgHour - floor($avgHour)) * 60,
            $avgHour >= 12 ? 'PM' : 'AM'
        ) : 'N/A';

        // Available years
        $years = StudentPayment::selectRaw('YEAR(payment_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();
        
        if (empty($years)) {
            $years = [(int) date('Y')];
        }

        return Inertia::render('accounting/main-dashboard', [
            'stats' => $stats,
            'monthlyCollections' => $monthlyCollections,
            'departmentBalances' => $departmentBalances,
            'recentPayments' => $recentPayments,
            'totalOutstanding' => (float) $totalOutstanding,
            'averageCollectionTime' => $averageCollectionTime,
            'years' => $years,
            'selectedYear' => (int) $selectedYear,
            'projectedRevenue' => (float) StudentFee::sum('total_amount'),
            'totalCollected' => (float) StudentPayment::sum('amount'),
        ]);
    }

    /**
     * Display the simplified main dashboard.
     */
    public function mainDashboard(Request $request): Response
    {
        $selectedMonth  = (int) $request->get('month', date('n'));
        $selectedYear   = (int) $request->get('year', date('Y'));

        // Demographic filters
        $classification = $request->get('classification');
        $departmentId   = $request->get('department_id');
        $program        = $request->get('program');
        $yearLevel      = $request->get('year_level');
        $section        = $request->get('section');

        // Build scoped student IDs
        $studentQ = Student::select('id');
        if ($classification) {
            $studentQ->whereHas('department', fn($q) => $q->where('classification', $classification));
        }
        if ($departmentId) $studentQ->where('department_id', $departmentId);
        if ($program)      $studentQ->where('program', $program);
        if ($yearLevel)    $studentQ->where('year_level', $yearLevel);
        if ($section)      $studentQ->where('section', $section);
        $filteredIds = $studentQ->pluck('id');

        // Get stats scoped to filtered students
        $totalStudents       = $filteredIds->count();
        $fullyPaid           = StudentFee::whereIn('student_id', $filteredIds)->where('balance', '<=', 0)->count();
        $partialPaid         = StudentFee::whereIn('student_id', $filteredIds)->where('total_paid', '>', 0)->where('balance', '>', 0)->count();
        $unpaid              = StudentFee::whereIn('student_id', $filteredIds)->where('total_paid', 0)->where('balance', '>', 0)->count();
        $totalCollectibles   = StudentFee::whereIn('student_id', $filteredIds)->where('balance', '>', 0)->sum('balance');
        $totalCollectedToday = StudentPayment::whereIn('student_id', $filteredIds)->whereDate('payment_date', today())->sum('amount');

        $stats = [
            'total_students' => $totalStudents,
            'fully_paid' => $fullyPaid,
            'partial_paid' => $partialPaid,
            'unpaid' => $unpaid,
            'total_collectibles' => (string) $totalCollectibles,
            'total_collected_today' => (string) $totalCollectedToday,
        ];

        // Recent payments with student and recorded_by info
        $recentPayments = StudentPayment::with(['student', 'recordedBy'])
            ->whereIn('student_id', $filteredIds)
            ->latest('payment_date')
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date->format('Y-m-d'),
                    'or_number' => $payment->or_number,
                    'amount' => (string) $payment->amount,
                    'student' => [
                        'first_name' => $payment->student->first_name,
                        'last_name' => $payment->student->last_name,
                        'lrn' => $payment->student->lrn,
                    ],
                    'recorded_by' => $payment->recordedBy ? [
                        'name' => $payment->recordedBy->name,
                    ] : null,
                ];
            })
            ->toArray();

        // Top pending payments
        $pendingPayments = StudentFee::with(['student'])
            ->whereIn('student_id', $filteredIds)
            ->where('balance', '>', 0)
            ->orderBy('balance', 'desc')
            ->take(10)
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'balance' => (string) $fee->balance,
                    'total_amount' => (string) $fee->total_amount,
                    'student' => [
                        'first_name' => $fee->student->first_name,
                        'last_name' => $fee->student->last_name,
                        'lrn' => $fee->student->lrn,
                        'program' => $fee->student->program ?? 'N/A',
                        'year_level' => $fee->student->year_level ?? 'N/A',
                    ],
                ];
            })
            ->toArray();

        // Daily income for the selected month
        $monthStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
        $monthEnd = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth();
        $daysInMonth = $monthEnd->day;

        $dailyIncome = [];
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($selectedYear, $selectedMonth, $day);
            $dayPayments = StudentPayment::whereIn('student_id', $filteredIds)->whereDate('payment_date', $date)->get();
            $total = $dayPayments->sum('amount');

            $avgHour = null;
            if ($dayPayments->count() > 0) {
                $avgHour = $dayPayments->avg(function ($p) {
                    return Carbon::parse($p->created_at)->hour + Carbon::parse($p->created_at)->minute / 60;
                });
            }

            $timeFormatted = $avgHour !== null
                ? sprintf('%d:%02d %s',
                    $avgHour > 12 ? floor($avgHour - 12) : ($avgHour < 1 ? 12 : floor($avgHour)),
                    round(($avgHour - floor($avgHour)) * 60),
                    $avgHour >= 12 ? 'PM' : 'AM'
                )
                : null;

            $dailyIncome[] = [
                'day' => $day,
                'date' => $date->format('Y-m-d'),
                'day_label' => $date->format('D, M j'),
                'total' => (float) $total,
                'count' => $dayPayments->count(),
                'avg_time' => $timeFormatted,
            ];
        }

        // Months for dropdown
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'value' => $m,
                'label' => Carbon::create(null, $m)->format('F'),
            ];
        }

        $years = StudentPayment::selectRaw('YEAR(payment_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        if (empty($years)) {
            $years = [(int) date('Y')];
        }

        // Filter options
        $departments = Department::orderBy('name')->get()->map(fn($d) => ['value' => (string) $d->id, 'label' => $d->name]);
        $programs    = Student::whereNotNull('program')->where('program', '!=', '')->distinct()->orderBy('program')->pluck('program')->map(fn($v) => ['value' => $v, 'label' => $v]);
        $yearLevels  = Student::whereNotNull('year_level')->where('year_level', '!=', '')->distinct()->orderBy('year_level')->pluck('year_level')->map(fn($v) => ['value' => $v, 'label' => $v]);
        $sections    = Student::whereNotNull('section')->where('section', '!=', '')->distinct()->orderBy('section')->pluck('section')->map(fn($v) => ['value' => $v, 'label' => $v]);

        return Inertia::render('accounting/dashboard', [
            'stats'           => $stats,
            'recentPayments'  => $recentPayments,
            'pendingPayments' => $pendingPayments,
            'dailyIncome'     => $dailyIncome,
            'selectedMonth'   => $selectedMonth,
            'selectedYear'    => $selectedYear,
            'months'          => $months,
            'years'           => $years,
            'departments'     => $departments,
            'programs'        => $programs,
            'yearLevels'      => $yearLevels,
            'sections'        => $sections,
            'filters'         => [
                'classification' => $classification,
                'department_id'  => $departmentId,
                'program'        => $program,
                'year_level'     => $yearLevel,
                'section'        => $section,
            ],
        ]);
    }

    /**
     * Display the account dashboard (aggregate stats with demographic + date filters).
     */
    public function accountDashboard(Request $request): Response
    {
        // Demographic filters
        $classification = $request->get('classification');
        $departmentId   = $request->get('department_id');
        $program        = $request->get('program');
        $yearLevel      = $request->get('year_level');
        $section        = $request->get('section');

        // Date range (fallback to current month)
        $dateFrom      = $request->get('date_from');
        $dateTo        = $request->get('date_to');
        $selectedMonth = (int) $request->get('month', date('n'));
        $selectedYear  = (int) $request->get('year', date('Y'));

        if ($dateFrom && $dateTo) {
            $periodStart = Carbon::parse($dateFrom)->startOfDay();
            $periodEnd   = Carbon::parse($dateTo)->endOfDay();
        } else {
            $periodStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
            $periodEnd   = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth();
        }

        // Get all students for the dropdown
        $students = Student::select('id', 'first_name', 'last_name', 'lrn', 'student_photo_url')
            ->orderBy('last_name')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'full_name' => $s->full_name,
                    'lrn' => $s->lrn,
                    'student_photo_url' => $s->student_photo_url,
                ];
            });

        // Build scoped student IDs
        $studentQ = Student::select('id');
        if ($classification) {
            $studentQ->whereHas('department', fn($q) => $q->where('classification', $classification));
        }
        if ($departmentId) $studentQ->where('department_id', $departmentId);
        if ($program)      $studentQ->where('program', $program);
        if ($yearLevel)    $studentQ->where('year_level', $yearLevel);
        if ($section)      $studentQ->where('section', $section);
        $studentIds = $studentQ->pluck('id');

        $transactions = [];
        $dailyCollections = [];

        $payments  = StudentPayment::whereIn('student_id', $studentIds)
            ->whereBetween('payment_date', [$periodStart, $periodEnd])
            ->get();
        $documents = DocumentRequest::whereIn('student_id', $studentIds)
            ->where('is_paid', true)
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->get();

        $feeCount    = $payments->count();
        $docCount    = $documents->count();
        $feeSum      = (float) $payments->sum('amount');
        $docSum      = (float) $documents->sum('fee');
        $overallPaid = (float) StudentPayment::whereIn('student_id', $studentIds)->sum('amount');
        $feesBilled  = (float) StudentFee::whereIn('student_id', $studentIds)->sum('total_amount');
        $rate        = $feesBilled > 0
            ? min(round(($overallPaid / $feesBilled) * 100, 1), 100)
            : ($overallPaid > 0 ? 100 : 0);

        $stats = [
            'total_transactions'       => $feeCount + $docCount,
            'fee_transactions'         => $feeCount,
            'document_transactions'    => $docCount,
            'collection_rate'          => $rate,
            'total_fees_processed'     => $feeSum,
            'total_document_processed' => $docSum,
            'total_amount_processed'   => $feeSum + $docSum,
            'overall_amount_processed' => $overallPaid,
        ];

        $paymentSummary = [
            'cash'  => (float) $payments->where('payment_method', 'CASH')->sum('amount'),
            'gcash' => (float) $payments->where('payment_method', 'GCASH')->sum('amount'),
            'bank'  => (float) $payments->where('payment_method', 'BANK')->sum('amount'),
        ];

        // Daily collections across the period
        $periodDay    = $periodStart->copy()->startOfDay();
        $periodEndDay = $periodEnd->copy()->startOfDay();
        while ($periodDay->lte($periodEndDay)) {
            $dayPayments = $payments->filter(fn($p) => Carbon::parse($p->payment_date)->isSameDay($periodDay));
            $dayAmount   = (float) $dayPayments->sum('amount');
            if ($dayAmount > 0) {
                $avgHour = $dayPayments->avg(fn($p) => Carbon::parse($p->created_at)->hour);
                $avgTime = $avgHour !== null
                    ? sprintf('%d:%02d %s',
                        $avgHour > 12 ? floor($avgHour - 12) : ($avgHour == 0 ? 12 : floor($avgHour)),
                        0,
                        $avgHour >= 12 ? 'PM' : 'AM'
                    ) : 'N/A';
                $dailyCollections[] = [
                    'day'    => $periodDay->day,
                    'date'   => $periodDay->format('Y-m-d'),
                    'amount' => $dayAmount,
                    'time'   => $avgTime,
                ];
            }
            $periodDay->addDay();
        }

        // Recent transactions (top 25 payments + top 10 documents)
        foreach ($payments->sortByDesc('payment_date')->take(25) as $p) {
            $transactions[] = [
                'id'        => $p->id,
                'date'      => Carbon::parse($p->payment_date)->format('Y-m-d'),
                'time'      => Carbon::parse($p->created_at)->format('h:i A'),
                'type'      => 'Fee',
                'or_number' => $p->or_number ?? 'N/A',
                'mode'      => $p->payment_method ?? 'CASH',
                'reference' => $p->reference_number,
                'amount'    => (float) $p->amount,
            ];
        }
        foreach ($documents->take(10) as $doc) {
            $transactions[] = [
                'id'        => 'doc-' . $doc->id,
                'date'      => Carbon::parse($doc->created_at)->format('Y-m-d'),
                'time'      => Carbon::parse($doc->created_at)->format('h:i A'),
                'type'      => 'Document',
                'or_number' => 'DOC' . str_pad($doc->id, 3, '0', STR_PAD_LEFT),
                'mode'      => 'CASH',
                'reference' => $doc->document_type,
                'amount'    => (float) $doc->fee,
            ];
        }
        usort($transactions, fn($a, $b) => strcmp($b['date'] . $b['time'], $a['date'] . $a['time']));

        // Filter options
        $departments = Department::orderBy('name')->get()->map(fn($d) => ['value' => (string) $d->id, 'label' => $d->name]);
        $programs    = Student::whereNotNull('program')->where('program', '!=', '')->distinct()->orderBy('program')->pluck('program')->map(fn($v) => ['value' => $v, 'label' => $v]);
        $yearLevels  = Student::whereNotNull('year_level')->where('year_level', '!=', '')->distinct()->orderBy('year_level')->pluck('year_level')->map(fn($v) => ['value' => $v, 'label' => $v]);
        $sections    = Student::whereNotNull('section')->where('section', '!=', '')->distinct()->orderBy('section')->pluck('section')->map(fn($v) => ['value' => $v, 'label' => $v]);

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = ['value' => $m, 'label' => Carbon::create(null, $m, 1)->format('F')];
        }
        $years = StudentPayment::selectRaw('YEAR(payment_date) as year')->distinct()->orderBy('year', 'desc')->pluck('year')->toArray();
        if (empty($years)) $years = [(int) date('Y')];

        return Inertia::render('accounting/account-dashboard', [
            'stats'            => $stats,
            'transactions'     => array_values($transactions),
            'dailyCollections' => $dailyCollections,
            'paymentSummary'   => $paymentSummary,
            'departments'      => $departments,
            'programs'         => $programs,
            'yearLevels'       => $yearLevels,
            'sections'         => $sections,
            'selectedMonth'    => $selectedMonth,
            'selectedYear'     => $selectedYear,
            'months'           => $months,
            'years'            => array_values($years),
            'filters'          => [
                'classification' => $classification,
                'department_id'  => $departmentId,
                'program'        => $program,
                'year_level'     => $yearLevel,
                'section'        => $section,
                'date_from'      => $dateFrom,
                'date_to'        => $dateTo,
                'month'          => $selectedMonth,
                'year'           => $selectedYear,
            ],
        ]);
    }

    /**
     * Export dashboard data.
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'excel');
        
        // Placeholder for export functionality
        return response()->json([
            'message' => 'Export functionality - implement with Laravel Excel package',
            'type' => $type,
        ]);
    }

    /**
     * Export account dashboard data.
     */
    public function exportAccountDashboard(Request $request)
    {
        $type = $request->input('type', 'excel');
        
        // Placeholder for export functionality
        return response()->json([
            'message' => 'Export functionality - implement with Laravel Excel package',
            'type' => $type,
        ]);
    }
}
