<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Department;
use App\Models\Program;
use App\Models\Section;
use App\Models\Student;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentPromotionController extends Controller
{
    /**
     * Show the promote-students page.
     */
    public function index(Request $request): Response
    {
        $activeSchoolYear = AppSetting::current()->school_year ?? (date('Y') . '-' . (date('Y') + 1));

        // ── Filters ────────────────────────────────────────────────────────────
        $search         = $request->input('search', '');
        $departmentId   = $request->input('department_id', '');
        $yearLevelId    = $request->input('year_level_id', '');
        $program        = $request->input('program', '');
        $currentSection = $request->input('section_id', '');
        $enrollStatus   = $request->input('enrollment_status', '');
        $schoolYearFilter = $request->input('school_year', '');

        // ── Students query — ALL students including archived/inactive ──────────
        $query = Student::withTrashed()
            ->with(['sectionModel.yearLevel', 'sectionModel.program']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        if ($yearLevelId) {
            $query->where('year_level_id', $yearLevelId);
        }

        if ($program) {
            $query->where('program', $program);
        }

        if ($currentSection === '__none__') {
            $query->whereNull('section_id');
        } elseif ($currentSection) {
            $query->where('section_id', $currentSection);
        }

        if ($enrollStatus) {
            $query->where('enrollment_status', $enrollStatus);
        }

        if ($schoolYearFilter) {
            $query->where('school_year', $schoolYearFilter);
        }

        $students = $query->orderBy('last_name')->orderBy('first_name')->paginate(80)->withQueryString();

        // ── Available school years for the tab filter ──────────────────────────
        $schoolYears = Student::withTrashed()
            ->whereNotNull('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->values();

        // ── Reference data ─────────────────────────────────────────────────────
        $departments = Department::orderBy('name')->get(['id', 'name', 'classification']);

        $yearLevels = YearLevel::with('department')
            ->orderBy('level_number')
            ->get()
            ->map(fn ($yl) => [
                'id'            => $yl->id,
                'name'          => $yl->name,
                'department_id' => $yl->department_id,
                'level_number'  => $yl->level_number,
                'department'    => ['id' => $yl->department->id, 'name' => $yl->department->name],
            ]);

        $programs = Program::with('department')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'department_id' => $p->department_id,
            ]);

        $sections = Section::with(['yearLevel', 'program', 'department'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'name'          => $s->name,
                'year_level_id' => $s->year_level_id,
                'year_level'    => $s->yearLevel ? ['id' => $s->yearLevel->id, 'name' => $s->yearLevel->name] : null,
                'program_id'    => $s->program_id,
                'program'       => $s->program  ? ['id' => $s->program->id,  'name' => $s->program->name]  : null,
                'department_id' => $s->department_id,
                'department'    => $s->department ? ['id' => $s->department->id, 'name' => $s->department->name] : null,
                'capacity'      => $s->capacity,
            ]);

        return Inertia::render('registrar/students/promote', [
            'students'         => $students->through(fn ($s) => [
                'id'                => $s->id,
                'first_name'        => $s->first_name,
                'last_name'         => $s->last_name,
                'middle_name'       => $s->middle_name,
                'suffix'            => $s->suffix,
                'lrn'               => $s->lrn,
                'email'             => $s->email,
                'program'           => $s->program,
                'year_level'        => $s->year_level,
                'year_level_id'     => $s->year_level_id,
                'section'           => $s->section,
                'section_id'        => $s->section_id,
                'department_id'     => $s->department_id,
                'enrollment_status' => $s->enrollment_status,
                'school_year'       => $s->school_year,
                'student_photo_url' => $s->student_photo_url,
                'is_archived'       => $s->deleted_at !== null,
                'is_inactive'       => !$s->is_active && $s->deleted_at === null,
            ]),
            'departments'      => $departments,
            'yearLevels'       => $yearLevels,
            'programs'         => $programs,
            'sections'         => $sections,
            'schoolYears'      => $schoolYears,
            'activeSchoolYear' => $activeSchoolYear,
            'filters'          => $request->only([
                'search', 'department_id', 'year_level_id',
                'program', 'section_id', 'enrollment_status', 'school_year',
            ]),
        ]);
    }

    /**
     * Process the bulk promotion.
     *
     * Expects:
     *  promotions: [
     *    { student_id: 1, section_id: 5 | 'TBA', year_level_id: 3 }   // year_level_id required if TBA
     *  ]
     */
    public function promote(Request $request): RedirectResponse
    {
        $activeSchoolYear = AppSetting::current()->school_year ?? (date('Y') . '-' . (date('Y') + 1));

        $validated = $request->validate([
            'student_ids'         => 'required|array|min:1',
            'student_ids.*'       => 'integer|exists:students,id',
            'target_section_id'   => 'nullable|string',   // section id OR 'TBA'
            'target_year_level_id'=> 'nullable|integer|exists:year_levels,id', // required when TBA
        ]);

        $studentIds       = $validated['student_ids'];
        $targetSectionId  = $validated['target_section_id'] ?? null;
        $targetYearLevelId= $validated['target_year_level_id'] ?? null;

        if (!$targetSectionId) {
            return back()->withErrors(['target_section_id' => 'A target section or TBA is required.']);
        }

        // ── Build update payload ────────────────────────────────────────────────
        if ($targetSectionId === 'TBA') {
            if (!$targetYearLevelId) {
                return back()->withErrors(['target_year_level_id' => 'Year level is required when assigning TBA.']);
            }

            $yearLevel = YearLevel::findOrFail($targetYearLevelId);

            $updateData = [
                'section_id'    => null,
                'section'       => 'TBA',
                'year_level_id' => $yearLevel->id,
                'year_level'    => $yearLevel->name,
                'school_year'   => $activeSchoolYear,
            ];
        } else {
            $section = Section::with(['yearLevel', 'program'])->findOrFail((int) $targetSectionId);

            $updateData = [
                'section_id'    => $section->id,
                'section'       => $section->name,
                'year_level_id' => $section->year_level_id,
                'year_level'    => $section->yearLevel?->name ?? '',
                'school_year'   => $activeSchoolYear,
            ];

            // Update program if section has one
            if ($section->program_id && $section->program) {
                $updateData['program'] = $section->program->name;
            }
        }

        Student::whereIn('id', $studentIds)->update($updateData);

        $count = count($studentIds);
        $destination = $targetSectionId === 'TBA'
            ? "TBA ({$updateData['year_level']})"
            : $updateData['section'];

        return redirect()->route('registrar.promote-students.index')
            ->with('success', "{$count} student(s) successfully promoted to {$destination} for school year {$activeSchoolYear}.");
    }
}
