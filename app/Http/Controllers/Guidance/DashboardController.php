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
            'openCases' => GuidanceRecord::where('status', 'open')->count(),
            'inProgress' => GuidanceRecord::where('status', 'in-progress')->count(),
            'resolved' => GuidanceRecord::where('status', 'resolved')->count(),
        ];

        $recentRecords = GuidanceRecord::with(['student:id,first_name,last_name,lrn', 'counselor:id,name'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('guidance/dashboard', [
            'stats' => $stats,
            'recentRecords' => $recentRecords,
        ]);
    }
}
