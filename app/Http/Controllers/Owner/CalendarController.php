<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AcademicDeadline;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);
        
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        // Get academic deadlines
        $deadlines = AcademicDeadline::with('requirements')
            ->whereBetween('deadline_date', [$startDate, $endDate])
            ->get()
            ->map(function ($deadline) {
                return [
                    'id' => $deadline->id,
                    'title' => $deadline->name,
                    'date' => $deadline->deadline_date->toDateString(),
                    'type' => 'deadline',
                    'category' => $deadline->category,
                    'requirements_count' => $deadline->requirements->count(),
                    'description' => $deadline->description ?? 'No description',
                ];
            });

        return Inertia::render('owner/calendar', [
            'events' => $deadlines,
            'currentMonth' => $month,
            'currentYear' => $year,
            'monthName' => Carbon::create($year, $month, 1)->format('F Y'),
        ]);
    }
}
