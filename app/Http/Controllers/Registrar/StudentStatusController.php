<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Unified student status management page.
 * Shows Dropped, Archived (soft-deleted), and Deactivated students in one place
 * so the registrar can reactivate / restore / activate them.
 */
class StudentStatusController extends Controller
{
    public function index(Request $request): Response
    {
        $tab     = $request->input('tab', 'dropped');
        $filters = $request->only(['search', 'classification', 'department_id']);

        // Build base query depending on the active tab
        $query = match ($tab) {
            'archived'    => Student::onlyTrashed()
                ->with(['department:id,name,classification']),
            'deactivated' => Student::whereNull('deleted_at')
                ->where('is_active', false)
                ->with(['department:id,name,classification']),
            default       => Student::whereNull('deleted_at')   // 'dropped'
                ->where('enrollment_status', 'dropped')
                ->with(['department:id,name,classification']),
        };

        // Search
        if ($search = $filters['search'] ?? null) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name',  'like', "%{$search}%")
                  ->orWhere('lrn',        'like', "%{$search}%")
                  ->orWhere('email',      'like', "%{$search}%");
            });
        }

        // Classification filter
        if ($classification = $filters['classification'] ?? null) {
            $query->whereHas('department', fn ($d) => $d->where('classification', $classification));
        }

        // Department filter
        if ($departmentId = $filters['department_id'] ?? null) {
            $query->where('department_id', $departmentId);
        }

        // Order
        $query->orderBy('last_name')->orderBy('first_name');

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
            'is_active'         => $student->is_active,
            'deleted_at'        => $student->deleted_at?->toDateTimeString(),
        ]);

        // Departments for filter dropdown
        $departments = Department::orderBy('name')->get()->map(fn ($d) => [
            'value'          => (string) $d->id,
            'label'          => $d->name,
            'classification' => $d->classification,
        ]);

        // Tab counts
        $counts = [
            'dropped'    => Student::whereNull('deleted_at')->where('enrollment_status', 'dropped')->count(),
            'archived'   => Student::onlyTrashed()->count(),
            'deactivated'=> Student::whereNull('deleted_at')->where('is_active', false)->count(),
        ];

        return Inertia::render('registrar/student-status', [
            'students'    => $students,
            'tab'         => $tab,
            'filters'     => $filters,
            'departments' => $departments,
            'counts'      => $counts,
        ]);
    }
}
