<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Department;
use App\Models\Student;
use App\Models\StudentActionLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ArchivedStudentController extends Controller
{
    /**
     * Display listing of archived (soft-deleted) students.
     * K-12 students can be filtered by school year.
     * College students can be filtered by school year and semester.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'classification', 'department_id', 'year_level', 'school_year', 'semester']);

        $query = Student::onlyTrashed()
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
            ->when($filters['semester'] ?? null, function ($q, $semester) {
                // Filter college students by semester via their enrolled subjects
                $q->whereHas('studentSubjects', fn ($s) => $s->where('semester', $semester));
            })
            ->orderBy('deleted_at', 'desc');

        $students = $query->paginate(20)->withQueryString();

        // Transform for frontend
        $students->through(fn ($student) => [
            'id'                => $student->id,
            'lrn'               => $student->lrn,
            'first_name'        => $student->first_name,
            'last_name'         => $student->last_name,
            'email'             => $student->email,
            'department'        => $student->department?->name,
            'classification'    => $student->department?->classification,
            'year_level'        => $student->year_level,
            'school_year'       => $student->school_year,
            'enrollment_status' => $student->enrollment_status,
            'deleted_at'        => $student->deleted_at?->toDateTimeString(),
        ]);

        // Distinct school years from archived students
        $schoolYears = Student::onlyTrashed()
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

        return Inertia::render('registrar/archived', [
            'students'     => $students,
            'filters'      => $filters,
            'schoolYears'  => $schoolYears,
            'departments'  => $departments,
            'appSettings'  => [
                'has_k12'     => $appSettings->has_k12,
                'has_college' => $appSettings->has_college,
            ],
        ]);
    }

    /**
     * Restore a soft-deleted student.
     */
    public function restore(int $id)
    {
        $student = Student::onlyTrashed()->findOrFail($id);
        $student->restore();

        // Log the action
        StudentActionLog::create([
            'student_id'   => $student->id,
            'user_id'      => Auth::id(),
            'action'       => 'restored',
            'details'      => [
                'restored_by' => Auth::user()->name,
                'restored_at' => now()->toDateTimeString(),
            ],
        ]);

        return back()->with('success', "Student {$student->first_name} {$student->last_name} has been restored.");
    }

    /**
     * Permanently delete a student record.
     */
    public function forceDelete(int $id)
    {
        $student = Student::onlyTrashed()->findOrFail($id);
        $studentName = "{$student->first_name} {$student->last_name}";
        
        // Log before deletion
        StudentActionLog::create([
            'student_id'   => $student->id,
            'user_id'      => Auth::id(),
            'action'       => 'permanently_deleted',
            'details'      => [
                'deleted_by'  => Auth::user()->name,
                'deleted_at'  => now()->toDateTimeString(),
                'student_lrn' => $student->lrn,
            ],
        ]);

        $student->forceDelete();

        return back()->with('success', "Student {$studentName} has been permanently deleted.");
    }

    /**
     * Bulk restore multiple archived students.
     */
    public function bulkRestore(Request $request)
    {
        $validated = $request->validate([
            'student_ids'   => 'required|array|min:1',
            'student_ids.*' => 'integer',
        ]);

        $count = Student::onlyTrashed()
            ->whereIn('id', $validated['student_ids'])
            ->restore();

        // Log actions for each
        foreach ($validated['student_ids'] as $studentId) {
            StudentActionLog::create([
                'student_id' => $studentId,
                'user_id'    => Auth::id(),
                'action'     => 'restored',
                'details'    => [
                    'restored_by'  => Auth::user()->name,
                    'bulk_restore' => true,
                ],
            ]);
        }

        return back()->with('success', "{$count} student(s) restored successfully.");
    }
}
