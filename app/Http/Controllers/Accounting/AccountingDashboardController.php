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
        ]);
    }

    /**
     * Display the simplified main dashboard.
     */
    public function mainDashboard(): Response
    {
        // Get stats
        $totalStudents = Student::count();
        $fullyPaid = StudentFee::where('balance', '<=', 0)->count();
        $partialPaid = StudentFee::where('total_paid', '>', 0)->where('balance', '>', 0)->count();
        $unpaid = StudentFee::where('total_paid', 0)->where('balance', '>', 0)->count();
        $totalCollectibles = StudentFee::where('balance', '>', 0)->sum('balance');
        $totalCollectedToday = StudentPayment::whereDate('payment_date', today())->sum('amount');

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

        return Inertia::render('accounting/dashboard', [
            'stats' => $stats,
            'recentPayments' => $recentPayments,
            'pendingPayments' => $pendingPayments,
        ]);
    }

    /**
     * Display the account dashboard (per-student detail view).
     */
    public function accountDashboard(Request $request): Response
    {
        $selectedMonth = $request->get('month', date('m'));
        $selectedYear = $request->get('year', date('Y'));
        $studentId = $request->get('student_id');

        // Get all students for the dropdown
        $students = Student::select('id', 'first_name', 'last_name', 'lrn')
            ->orderBy('last_name')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'full_name' => $s->full_name,
                    'lrn' => $s->lrn,
                ];
            });

        $student = null;
        $transactions = [];
        $dailyCollections = [];
        $paymentSummary = ['cash' => 0, 'gcash' => 0, 'bank' => 0];
        $stats = [
            'total_fees_processed' => 0,
            'total_document_processed' => 0,
            'total_amount_processed' => 0,
            'overall_amount_processed' => 0,
        ];

        if ($studentId) {
            $student = Student::with(['department', 'program', 'yearLevel', 'section'])
                ->find($studentId);

            if ($student) {
                $monthStart = Carbon::create($selectedYear, $selectedMonth, 1)->startOfMonth();
                $monthEnd = Carbon::create($selectedYear, $selectedMonth, 1)->endOfMonth();

                // Get payments for this student in selected period
                $payments = StudentPayment::where('student_id', $studentId)
                    ->whereBetween('payment_date', [$monthStart, $monthEnd])
                    ->orderBy('payment_date', 'desc')
                    ->get();

                // Get document requests for this student in selected period
                $documents = DocumentRequest::where('student_id', $studentId)
                    ->where('is_paid', true)
                    ->whereBetween('created_at', [$monthStart, $monthEnd])
                    ->get();

                // Build transactions list
                foreach ($payments as $payment) {
                    $transactions[] = [
                        'id' => $payment->id,
                        'date' => Carbon::parse($payment->payment_date)->format('Y-m-d'),
                        'time' => Carbon::parse($payment->created_at)->format('h:i A'),
                        'type' => 'Fee',
                        'or_number' => $payment->or_number ?? 'N/A',
                        'mode' => $payment->payment_method ?? 'CASH',
                        'reference' => $payment->reference_number,
                        'amount' => (float) $payment->amount,
                    ];
                }

                foreach ($documents as $doc) {
                    $transactions[] = [
                        'id' => 'doc-' . $doc->id,
                        'date' => Carbon::parse($doc->created_at)->format('Y-m-d'),
                        'time' => Carbon::parse($doc->created_at)->format('h:i A'),
                        'type' => 'Document',
                        'or_number' => 'DOC' . str_pad($doc->id, 3, '0', STR_PAD_LEFT),
                        'mode' => 'CASH',
                        'reference' => $doc->document_type,
                        'amount' => (float) $doc->fee,
                    ];
                }

                // Sort by date descending
                usort($transactions, function ($a, $b) {
                    return strcmp($b['date'] . $b['time'], $a['date'] . $a['time']);
                });

                // Stats
                $totalFees = $payments->sum('amount');
                $totalDocs = $documents->sum('fee');
                
                $stats = [
                    'total_fees_processed' => (float) $totalFees,
                    'total_document_processed' => (float) $totalDocs,
                    'total_amount_processed' => (float) ($totalFees + $totalDocs),
                    'overall_amount_processed' => (float) StudentPayment::where('student_id', $studentId)->sum('amount'),
                ];

                // Payment summary by mode
                $paymentSummary = [
                    'cash' => (float) $payments->where('payment_method', 'CASH')->sum('amount'),
                    'gcash' => (float) $payments->where('payment_method', 'GCASH')->sum('amount'),
                    'bank' => (float) $payments->where('payment_method', 'BANK')->sum('amount'),
                ];

                // Daily collections for the month
                $daysInMonth = $monthEnd->day;
                for ($day = 1; $day <= $daysInMonth; $day++) {
                    $dayDate = Carbon::create($selectedYear, $selectedMonth, $day);
                    $dayPayments = $payments->filter(function ($p) use ($dayDate) {
                        return Carbon::parse($p->payment_date)->isSameDay($dayDate);
                    });
                    
                    $dayAmount = $dayPayments->sum('amount');
                    $avgTime = 'N/A';
                    
                    if ($dayPayments->count() > 0) {
                        $avgHour = $dayPayments->avg(function ($p) {
                            return Carbon::parse($p->created_at)->hour;
                        });
                        $avgTime = sprintf('%d:%02d %s',
                            $avgHour > 12 ? floor($avgHour - 12) : ($avgHour == 0 ? 12 : floor($avgHour)),
                            0,
                            $avgHour >= 12 ? 'PM' : 'AM'
                        );
                    }

                    // Only include days with payments for cleaner chart
                    if ($dayAmount > 0) {
                        $dailyCollections[] = [
                            'day' => $day,
                            'date' => $dayDate->format('Y-m-d'),
                            'amount' => (float) $dayAmount,
                            'time' => $avgTime,
                        ];
                    }
                }

                // Map student data
                $student = [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'lrn' => $student->lrn,
                    'program' => $student->program?->name,
                    'year_level' => $student->yearLevel?->name,
                    'section' => $student->section?->name,
                    'gender' => $student->gender,
                    'phone' => $student->phone,
                    'address' => $student->address,
                    'student_id' => $student->lrn,
                ];
            }
        }

        // Months dropdown
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'value' => $m,
                'label' => Carbon::create(null, $m, 1)->format('F'),
            ];
        }

        // Available years
        $years = StudentPayment::selectRaw('YEAR(payment_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();
        
        if (empty($years)) {
            $years = [(int) date('Y')];
        }

        return Inertia::render('accounting/account-dashboard', [
            'student' => $student,
            'stats' => $stats,
            'transactions' => $transactions,
            'dailyCollections' => $dailyCollections,
            'paymentSummary' => $paymentSummary,
            'students' => $students,
            'selectedMonth' => (int) $selectedMonth,
            'selectedYear' => (int) $selectedYear,
            'months' => $months,
            'years' => $years,
            'filters' => [
                'student_id' => $studentId,
                'month' => (int) $selectedMonth,
                'year' => (int) $selectedYear,
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
