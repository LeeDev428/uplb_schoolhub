<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Department;
use App\Models\YearLevel;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $classification = $request->input('classification', 'all');
        $departmentFilter = $request->input('department_id', 'all');

        // Get department IDs for the selected classification
        $departmentIds = [];
        if ($classification !== 'all') {
            $departmentIds = Department::where('classification', $classification)->pluck('id')->toArray();
        }

        // Base query
        $studentQuery = Student::query()->whereNull('deleted_at');
        if ($classification !== 'all' && !empty($departmentIds)) {
            $studentQuery->whereIn('department_id', $departmentIds);
        }
        if ($departmentFilter !== 'all') {
            $studentQuery->where('department_id', $departmentFilter);
        }

        // Stats
        $totalStudents = (clone $studentQuery)->count();
        $maleStudents = (clone $studentQuery)->where('gender', 'Male')->count();
        $femaleStudents = (clone $studentQuery)->where('gender', 'Female')->count();
        $enrolledStudents = (clone $studentQuery)->where('enrollment_status', 'enrolled')->count();
        $pendingStudents = (clone $studentQuery)->where('enrollment_status', 'pending')->count();

        // Department distribution (filtered by classification)
        $departmentQuery = Department::withCount(['students' => function ($q) {
            $q->whereNull('deleted_at');
        }]);
        if ($classification !== 'all') {
            $departmentQuery->where('classification', $classification);
        }
        $departmentDistribution = $departmentQuery->orderBy('name')->get()->map(fn ($d) => [
            'name' => $d->name,
            'count' => $d->students_count,
        ]);

        // Year level distribution
        $yearLevelDistribution = YearLevel::withCount(['students' => function ($q) use ($departmentFilter) {
            $q->whereNull('deleted_at');
            if ($departmentFilter !== 'all') {
                $q->where('department_id', $departmentFilter);
            }
        }])->orderBy('level_number')->get()->map(fn ($yl) => [
            'name' => $yl->name,
            'count' => $yl->students_count,
        ]);

        // Enrollment status distribution
        $enrollmentDistribution = [
            ['status' => 'Enrolled', 'count' => $enrolledStudents],
            ['status' => 'Pending', 'count' => $pendingStudents],
            ['status' => 'Dropped', 'count' => (clone $studentQuery)->where('enrollment_status', 'dropped')->count()],
            ['status' => 'Graduated', 'count' => (clone $studentQuery)->where('enrollment_status', 'graduated')->count()],
        ];

        // Section fill rates (top 10 most filled)
        $sectionFillRates = Section::with(['department', 'yearLevel'])
            ->withCount('students')
            ->where('is_active', true)
            ->when($departmentFilter !== 'all', fn ($q) => $q->where('department_id', $departmentFilter))
            ->orderByDesc('students_count')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'name' => $s->name,
                'department' => $s->department->name ?? 'N/A',
                'year_level' => $s->yearLevel->name ?? 'N/A',
                'room_number' => $s->room_number,
                'students' => $s->students_count,
                'capacity' => $s->capacity,
                'fill_rate' => $s->capacity > 0 ? round(($s->students_count / $s->capacity) * 100, 1) : 0,
            ]);

        // Get departments filtered by classification for dropdown
        $departmentsQuery = Department::orderBy('name');
        if ($classification !== 'all') {
            $departmentsQuery->where('classification', $classification);
        }
        
        return Inertia::render('registrar/reports/index', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'maleStudents' => $maleStudents,
                'femaleStudents' => $femaleStudents,
                'enrolledStudents' => $enrolledStudents,
                'pendingStudents' => $pendingStudents,
            ],
            'departmentDistribution' => $departmentDistribution,
            'yearLevelDistribution' => $yearLevelDistribution,
            'enrollmentDistribution' => $enrollmentDistribution,
            'sectionFillRates' => $sectionFillRates,
            'departments' => $departmentsQuery->get(),
            'filters' => [
                'classification' => $classification,
                'department_id' => $departmentFilter,
            ],
        ]);
    }
}
