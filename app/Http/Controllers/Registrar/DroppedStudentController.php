<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\DropRequest;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DroppedStudentController extends Controller
{
    /**
     * Display all officially dropped students.
     */
    public function index(Request $request): Response
    {
        $query = Student::with([
            'department:id,name,classification',
        ])->where('enrollment_status', 'dropped');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Program filter
        if ($program = $request->input('program')) {
            $query->where('program', $program);
        }

        // Year level filter
        if ($yearLevel = $request->input('year_level')) {
            $query->where('year_level', $yearLevel);
        }

        $students = $query->latest('updated_at')->paginate(20)->withQueryString();

        $students->through(function ($student) {
            // Get the most recent approved drop request for this student
            $dropRequest = DropRequest::where('student_id', $student->id)
                ->where('status', 'approved')
                ->with(['registrarApprovedBy:id,name', 'accountingApprovedBy:id,name'])
                ->latest()
                ->first();

            return [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'lrn' => $student->lrn,
                'email' => $student->email,
                'program' => $student->program,
                'year_level' => $student->year_level,
                'section' => $student->section,
                'student_photo_url' => $student->student_photo_url,
                'enrollment_status' => $student->enrollment_status,
                'classification' => $student->department?->classification,
                'drop_request' => $dropRequest ? [
                    'id' => $dropRequest->id,
                    'reason' => $dropRequest->reason,
                    'semester' => $dropRequest->semester,
                    'school_year' => $dropRequest->school_year,
                    'registrar_approved_at' => $dropRequest->registrar_approved_at?->format('M d, Y'),
                    'accounting_approved_at' => $dropRequest->accounting_approved_at?->format('M d, Y'),
                    'registrar_approved_by' => $dropRequest->registrarApprovedBy?->name,
                    'accounting_approved_by' => $dropRequest->accountingApprovedBy?->name,
                ] : null,
            ];
        });

        $totalDropped = Student::where('enrollment_status', 'dropped')->count();

        return Inertia::render('registrar/dropped-students/index', [
            'students' => $students,
            'totalDropped' => $totalDropped,
            'filters' => $request->only(['search', 'program', 'year_level']),
        ]);
    }
}
