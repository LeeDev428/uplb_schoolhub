<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Requirement;
use App\Models\StudentRequirement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequirementTrackingController extends Controller
{
    /**
     * Display requirements tracking page
     */
    public function index(Request $request)
    {
        $studentType = $request->query('type', 'all');
        $search = $request->query('search');
        $status = $request->query('status');
        $program = $request->query('program');

        $query = Student::with(['requirements.requirement'])
            ->orderBy('last_name');

        // Filter by student type
        if ($studentType !== 'all') {
            $query->where('student_type', $studentType);
        }

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        // Program filter
        if ($program && $program !== 'all') {
            $query->where('program', $program);
        }

        // Status filter (completion status)
        if ($status && $status !== 'all') {
            $query->withCount(['requirements as total_requirements', 'requirements as completed_requirements' => function ($q) {
                $q->where('status', 'approved');
            }]);
            
            if ($status === 'complete') {
                $query->having('total_requirements', '>', 0)
                      ->havingRaw('completed_requirements = total_requirements');
            } elseif ($status === 'incomplete') {
                $query->havingRaw('completed_requirements < total_requirements OR total_requirements = 0');
            }
        }

        $students = $query->paginate(15)->withQueryString();

        // Get all requirements with their applicability fields
        $requirements = Requirement::where('is_active', true)
            ->select('id', 'name', 'applies_to_new_enrollee', 'applies_to_transferee', 'applies_to_returning', 'order')
            ->orderBy('order')
            ->get();

        return Inertia::render('registrar/requirements/index', [
            'students' => $students,
            'requirements' => $requirements,
            'filters' => [
                'type' => $studentType,
                'search' => $search,
                'status' => $status,
                'program' => $program,
            ],
        ]);
    }

    /**
     * Export requirements tracking data to CSV
     */
    public function export(Request $request)
    {
        $studentType = $request->query('type', 'all');
        $search = $request->query('search');
        $status = $request->query('status');
        $program = $request->query('program');

        $query = Student::with(['requirements.requirement'])
            ->orderBy('last_name');

        // Apply same filters as index
        if ($studentType !== 'all') {
            $query->where('student_type', $studentType);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        if ($program && $program !== 'all') {
            $query->where('program', $program);
        }

        if ($status && $status !== 'all') {
            $query->withCount(['requirements as total_requirements', 'requirements as completed_requirements' => function ($q) {
                $q->where('status', 'approved');
            }]);
            
            if ($status === 'complete') {
                $query->having('total_requirements', '>', 0)
                      ->havingRaw('completed_requirements = total_requirements');
            } elseif ($status === 'incomplete') {
                $query->havingRaw('completed_requirements < total_requirements OR total_requirements = 0');
            }
        }

        $students = $query->get();
        $requirements = Requirement::where('is_active', true)->orderBy('order')->get();

        // Generate CSV
        $filename = 'requirements_tracking_' . date('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($students, $requirements) {
            $file = fopen('php://output', 'w');
            
            // Header row
            $header = ['Student ID', 'Name', 'Program', 'Year Level', 'Section', 'Student Type'];
            foreach ($requirements as $req) {
                $header[] = $req->name;
            }
            $header[] = 'Completion %';
            fputcsv($file, $header);

            // Data rows
            foreach ($students as $student) {
                $row = [
                    $student->student_number ?? $student->lrn,
                    $student->first_name . ' ' . $student->last_name,
                    $student->program,
                    $student->year_level,
                    $student->section ?? 'N/A',
                    $student->student_type,
                ];

                // Add requirement statuses
                foreach ($requirements as $req) {
                    $studentReq = $student->requirements->firstWhere('requirement_id', $req->id);
                    $row[] = $studentReq ? ucfirst($studentReq->status) : 'Not Assigned';
                }

                // Add completion percentage
                $total = $student->requirements->count();
                $completed = $student->requirements->where('status', 'approved')->count();
                $percentage = $total > 0 ? round(($completed / $total) * 100) : 0;
                $row[] = $percentage . '%';

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Send test reminder email
     */
    public function testReminder(Request $request)
    {
        // For testing purposes, we'll just return a success message
        // In production, you would send an actual email
        return back()->with('success', 'Test reminder sent successfully! (This is a test feature)');
    }

    /**
     * Send reminders to students with incomplete requirements
     */
    public function sendReminders(Request $request)
    {
        $studentType = $request->query('type', 'all');
        $search = $request->query('search');
        $status = $request->query('status');
        $program = $request->query('program');

        $query = Student::with(['requirements.requirement'])->orderBy('last_name');

        // Apply filters
        if ($studentType !== 'all') {
            $query->where('student_type', $studentType);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('student_number', 'like', "%{$search}%");
            });
        }

        if ($program && $program !== 'all') {
            $query->where('program', $program);
        }

        // Get students with incomplete requirements
        $students = $query->get()->filter(function ($student) {
            $total = $student->requirements->count();
            if ($total === 0) return false;
            $completed = $student->requirements->where('status', 'approved')->count();
            return $completed < $total;
        });

        $count = $students->count();

        // In production, you would:
        // 1. Queue email jobs for each student
        // 2. Send emails with requirement status details
        // 3. Log the reminder activity
        
        // For now, just return success message
        return back()->with('success', "Reminders queued for {$count} student(s) with incomplete requirements. (Feature in development)");
    }
}
