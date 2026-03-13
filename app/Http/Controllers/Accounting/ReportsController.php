<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DocumentFeeItem;
use App\Models\DocumentRequest;
use App\Models\FeeCategory;
use App\Models\FeeItem;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\StudentPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    /**
     * Display reports dashboard.
     */
    public function index(Request $request): Response
    {
        // Get filters
        $from = $request->input('from');
        $to = $request->input('to');
        $schoolYear = $request->input('school_year');
        $status = $request->input('status');

        // Payment Collection Summary (grouped by date)
        $paymentQuery = StudentPayment::query();
        
        if ($from) {
            $paymentQuery->whereDate('payment_date', '>=', $from);
        }
        if ($to) {
            $paymentQuery->whereDate('payment_date', '<=', $to);
        }
        if ($schoolYear) {
            $paymentQuery->whereHas('studentFee', fn($q) => $q->where('school_year', $schoolYear));
        }
        if ($departmentId = $request->input('department_id')) {
            $paymentQuery->whereHas('student', fn($q) => $q->where('department_id', $departmentId));
        }
        if ($classification = $request->input('classification')) {
            $paymentQuery->whereHas('student.department', fn($q) => $q->where('classification', $classification));
        }

        $paymentSummary = (clone $paymentQuery)
            ->select(
                DB::raw('DATE(payment_date) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(amount) as total_amount')
            )
            ->groupBy(DB::raw('DATE(payment_date)'))
            ->orderByRaw('DATE(payment_date) DESC')
            ->get();

        // Student Balance Report
        $balanceQuery = StudentFee::with('student.department');

        if ($schoolYear) {
            $balanceQuery->where('school_year', $schoolYear);
        }

        // Filter by department
        if ($departmentId = $request->input('department_id')) {
            $balanceQuery->whereHas('student', function ($q) use ($departmentId) {
                $q->where('department_id', $departmentId);
            });
        }

        // Filter by classification
        if ($classification = $request->input('classification')) {
            $balanceQuery->whereHas('student.department', function ($q) use ($classification) {
                $q->where('classification', $classification);
            });
        }

        $balanceRows = $balanceQuery
            ->whereHas('student')
            ->orderBy('balance', 'desc')
            ->get();

        $mappedBalanceReport = $balanceRows->map(function ($fee) {
                /** @var \App\Models\StudentFee $fee */
                $freshPaid = (float) $fee->payments()->sum('amount');
                $freshBalance = max(0, (float) $fee->total_amount - (float) $fee->grant_discount - $freshPaid);
                $paymentStatus = $this->resolvePaymentStatus((float) $fee->total_amount, $freshPaid, $freshBalance);
                return [
                    'student' => [
                        'id' => $fee->student->id,
                        'lrn' => $fee->student->lrn,
                        'full_name' => $fee->student->full_name,
                        'first_name' => $fee->student->first_name,
                        'last_name' => $fee->student->last_name,
                        'student_photo_url' => $fee->student->student_photo_url,
                        'program' => $fee->student->program,
                        'year_level' => $fee->student->year_level,
                    ],
                    'school_year' => $fee->school_year,
                    'total_amount' => $fee->total_amount,
                    'total_paid' => $freshPaid,
                    'balance' => $freshBalance,
                    'payment_status' => $paymentStatus,
                ];
            });

        $balanceReport = $mappedBalanceReport;
        if ($status) {
            $balanceReport = $mappedBalanceReport->filter(fn($row) => $row['payment_status'] === $status)->values();
        }

        // Summary Statistics
        $summarySource = $mappedBalanceReport;
        $fullyPaidCount = $summarySource->filter(fn($r) => $r['payment_status'] === 'paid')->count();
        $partialCount = $summarySource->filter(fn($r) => $r['payment_status'] === 'partial')->count();
        $unpaidCount = $summarySource->filter(fn($r) => $r['payment_status'] === 'unpaid')->count();
        $summaryStats = [
            'total_collectibles' => (float) $summarySource->sum('balance'),
            'total_collected' => (float) (clone $paymentQuery)->sum('amount'),
            'fully_paid_count' => $fullyPaidCount,
            'partial_paid_count' => $partialCount,
            'unpaid_count' => $unpaidCount,
        ];

        // Get all school years
        $schoolYears = StudentFee::distinct()->pluck('school_year')->sort()->values();

        // Get departments and classifications
        $departments = Department::orderBy('name')->get(['id', 'name', 'code', 'classification']);
        $classifications = Department::distinct()->pluck('classification')->filter()->sort()->values();

        // Fee Income Report — all active categories/items, real data from StudentFee & StudentPayment
        $categoryFieldMap = [
            'registration' => ['field' => 'registration_fee', 'payment_for' => 'registration'],
            'tuition'      => ['field' => 'tuition_fee',      'payment_for' => 'tuition'],
            'misc'         => ['field' => 'misc_fee',         'payment_for' => 'misc'],
            'books'        => ['field' => 'books_fee',        'payment_for' => 'books'],
        ];

        $feeReport = FeeCategory::where('is_active', true)
            ->with(['items' => fn ($q) => $q->where('is_active', true)->orderBy('name')])
            ->orderBy('sort_order')->orderBy('name')
            ->get()
            ->map(function ($cat) use ($categoryFieldMap) {
                $catLower = strtolower($cat->name);
                $mapping = null;
                foreach ($categoryFieldMap as $key => $map) {
                    if (str_contains($catLower, $key)) { $mapping = $map; break; }
                }
                $dbField   = $mapping['field']      ?? 'other_fees';
                $payFor    = $mapping['payment_for'] ?? 'other';

                // Real count & revenue from actual DB records
                $studentsAssigned = StudentFee::where($dbField, '>', 0)->count();
                $totalAssigned    = (float) StudentFee::sum($dbField);
                $totalCollected   = (float) StudentPayment::where('payment_for', $payFor)->sum('amount');

                $items = $cat->items->map(function ($item) use ($studentsAssigned, $totalAssigned) {
                    $selling = (float) $item->selling_price;
                    $cost    = (float) ($item->cost_price ?? 0);
                    $profit  = $selling - $cost;
                    // Use FeeItem.students_availed if it was set by applyToStudents(),
                    // otherwise fall back to the category-level count from StudentFee
                    $availed = (int) $item->students_availed > 0
                        ? (int) $item->students_availed
                        : $studentsAssigned;
                    return [
                        'name'             => $item->name,
                        'selling_price'    => round($selling, 2),
                        'cost_price'       => round($cost, 2),
                        'profit'           => round($profit, 2),
                        'students_availed' => $availed,
                        'total_revenue'    => round($selling * $availed, 2),
                        'total_income'     => round($profit * $availed, 2),
                    ];
                })->values();

                return [
                    'category'        => $cat->name,
                    'items'           => $items,
                    'total_assigned'  => round($totalAssigned, 2),
                    'total_collected' => round($totalCollected, 2),
                    'total_revenue'   => round($items->sum('total_revenue'), 2),
                    'total_income'    => round($items->sum('total_income'), 2),
                ];
            })
            ->values();

        // Document Fee Income — derive from actual DocumentRequest rows
        $documentFeeReport = DocumentFeeItem::where('is_active', true)
            ->orderBy('category')->orderBy('name')
            ->get()
            ->map(function ($item) {
                /** @var \App\Models\DocumentFeeItem $item */
                // Recount from real approved requests
                $item->actual_availed = DocumentRequest::where('document_fee_item_id', $item->id)
                    ->where('accounting_status', 'approved')
                    ->count();
                $item->actual_revenue = (float) DocumentRequest::where('document_fee_item_id', $item->id)
                    ->where('accounting_status', 'approved')
                    ->sum('fee');
                return $item;
            })
            ->groupBy('category')
            ->map(function ($fees, $cat) {
                /** @var \Illuminate\Support\Collection $fees */
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
                return [
                    'category'      => $cat,
                    'items'         => $items,
                    'total_revenue' => round($items->sum('total_revenue'), 2),
                ];
            })
            ->values();

        return Inertia::render($this->viewPrefix() . '/reports', [
            'paymentSummary' => $paymentSummary,
            'balanceReport' => $balanceReport,
            'filters' => $request->only(['from', 'to', 'school_year', 'status', 'department_id', 'classification']),
            'schoolYears' => $schoolYears,
            'summaryStats' => $summaryStats,
            'departments' => $departments,
            'classifications' => $classifications,
            'feeReport' => $feeReport,
            'documentFeeReport' => $documentFeeReport,
            'departmentAnalysis' => $this->buildDepartmentAnalysis(),
        ]);
    }

    private function buildDepartmentAnalysis(): array
    {
        return Department::all()
            ->map(function ($dept) {
                $studentIds     = Student::where('department_id', $dept->id)->whereNull('deleted_at')->pluck('id');
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
            ->values()
            ->toArray();
    }

    private function resolvePaymentStatus(float $totalAmount, float $totalPaid, float $balance): string
    {
        if ($totalAmount > 0 && $balance <= 0) {
            return 'paid';
        }
        if ($totalPaid > 0 && $balance > 0) {
            return 'partial';
        }
        return 'unpaid';
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'csv'); // csv, excel, pdf

        // Implementation would depend on packages like:
        // - Laravel Excel (maatwebsite/excel) for Excel/CSV
        // - DomPDF or Snappy for PDF
        
        // For now, this is a placeholder
        return response()->json([
            'message' => 'Export functionality can be implemented with Laravel Excel package',
            'type' => $type,
        ]);
    }
}
