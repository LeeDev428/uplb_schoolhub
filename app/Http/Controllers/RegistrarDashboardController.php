<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentRequirement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RegistrarDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Determine current academic year as default (Aug-Jul cycle)
        $month = (int) date('n');
        $year  = (int) date('Y');
        $syStart    = $month < 8 ? $year - 1 : $year;
        $currentSY  = $syStart . '-' . ($syStart + 1);
        $selectedSY = $request->input('school_year', $currentSY);

        // All distinct school years for the filter dropdown
        $schoolYears = Student::select('school_year')
            ->whereNotNull('school_year')
            ->where('school_year', '!=', '')
            ->distinct()
            ->orderByDesc('school_year')
            ->pluck('school_year')
            ->toArray();

        // Ensure the current/selected SY is always in the list
        if (!in_array($selectedSY, $schoolYears)) {
            array_unshift($schoolYears, $selectedSY);
        }

        // Base query scope for selected school year
        $syBase = fn($q) => $q->where('school_year', $selectedSY);

        // Get enrollment statistics (filtered by school year)
        $stats = [
            'activeStudents'    => Student::where('school_year', $selectedSY)->count(),
            'officiallyEnrolled'=> Student::where('school_year', $selectedSY)->where('enrollment_status', 'enrolled')->count(),
            'registrarPending'  => Student::where('school_year', $selectedSY)->where('enrollment_status', 'pending-registrar')->count(),
            'accountingPending' => Student::where('school_year', $selectedSY)->where('enrollment_status', 'pending-accounting')->count(),
            'notEnrolled'       => Student::where('school_year', $selectedSY)->where('enrollment_status', 'not-enrolled')->count(),
            'graduated'         => Student::where('school_year', $selectedSY)->where('enrollment_status', 'graduated')->count(),
        ];

        // Total Students card data
        $totalStudents = Student::where('school_year', $selectedSY)->count();
        $completedClearance = Student::where('school_year', $selectedSY)->whereHas('enrollmentClearance', function ($q) {
            $q->where('requirements_complete', true)
              ->where('registrar_clearance', true)
              ->where('accounting_clearance', true);
        })->count();
        $pendingClearance = $totalStudents - $completedClearance;

        // Pending Requirements - students with incomplete requirements (in this SY)
        $pendingRequirements = Student::where('school_year', $selectedSY)->whereHas('requirements', function ($q) {
            $q->whereIn('status', ['pending', 'submitted']);
        })->count();

        // Complete Submissions - students with all requirements approved (in this SY)
        $completeSubmissions = Student::where('school_year', $selectedSY)->whereHas('requirements', function ($q) {
            $q->where('status', 'approved');
        })->whereDoesntHave('requirements', function ($q) {
            $q->where('status', '!=', 'approved');
        })->count();

        // Document Requests (placeholder - would need a DocumentRequest model)
        $documentRequests = 0;

        // Recent Activity - last 10 student requirement updates
        $recentActivity = StudentRequirement::with(['student', 'requirement'])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->map(function ($sr) {
                $activity = 'Unknown activity';
                
                switch ($sr->status) {
                    case 'submitted':
                        $activity = 'Submitted ' . $sr->requirement->name;
                        break;
                    case 'approved':
                        $activity = 'Approved ' . $sr->requirement->name;
                        break;
                    case 'rejected':
                        $activity = 'Rejected ' . $sr->requirement->name;
                        break;
                    case 'pending':
                        $activity = 'Missing ' . $sr->requirement->name;
                        break;
                }

                return [
                    'student' => $sr->student->full_name,
                    'activity' => $activity,
                    'time' => $sr->updated_at->diffForHumans(),
                    'registrar' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                    'status' => $this->mapStatus($sr->status),
                ];
            });

        // Requirements Status for pie chart
        $totalRequirements = StudentRequirement::count();
        $requirementsStatus = [
            'complete' => StudentRequirement::where('status', 'approved')->count(),
            'pending' => StudentRequirement::where('status', 'submitted')->count(),
            'overdue' => StudentRequirement::where('status', 'overdue')->count(),
        ];

        return Inertia::render('registrar/dashboard', [
            'stats' => $stats,
            'cards' => [
                'totalStudents' => [
                    'count' => $totalStudents,
                    'complete' => $completedClearance,
                    'pending' => $pendingClearance,
                ],
                'pendingRequirements' => $pendingRequirements,
                'completeSubmissions' => $completeSubmissions,
                'documentRequests' => $documentRequests,
            ],
            'recentActivity' => $recentActivity,
            'requirementsStatus' => $requirementsStatus,
            'schoolYears' => $schoolYears,
            'selectedSchoolYear' => $selectedSY,
        ]);
    }

    private function mapStatus($status)
    {
        return match($status) {
            'approved' => 'Completed',
            'submitted' => 'Pending',
            'pending' => 'Overdue',
            'overdue' => 'Overdue',
            default => 'Pending',
        };
    }
}

