<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ExamApproval;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamApprovalController extends Controller
{
    /**
     * Display a listing of exam approvals.
     */
    public function index(Request $request): Response
    {
        $query = ExamApproval::with(['student', 'approvedBy']);

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by exam type
        if ($examType = $request->input('exam_type')) {
            $query->where('exam_type', $examType);
        }

        // Filter by school year
        if ($schoolYear = $request->input('school_year')) {
            $query->where('school_year', $schoolYear);
        }

        $approvals = $query->latest()->paginate(20)->withQueryString();

        // Get all students eligible for exam approval: everyone except those marked overdue
        $eligibleStudents = Student::whereNull('deleted_at')
            ->whereDoesntHave('fees', function ($fq) {
                $fq->where('is_overdue', true);
            })
            ->with('fees')
            ->get()
            ->map(function ($student) {
                $currentFee = $student->fees()->latest()->first();
                return [
                    'id' => $student->id,
                    'full_name' => $student->full_name,
                    'lrn' => $student->lrn,
                    'student_photo_url' => $student->student_photo_url,
                    'balance' => max(0, (float) ($currentFee->balance ?? 0)),
                    'total_paid' => (float) ($currentFee->total_paid ?? 0),
                    'school_year' => $currentFee->school_year ?? now()->format('Y') . '-' . (now()->year + 1),
                ];
            });

        // Eligible students split by gender — all except those with overdue fees
        $fullyPaidQuery = Student::whereNull('deleted_at')
            ->whereDoesntHave('fees', function ($fq) {
                $fq->where('is_overdue', true);
            })
            ->with(['fees' => function ($q) {
                $q->latest();
            }, 'departmentModel']);

        // Apply search to the list if provided
        if ($search = $request->input('search')) {
            $fullyPaidQuery->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        $fullyPaidStudents = $fullyPaidQuery
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                $fee = $student->fees->first();
                return [
                    'id'                => $student->id,
                    'full_name'         => $student->full_name,
                    'first_name'        => $student->first_name,
                    'last_name'         => $student->last_name,
                    'lrn'               => $student->lrn,
                    'gender'            => strtolower($student->gender ?? ''),
                    'classification'    => $student->student_type ?? 'new',
                    'department'        => $student->departmentModel?->name ?? null,
                    'program'           => $student->program,
                    'year_level'        => $student->year_level,
                    'section'           => $student->section,
                    'student_photo_url' => $student->student_photo_url,
                    'total_amount'      => (float) ($fee?->total_amount ?? 0),
                    'total_paid'        => (float) ($fee?->total_paid ?? 0),
                    'balance'           => max(0, (float) ($fee?->balance ?? 0)),
                    'school_year'       => $fee?->school_year ?? '',
                ];
            });

        $fullyPaidMale   = $fullyPaidStudents->where('gender', 'male')->values();
        $fullyPaidFemale = $fullyPaidStudents->where('gender', 'female')->values();

        $schoolYears = ExamApproval::distinct()->pluck('school_year')->sort()->values();

        return Inertia::render($this->viewPrefix() . '/exam-approval/index', [
            'approvals'       => $approvals,
            'eligibleStudents' => $eligibleStudents,
            'fullyPaidMale'   => $fullyPaidMale,
            'fullyPaidFemale' => $fullyPaidFemale,
            'examTypes'       => ExamApproval::EXAM_TYPES,
            'terms'           => ExamApproval::TERMS,
            'schoolYears'     => $schoolYears,
            'filters'         => $request->only(['search', 'status', 'exam_type', 'school_year']),
        ]);
    }

    /**
     * Store a new exam approval request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'school_year' => 'required|string',
            'exam_type' => 'required|string',
            'term' => 'nullable|string',
            'required_amount' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        // Get the student's current paid amount
        $studentFee = StudentFee::where('student_id', $validated['student_id'])
            ->where('school_year', $validated['school_year'])
            ->first();

        $validated['paid_amount'] = $studentFee ? $studentFee->total_paid : 0;

        ExamApproval::create($validated);

        return redirect()->back()->with('success', 'Exam approval request created successfully.');
    }

    /**
     * Approve an exam request.
     */
    public function approve(ExamApproval $approval): RedirectResponse
    {
        if (!$approval->canBeApproved()) {
            return redirect()->back()->with('error', 'Student has not paid the required amount.');
        }

        $approval->approve(auth()->id());

        return redirect()->back()->with('success', 'Exam approved successfully.');
    }

    /**
     * Deny an exam request.
     */
    public function deny(Request $request, ExamApproval $approval): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string',
        ]);

        $approval->deny(auth()->id(), $validated['remarks'] ?? null);

        return redirect()->back()->with('success', 'Exam approval denied.');
    }

    /**
     * Update the paid amount and check for auto-approval.
     */
    public function updatePaidAmount(Request $request, ExamApproval $approval): RedirectResponse
    {
        $validated = $request->validate([
            'paid_amount' => 'required|numeric|min:0',
        ]);

        $approval->update($validated);

        // Auto-approve if paid amount meets required amount
        if ($approval->canBeApproved() && $approval->status === 'pending') {
            $approval->approve(auth()->id());
            return redirect()->back()->with('success', 'Payment recorded and exam auto-approved.');
        }

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Delete an exam approval.
     */
    public function destroy(ExamApproval $approval): RedirectResponse
    {
        $approval->delete();

        return redirect()->back()->with('success', 'Exam approval deleted successfully.');
    }

    /**
     * Bulk approve eligible students.
     */
    public function bulkApprove(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'approval_ids' => 'required|array',
            'approval_ids.*' => 'exists:exam_approvals,id',
        ]);

        $approved = 0;
        foreach ($validated['approval_ids'] as $id) {
            $approval = ExamApproval::find($id);
            if ($approval && $approval->canBeApproved() && $approval->status === 'pending') {
                $approval->approve(auth()->id());
                $approved++;
            }
        }

        return redirect()->back()->with('success', "{$approved} exam(s) approved successfully.");
    }
}
