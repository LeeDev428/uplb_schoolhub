<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentRequirement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class RegistrarDashboardController extends Controller
{
    public function index()
    {
        // Get enrollment statistics
        $stats = [
            'activeStudents' => Student::count(),
            'officiallyEnrolled' => Student::where('enrollment_status', 'enrolled')->count(),
            'registrarPending' => Student::where('enrollment_status', 'pending-registrar')->count(),
            'accountingPending' => Student::where('enrollment_status', 'pending-accounting')->count(),
            'notEnrolled' => Student::where('enrollment_status', 'not-enrolled')->count(),
            'graduated' => Student::where('enrollment_status', 'graduated')->count(),
        ];

        // Total Students card data
        $totalStudents = Student::count();
        $completedClearance = Student::whereHas('enrollmentClearance', function ($q) {
            $q->where('requirements_complete', true)
              ->where('registrar_clearance', true)
              ->where('accounting_clearance', true);
        })->count();
        $pendingClearance = $totalStudents - $completedClearance;

        // Pending Requirements - students with incomplete requirements
        $pendingRequirements = Student::whereHas('requirements', function ($q) {
            $q->whereIn('status', ['pending', 'submitted']);
        })->count();

        // Complete Submissions - students with all requirements approved
        $completeSubmissions = Student::whereHas('requirements', function ($q) {
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

