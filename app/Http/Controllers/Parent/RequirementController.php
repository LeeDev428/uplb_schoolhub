<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Requirement;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RequirementController extends Controller
{
    public function index()
    {
        $user   = Auth::user();
        $parent = $user->parent;

        $children = $parent
            ? Student::where('parent_id', $parent->id)
                ->with([
                    'department:id,name',
                    'section:id,name',
                    'section.yearLevel:id,name',
                    'requirements.requirement:id,name,description,is_required',
                ])
                ->get()
                ->map(fn ($student) => $this->buildChildRequirements($student))
            : collect();

        return Inertia::render('parent/requirements/index', [
            'children' => $children,
        ]);
    }

    private function buildChildRequirements(Student $student): array
    {
        $requirements = $student->requirements->map(fn ($sr) => [
            'id'           => $sr->requirement->id ?? $sr->requirement_id,
            'name'         => $sr->requirement?->name ?? 'Unknown',
            'description'  => $sr->requirement?->description,
            'is_required'  => $sr->requirement?->is_required ?? true,
            'status'       => $sr->status,
            'submitted_at' => $sr->submitted_at?->format('M d, Y'),
            'approved_at'  => $sr->approved_at?->format('M d, Y'),
            'notes'        => $sr->notes,
        ]);

        $total    = $requirements->count();
        $approved = $requirements->where('status', 'approved')->count();

        return [
            'id'               => $student->id,
            'full_name'        => $student->full_name ?? trim("{$student->first_name} {$student->last_name}"),
            'student_id'       => $student->student_id ?? $student->id,
            'enrollment_status'=> $student->enrollment_status ?? 'not_enrolled',
            'department'       => $student->department?->name,
            'year_level'       => $student->section?->yearLevel?->name,
            'requirements'     => $requirements,
            'stats' => [
                'total'      => $total,
                'approved'   => $approved,
                'submitted'  => $requirements->where('status', 'submitted')->count(),
                'pending'    => $requirements->where('status', 'pending')->count(),
                'rejected'   => $requirements->where('status', 'rejected')->count(),
                'percentage' => $total > 0 ? round(($approved / $total) * 100) : 0,
            ],
        ];
    }
}
