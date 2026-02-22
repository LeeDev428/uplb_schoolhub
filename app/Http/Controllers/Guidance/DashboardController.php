<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\GuidanceRecord;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $stats = [
            'totalRecords' => GuidanceRecord::count(),
            'openCases'    => GuidanceRecord::where('status', 'open')->count(),
            'inProgress'   => GuidanceRecord::where('status', 'in-progress')->count(),
            'resolved'     => GuidanceRecord::where('status', 'resolved')->count(),
        ];

        // Severity breakdown
        $severityBreakdown = GuidanceRecord::selectRaw('severity, COUNT(*) as count')
            ->groupBy('severity')
            ->pluck('count', 'severity')
            ->toArray();

        // Type breakdown (top 5)
        $typeBreakdown = GuidanceRecord::selectRaw('record_type, COUNT(*) as count')
            ->groupBy('record_type')
            ->orderByDesc('count')
            ->take(5)
            ->pluck('count', 'record_type')
            ->toArray();

        $recentRecords = GuidanceRecord::with(['student:id,first_name,last_name,lrn', 'counselor:id,name'])
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('guidance/dashboard', [
            'counselorName'     => $user->name,
            'stats'             => $stats,
            'severityBreakdown' => $severityBreakdown,
            'typeBreakdown'     => $typeBreakdown,
            'recentRecords'     => $recentRecords,
        ]);
    }
}
