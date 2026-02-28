<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DocumentFeeItem;
use App\Models\DocumentRequest;
use App\Models\FeeCategory;
use App\Models\FeeItem;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportsController extends Controller
{
    public function index(): InertiaResponse
    {
        $currentSchoolYear = \App\Models\AppSetting::current()->school_year ?? '2024-2025';

        // Summary stats for reports page
        $totalStudents = Student::count();
        $totalRevenue = StudentPayment::sum('amount');
        $totalExpected = StudentFee::sum('total_amount');
        $totalBalance = StudentFee::sum('balance');

        // ── Pre-compute enrolled student counts for dynamic availed calculation ──
        $totalEnrolled = Student::where('enrollment_status', 'enrolled')
            ->whereNull('deleted_at')->count();

        // Count enrolled students grouped by (department_id, year_level_id)
        $enrolledByGroup = DB::table('students')
            ->whereNull('deleted_at')
            ->where('enrollment_status', 'enrolled')
            ->select(
                DB::raw('COALESCE(department_id, 0) as dept_id'),
                DB::raw('COALESCE(year_level_id, 0) as yl_id'),
                DB::raw('COUNT(*) as cnt')
            )
            ->groupBy('department_id', 'year_level_id')
            ->get()
            ->mapWithKeys(fn ($r) => ["{$r->dept_id}_{$r->yl_id}" => (int) $r->cnt]);

        // Helper: compute availed count for a fee item
        $getAvailed = function (FeeItem $item) use ($totalEnrolled, $enrolledByGroup): int {
            // If manually set in fee-management, use that value
            if ((int) $item->students_availed > 0) {
                return (int) $item->students_availed;
            }
            // Specific scope with department + year level
            if ($item->assignment_scope === 'specific' && $item->department_id && $item->year_level_id) {
                return $enrolledByGroup["{$item->department_id}_{$item->year_level_id}"] ?? 0;
            }
            // Specific scope with only department
            if ($item->assignment_scope === 'specific' && $item->department_id) {
                return $enrolledByGroup
                    ->filter(fn ($v, $k) => str_starts_with($k, "{$item->department_id}_"))
                    ->sum();
            }
            // 'all' scope or no specific constraints → all enrolled students
            return $totalEnrolled;
        };

        // Fee Income Report
        $feeReport = FeeCategory::where('is_active', true)
            ->with(['items' => fn ($q) => $q->where('is_active', true)->orderBy('name')])
            ->orderBy('sort_order')->orderBy('name')
            ->get()
            ->map(function ($cat) use ($getAvailed) {
                $items = $cat->items->map(function ($item) use ($getAvailed) {
                    $selling  = (float) $item->selling_price;
                    $profit   = $selling - (float) ($item->cost_price ?? 0);
                    $availed  = $getAvailed($item);
                    return [
                        'name'             => $item->name,
                        'selling_price'    => round($selling, 2),
                        'profit'           => round($profit, 2),
                        'students_availed' => $availed,
                        'total_revenue'    => round($selling * $availed, 2),
                        'total_income'     => round($profit * $availed, 2),
                    ];
                })->values();

                // Collected = sum of payments tagged to this category by OR lookup in student_payments
                // We use the category name as a loose match on payment_for
                $catLower   = strtolower($cat->name);
                $paymentFor = match (true) {
                    str_contains($catLower, 'registration') => 'registration',
                    str_contains($catLower, 'tuition')      => 'tuition',
                    str_contains($catLower, 'misc')         => 'misc',
                    str_contains($catLower, 'book')         => 'books',
                    default                                 => null,
                };

                $totalCollected = $paymentFor
                    ? (float) StudentPayment::where('payment_for', $paymentFor)->sum('amount')
                    : 0.0;

                return [
                    'category'        => $cat->name,
                    'items'           => $items,
                    'total_assigned'  => round($items->sum('total_revenue'), 2),
                    'total_collected' => round($totalCollected, 2),
                    'total_revenue'   => round($items->sum('total_revenue'), 2),
                    'total_income'    => round($items->sum('total_income'), 2),
                ];
            })
            ->values();

        // Document Fee Income — real data from approved DocumentRequest rows
        $documentFeeReport = DocumentFeeItem::where('is_active', true)
            ->orderBy('category')->orderBy('name')
            ->get()
            ->each(function ($item) {
                $item->actual_availed = DocumentRequest::where('document_fee_item_id', $item->id)
                    ->where('accounting_status', 'approved')->count();
                $item->actual_revenue = (float) DocumentRequest::where('document_fee_item_id', $item->id)
                    ->where('accounting_status', 'approved')->sum('fee');
            })
            ->groupBy('category')
            ->map(function ($fees, $cat) {
                $items = $fees->map(function ($fee) {
                    $price   = (float) $fee->price;
                    $availed = $fee->actual_availed;
                    $revenue = $fee->actual_revenue > 0 ? $fee->actual_revenue : round($price * $availed, 2);
                    return [
                        'name'             => $fee->name,
                        'price'            => round($price, 2),
                        'students_availed' => $availed,
                        'total_revenue'    => round($revenue, 2),
                    ];
                })->values();
                return ['category' => $cat, 'items' => $items, 'total_revenue' => round($items->sum('total_revenue'), 2)];
            })
            ->values();

        // ── Department Analysis ──────────────────────────────────────────────────
        $departmentAnalysis = Department::all()
            ->map(function ($dept) {
                $studentIds = Student::where('department_id', $dept->id)
                    ->whereNull('deleted_at')->pluck('id');
                $totalBilled    = (float) StudentFee::whereIn('student_id', $studentIds)->sum('total_amount');
                $totalCollected = (float) StudentPayment::whereIn('student_id', $studentIds)->sum('amount');
                $totalBalance   = (float) StudentFee::whereIn('student_id', $studentIds)->sum('balance');
                $collectionRate = $totalBilled > 0 ? round(($totalCollected / $totalBilled) * 100, 1) : 0;
                return [
                    'department'      => $dept->name,
                    'students'        => $studentIds->count(),
                    'billed'          => round($totalBilled, 2),
                    'collected'       => round($totalCollected, 2),
                    'balance'         => round($totalBalance, 2),
                    'collection_rate' => $collectionRate,
                ];
            })
            ->sortByDesc('collected')
            ->values();

        // ── Cashier Transaction Summary ──────────────────────────────────────────
        $cashierSummary = StudentPayment::with('recordedBy:id,name')
            ->selectRaw('recorded_by, COUNT(*) as transaction_count, SUM(amount) as total_amount,
                SUM(CASE WHEN payment_method = "cash" THEN amount ELSE 0 END) as cash_total,
                SUM(CASE WHEN payment_method = "gcash" THEN amount ELSE 0 END) as gcash_total,
                SUM(CASE WHEN payment_method = "bank" THEN amount ELSE 0 END) as bank_total')
            ->groupBy('recorded_by')
            ->orderByDesc('total_amount')
            ->get()
            ->map(fn ($p) => [
                'cashier'           => $p->recordedBy?->name ?? 'System / Unknown',
                'transaction_count' => (int) $p->transaction_count,
                'total_amount'      => round((float) $p->total_amount, 2),
                'cash_total'        => round((float) $p->cash_total, 2),
                'gcash_total'       => round((float) $p->gcash_total, 2),
                'bank_total'        => round((float) $p->bank_total, 2),
            ])
            ->values();

        // ── Recent Transactions (last 50) ────────────────────────────────────────
        $recentTransactions = StudentPayment::with([
                'student:id,first_name,last_name,middle_name,suffix',
                'recordedBy:id,name',
            ])
            ->latest('payment_date')
            ->take(50)
            ->get()
            ->map(fn ($p) => [
                'id'          => $p->id,
                'or_number'   => $p->or_number ?? 'N/A',
                'date'        => $p->payment_date->format('Y-m-d'),
                'student'     => $p->student?->full_name ?? 'Unknown',
                'amount'      => round((float) $p->amount, 2),
                'method'      => $p->payment_method ?? 'cash',
                'payment_for' => $p->payment_for ?? 'general',
                'cashier'     => $p->recordedBy?->name ?? '—',
            ]);

        // ── Monthly Trend (current year) ─────────────────────────────────────────
        $currentYear = (int) date('Y');
        $monthlyTrend = [];
        for ($m = 1; $m <= 12; $m++) {
            $start  = Carbon::create($currentYear, $m, 1)->startOfMonth();
            $end    = Carbon::create($currentYear, $m, 1)->endOfMonth();
            $amount = (float) StudentPayment::whereBetween('payment_date', [$start, $end])->sum('amount');
            $monthlyTrend[] = [
                'month'  => Carbon::create($currentYear, $m, 1)->format('M'),
                'amount' => $amount,
            ];
        }

        return Inertia::render('owner/reports', [
            'summary' => [
                'total_students'  => $totalStudents,
                'total_revenue'   => (float) $totalRevenue,
                'total_expected'  => (float) $totalExpected,
                'total_balance'   => (float) $totalBalance,
                'collection_rate' => $totalExpected > 0
                    ? round(((float) $totalRevenue / (float) $totalExpected) * 100, 1)
                    : 0,
            ],
            'school_year'        => $currentSchoolYear,
            'feeReport'          => $feeReport,
            'documentFeeReport'  => $documentFeeReport,
            'departmentAnalysis' => $departmentAnalysis,
            'cashierSummary'     => $cashierSummary,
            'recentTransactions' => $recentTransactions,
            'monthlyTrend'       => $monthlyTrend,
        ]);
    }

    public function exportFinancial(Request $request)
    {
        $format = $request->get('format', 'csv'); // csv or pdf
        $currentSchoolYear = \App\Models\AppSetting::current()->school_year ?? '2024-2025';

        $data = StudentPayment::with(['student', 'studentFee'])
            ->whereHas('studentFee', function ($query) use ($currentSchoolYear) {
                $query->where('school_year', $currentSchoolYear);
            })
            ->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'OR Number' => $payment->or_number ?? 'N/A',
                    'Date' => $payment->payment_date->format('Y-m-d'),
                    'Student' => $payment->student?->full_name ?? 'N/A',
                    'Amount' => number_format($payment->amount, 2),
                    'Payment For' => ucfirst($payment->payment_for ?? 'general'),
                    'Notes' => $payment->notes ?? '',
                ];
            });

        if ($format === 'csv') {
            $filename = 'financial_report_' . date('Y-m-d') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($data) {
                $file = fopen('php://output', 'w');
                
                // Add headers
                fputcsv($file, array_keys($data->first()));
                
                // Add data
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
                
                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        // PDF export would go here (using dompdf or similar)
        return response()->json(['message' => 'PDF export not yet implemented']);
    }

    public function exportStudents(Request $request)
    {
        $students = Student::with(['department', 'program', 'yearLevel', 'section'])
            ->get()
            ->map(function ($student) {
                return [
                    'Student ID' => $student->student_id,
                    'Name' => $student->name,
                    'Email' => $student->email ?? 'N/A',
                    'Department' => $student->department?->name ?? 'N/A',
                    'Program' => $student->program ?? 'N/A',
                    'Year Level' => $student->year_level ?? 'N/A',
                    'Section' => $student->section ?? 'N/A',
                    'Status' => ucfirst($student->status ?? 'enrolled'),
                ];
            });

        $filename = 'students_report_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($students) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, array_keys($students->first()));
            
            foreach ($students as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
