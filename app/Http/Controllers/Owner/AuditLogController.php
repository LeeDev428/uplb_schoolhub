<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\BalanceAdjustment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display the balance adjustment audit logs.
     */
    public function index(Request $request): Response
    {
        $query = BalanceAdjustment::with([
            'student:id,first_name,last_name,lrn,program,year_level',
            'adjuster:id,name,role',
            'studentFee:id,school_year,total_amount,balance',
        ])->orderByDesc('created_at');

        // Search by student name, LRN, or adjuster name
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('student', function ($sq) use ($search) {
                    $sq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('lrn', 'like', "%{$search}%");
                })
                ->orWhereHas('adjuster', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                })
                ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        // Filter by school year
        if ($schoolYear = $request->input('school_year')) {
            $query->where('school_year', $schoolYear);
        }

        // Filter by date range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $adjustments = $query->paginate(25)->withQueryString();

        // Transform for frontend
        $adjustments->through(function ($adj) {
            return [
                'id' => $adj->id,
                'student' => $adj->student ? [
                    'id' => $adj->student->id,
                    'full_name' => $adj->student->first_name . ' ' . $adj->student->last_name,
                    'lrn' => $adj->student->lrn,
                    'program' => $adj->student->program,
                    'year_level' => $adj->student->year_level,
                ] : null,
                'adjuster' => $adj->adjuster ? [
                    'name' => $adj->adjuster->name,
                    'role' => $adj->adjuster->role,
                ] : null,
                'amount' => (float) $adj->amount,
                'reason' => $adj->reason,
                'notes' => $adj->notes,
                'school_year' => $adj->school_year,
                'fee_total_after' => $adj->studentFee ? (float) $adj->studentFee->total_amount : null,
                'fee_balance_after' => $adj->studentFee ? (float) $adj->studentFee->balance : null,
                'created_at' => $adj->created_at->format('M d, Y h:i A'),
                'created_at_raw' => $adj->created_at->toISOString(),
            ];
        });

        // Get available school years for filter
        $schoolYears = BalanceAdjustment::distinct()
            ->whereNotNull('school_year')
            ->orderBy('school_year', 'desc')
            ->pluck('school_year');

        // Summary stats
        $totalAdjustments = BalanceAdjustment::count();
        $totalAmountAdded = BalanceAdjustment::sum('amount');
        $adjustersCount = BalanceAdjustment::distinct('adjusted_by')->count('adjusted_by');
        $todayCount = BalanceAdjustment::whereDate('created_at', today())->count();

        return Inertia::render('owner/audit-logs', [
            'adjustments' => $adjustments,
            'filters' => $request->only(['search', 'school_year', 'date_from', 'date_to']),
            'schoolYears' => $schoolYears,
            'stats' => [
                'total_adjustments' => $totalAdjustments,
                'total_amount_added' => (float) $totalAmountAdded,
                'adjusters_count' => $adjustersCount,
                'today_count' => $todayCount,
            ],
        ]);
    }
}
