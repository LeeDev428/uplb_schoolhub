<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\AcademicDeadline;
use App\Models\Schedule;
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
                ];
            });

        // Get schedules (unique class sessions)
        $schedules = Schedule::with(['section', 'subject', 'teacher'])
            ->get()
            ->groupBy(function ($schedule) {
                return $schedule->section_id . '-' . $schedule->subject_id;
            })
            ->map(function ($group) use ($startDate, $endDate) {
                $schedule = $group->first();
                $events = [];
                
                // Generate events for each day of week within the month
                $daysOfWeek = $group->pluck('day_of_week')->unique()->toArray();
                
                $currentDate = $startDate->copy();
                while ($currentDate->lte($endDate)) {
                    if (in_array($currentDate->dayOfWeek, $daysOfWeek)) {
                        $daySchedule = $group->firstWhere('day_of_week', $currentDate->dayOfWeek);
                        if ($daySchedule) {
                            $events[] = [
                                'id' => 'schedule-' . $schedule->id . '-' . $currentDate->toDateString(),
                                'title' => $schedule->subject->name . ' - ' . $schedule->section->name,
                                'date' => $currentDate->toDateString(),
                                'time' => $daySchedule->start_time . ' - ' . $daySchedule->end_time,
                                'type' => 'schedule',
                                'teacher' => $schedule->teacher?->name ?? 'TBA',
                                'section' => $schedule->section->name,
                                'subject' => $schedule->subject->name,
                            ];
                        }
                    }
                    $currentDate->addDay();
                }
                
                return $events;
            })
            ->flatten(1);

        $events = $deadlines->merge($schedules)->sortBy('date')->values();

        return Inertia::render('owner/calendar', [
            'events' => $events,
            'currentMonth' => $month,
            'currentYear' => $year,
            'monthName' => Carbon::create($year, $month, 1)->format('F Y'),
        ]);
    }
}
