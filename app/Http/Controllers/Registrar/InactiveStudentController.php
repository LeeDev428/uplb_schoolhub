<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Department;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InactiveStudentController extends Controller
{
    /**
     * Display listing of inactive (deactivated) students.
     * These are students with is_active = false and NOT soft-deleted.
     * They must re-register to enroll again.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'classification', 'department_id', 'year_level', 'school_year']);

        $query = Student::whereNull('deleted_at')
            ->where('is_active', false)
            ->with(['department:id,name,classification'])
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('lrn', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($filters['classification'] ?? null, function ($q, $classification) {
                $q->whereHas('department', fn ($d) => $d->where('classification', $classification));
            })
            ->when($filters['department_id'] ?? null, function ($q, $deptId) {
                $q->where('department_id', $deptId);
            })
            ->when($filters['year_level'] ?? null, function ($q, $yearLevel) {
                $q->where('year_level', $yearLevel);
            })
            ->when($filters['school_year'] ?? null, function ($q, $schoolYear) {
                $q->where('school_year', $schoolYear);
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        $students = $query->paginate(20)->withQueryString();

        // Transform for frontend
        $students->through(fn ($student) => [
            'id'                => $student->id,
            'lrn'               => $student->lrn,
            'first_name'        => $student->first_name,
            'last_name'         => $student->last_name,
            'email'             => $student->email,
            'student_photo_url' => $student->student_photo_url,
            'department'        => $student->department?->name,
            'classification'    => $student->department?->classification,
            'year_level'        => $student->year_level,
            'school_year'       => $student->school_year,
            'enrollment_status' => $student->enrollment_status,
        ]);

        // Distinct school years from inactive students
        $schoolYears = Student::whereNull('deleted_at')
            ->where('is_active', false)
            ->whereNotNull('school_year')
            ->where('school_year', '!=', '')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year');

        // Departments for filter
        $departments = Department::orderBy('name')
            ->get()
            ->map(fn ($d) => [
                'value' => (string) $d->id,
                'label' => $d->name,
                'classification' => $d->classification,
            ]);

        $appSettings = AppSetting::current();

        return Inertia::render('registrar/inactive-students', [
            'students'    => $students,
            'filters'     => $filters,
            'schoolYears' => $schoolYears,
            'departments' => $departments,
            'appSettings' => [
                'has_k12'     => $appSettings->has_k12,
                'has_college' => $appSettings->has_college,
            ],
        ]);
    }
}
