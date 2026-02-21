<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\Department;
use App\Models\YearLevel;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index(Request $request)
    {
        $classification = $request->input('classification', 'all');
        $departmentFilter = $request->input('department_id', 'all');
        $yearLevelFilter = $request->input('year_level_id', 'all');
        $search = $request->input('search', '');
        $studentType = $request->input('student_type', 'all');

        // Get departments based on classification
        $departmentsQuery = Department::query()->orderBy('name');
        if ($classification !== 'all') {
            $departmentsQuery->where('classification', $classification);
        }
        $departments = $departmentsQuery->get();
        $departmentIds = $departments->pluck('id')->toArray();

        // Get year levels based on filtered departments
        $yearLevelsQuery = YearLevel::query()->orderBy('level_number');
        if (!empty($departmentIds)) {
            $yearLevelsQuery->whereIn('department_id', $departmentIds);
        }
        $yearLevels = $yearLevelsQuery->get();

        // Unassigned students (section_id is null)
        $unassignedQuery = Student::query()
            ->whereNull('deleted_at')
            ->where('enrollment_status', 'enrolled')
            ->whereNull('section_id');

        if ($classification !== 'all') {
            $unassignedQuery->whereIn('department_id', $departmentIds);
        }

        if ($search) {
            $unassignedQuery->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($departmentFilter !== 'all') {
            $unassignedQuery->where('department_id', $departmentFilter);
        }

        if ($yearLevelFilter !== 'all') {
            $unassignedQuery->where('year_level_id', $yearLevelFilter);
        }

        if ($studentType !== 'all') {
            $unassignedQuery->where('student_type', $studentType);
        }

        $unassignedStudents = $unassignedQuery->orderBy('last_name')->orderBy('first_name')->get();

        // Sections with assigned students
        $sectionsQuery = Section::with(['department', 'yearLevel', 'teacher'])
            ->withCount('students')
            ->where('is_active', true);

        if ($classification !== 'all') {
            $sectionsQuery->whereIn('department_id', $departmentIds);
        }

        if ($departmentFilter !== 'all') {
            $sectionsQuery->where('department_id', $departmentFilter);
        }

        if ($yearLevelFilter !== 'all') {
            $sectionsQuery->where('year_level_id', $yearLevelFilter);
        }

        $sections = $sectionsQuery->orderBy('name')->get()->map(function ($section) {
            $section->assigned_students = Student::where('section_id', $section->id)
                ->whereNull('deleted_at')
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get();
            $section->teacher_display = $section->teacher
                ? trim("{$section->teacher->last_name}, {$section->teacher->first_name}" . ($section->teacher->suffix ? " {$section->teacher->suffix}" : ''))
                : null;
            return $section;
        });

        // Active teachers for teacher assignment dropdown
        $teachers = Teacher::where('is_active', true)
            ->select('id', 'first_name', 'last_name', 'suffix', 'department_id')
            ->orderBy('last_name')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => trim("{$t->last_name}, {$t->first_name}" . ($t->suffix ? " {$t->suffix}" : '')),
                'department_id' => $t->department_id,
            ]);

        // Stats
        $totalStudents = Student::whereNull('deleted_at')->where('enrollment_status', 'enrolled')->count();
        $assignedCount = Student::whereNull('deleted_at')->where('enrollment_status', 'enrolled')->whereNotNull('section_id')->count();
        $unassignedCount = Student::whereNull('deleted_at')->where('enrollment_status', 'enrolled')->whereNull('section_id')->count();
        $maleCount = Student::whereNull('deleted_at')->where('enrollment_status', 'enrolled')->where('gender', 'Male')->count();
        $femaleCount = Student::whereNull('deleted_at')->where('enrollment_status', 'enrolled')->where('gender', 'Female')->count();

        return Inertia::render('registrar/classes/index', [
            'unassignedStudents' => $unassignedStudents,
            'sections' => $sections,
            'departments' => $departments,
            'yearLevels' => $yearLevels,
            'teachers' => $teachers,
            'stats' => [
                'totalStudents' => $totalStudents,
                'assignedCount' => $assignedCount,
                'unassignedCount' => $unassignedCount,
                'maleCount' => $maleCount,
                'femaleCount' => $femaleCount,
            ],
            'filters' => $request->only(['search', 'classification', 'department_id', 'year_level_id', 'student_type']),
        ]);
    }

    public function assignStudents(Request $request)
    {
        $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
            'section_id' => 'required|exists:sections,id',
        ]);

        $section = Section::findOrFail($request->section_id);

        // Check capacity
        $currentCount = Student::where('section_id', $section->id)->whereNull('deleted_at')->count();
        $newCount = count($request->student_ids);

        if ($section->capacity && ($currentCount + $newCount) > $section->capacity) {
            return back()->withErrors([
                'section_id' => "Section {$section->name} capacity exceeded. Capacity: {$section->capacity}, Current: {$currentCount}, Trying to add: {$newCount}",
            ]);
        }

        Student::whereIn('id', $request->student_ids)->update([
            'section_id' => $request->section_id,
            'section' => $section->name,
        ]);

        return back()->with('success', "{$newCount} student(s) assigned to {$section->name} successfully.");
    }

    public function removeStudent(Request $request, Student $student)
    {
        $student->update([
            'section_id' => null,
            'section' => null,
        ]);

        return back()->with('success', "{$student->full_name} has been removed from their section.");
    }

    public function assignTeacher(Request $request, Section $section)
    {
        $request->validate([
            'teacher_id' => 'nullable|exists:teachers,id',
        ]);

        $section->update(['teacher_id' => $request->teacher_id ?: null]);

        $msg = $request->teacher_id
            ? 'Teacher assigned to section successfully.'
            : 'Teacher removed from section.';

        return back()->with('success', $msg);
    }
}
