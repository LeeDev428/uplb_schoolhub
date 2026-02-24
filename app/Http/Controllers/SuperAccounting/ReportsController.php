<?php

namespace App\Http\Controllers\SuperAccounting;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\RefundRequest;
use App\Models\Student;
use App\Models\StudentFee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $settings = AppSetting::current();
        $currentSchoolYear = $settings?->school_year ?? date('Y') . '-' . (date('Y') + 1);
        
        $selectedYear = $request->input('school_year', $currentSchoolYear);
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Build query
        $query = RefundRequest::with(['student:id,first_name,last_name,lrn,program,year_level', 'processedBy:id,name']);

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Summary statistics
        $summary = [
            'total_requests' => (clone $query)->count(),
            'pending_requests' => (clone $query)->where('status', 'pending')->count(),
            'approved_requests' => (clone $query)->where('status', 'approved')->count(),
            'rejected_requests' => (clone $query)->where('status', 'rejected')->count(),
            'total_refund_amount' => (float) (clone $query)->where('status', 'approved')->where('type', 'refund')->sum('amount'),
            'total_void_amount' => (float) (clone $query)->where('status', 'approved')->where('type', 'void')->sum('amount'),
        ];

        // Monthly breakdown
        $monthlyBreakdown = RefundRequest::where('status', 'approved')
            ->select(
                DB::raw('MONTH(processed_at) as month'),
                DB::raw('YEAR(processed_at) as year'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->whereYear('processed_at', Carbon::now()->year)
            ->groupBy('month', 'year')
            ->orderBy('month')
            ->get()
            ->map(function ($row) {
                return [
                    'month' => Carbon::createFromDate($row->year, $row->month, 1)->format('M Y'),
                    'total' => (float) $row->total,
                    'count' => $row->count,
                ];
            });

        // By type breakdown
        $byType = [
            'refund' => [
                'count' => RefundRequest::where('status', 'approved')->where('type', 'refund')->count(),
                'amount' => (float) RefundRequest::where('status', 'approved')->where('type', 'refund')->sum('amount'),
            ],
            'void' => [
                'count' => RefundRequest::where('status', 'approved')->where('type', 'void')->count(),
                'amount' => (float) RefundRequest::where('status', 'approved')->where('type', 'void')->sum('amount'),
            ],
        ];

        // Dropped students statistics
        $droppedStats = [
            'total_dropped' => Student::where('enrollment_status', 'dropped')->count(),
            'dropped_with_refund' => Student::where('enrollment_status', 'dropped')
                ->whereHas('refundRequests', function ($q) {
                    $q->where('status', 'approved');
                })->count(),
            'dropped_pending_refund' => Student::where('enrollment_status', 'dropped')
                ->whereHas('refundRequests', function ($q) {
                    $q->where('status', 'pending');
                })->count(),
        ];

        // Recent transactions
        $recentTransactions = $query->latest()
            ->take(50)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'type' => $r->type,
                    'amount' => (float) $r->amount,
                    'status' => $r->status,
                    'reason' => $r->reason,
                    'student_name' => $r->student->full_name,
                    'student_lrn' => $r->student->lrn,
                    'processed_by' => $r->processedBy?->name,
                    'processed_at' => $r->processed_at?->format('M d, Y h:i A'),
                    'created_at' => $r->created_at->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('super-accounting/reports/index', [
            'summary' => $summary,
            'monthlyBreakdown' => $monthlyBreakdown,
            'byType' => $byType,
            'droppedStats' => $droppedStats,
            'recentTransactions' => $recentTransactions,
            'schoolYear' => $currentSchoolYear,
            'filters' => [
                'school_year' => $selectedYear,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Export refund report as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $status = $request->input('status', 'approved');

        $query = RefundRequest::with(['student', 'processedBy']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }
        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $refunds = $query->orderBy('created_at', 'desc')->get();

        $filename = 'refund_report_' . now()->format('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () use ($refunds) {
            $handle = fopen('php://output', 'w');

            // Header
            fputcsv($handle, [
                'ID',
                'Student Name',
                'LRN',
                'Program',
                'Year Level',
                'Type',
                'Amount',
                'Status',
                'Reason',
                'Processed By',
                'Processed At',
                'Requested At',
            ]);

            foreach ($refunds as $r) {
                fputcsv($handle, [
                    $r->id,
                    $r->student->full_name,
                    $r->student->lrn,
                    $r->student->program,
                    $r->student->year_level,
                    ucfirst($r->type),
                    number_format((float) $r->amount, 2),
                    ucfirst($r->status),
                    $r->reason,
                    $r->processedBy?->name ?? '-',
                    $r->processed_at?->format('Y-m-d H:i:s') ?? '-',
                    $r->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
