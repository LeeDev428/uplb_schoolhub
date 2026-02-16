<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Grant;
use App\Models\GrantRecipient;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GrantController extends Controller
{
    /**
     * Display grant library and recipients.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'library');

        // Get all grants for library tab
        $grants = Grant::withCount(['recipients', 'activeRecipients'])
            ->orderBy('name')
            ->get()
            ->map(function ($grant) {
                return [
                    'id' => $grant->id,
                    'name' => $grant->name,
                    'code' => $grant->code,
                    'description' => $grant->description,
                    'type' => $grant->type,
                    'value' => $grant->value,
                    'formatted_value' => $grant->formatted_value,
                    'school_year' => $grant->school_year,
                    'is_active' => $grant->is_active,
                    'recipients_count' => $grant->recipients_count,
                    'active_recipients_count' => $grant->active_recipients_count,
                ];
            });

        // Get recipients for recipients tab
        $recipientsQuery = GrantRecipient::with(['student', 'grant', 'assignedBy']);

        if ($search = $request->input('search')) {
            $recipientsQuery->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        if ($grantId = $request->input('grant_id')) {
            $recipientsQuery->where('grant_id', $grantId);
        }

        if ($schoolYear = $request->input('school_year')) {
            $recipientsQuery->where('school_year', $schoolYear);
        }

        if ($status = $request->input('status')) {
            $recipientsQuery->where('status', $status);
        }

        $recipients = $recipientsQuery->latest()->paginate(20)->withQueryString();

        // Get students for assignment dropdown
        $students = Student::orderBy('last_name')->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'lrn' => $student->lrn,
                    'full_name' => $student->full_name,
                    'program' => $student->program,
                    'year_level' => $student->year_level,
                ];
            });

        $schoolYears = GrantRecipient::distinct()->pluck('school_year')->sort()->values();

        return Inertia::render('accounting/grants/index', [
            'tab' => $tab,
            'grants' => $grants,
            'recipients' => $recipients,
            'students' => $students,
            'schoolYears' => $schoolYears,
            'filters' => $request->only(['search', 'grant_id', 'school_year', 'status']),
        ]);
    }

    /**
     * Store a new grant.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:grants',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'school_year' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Grant::create($validated);

        return redirect()->back()->with('success', 'Grant created successfully.');
    }

    /**
     * Update a grant.
     */
    public function update(Request $request, Grant $grant): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:grants,code,' . $grant->id,
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'school_year' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $grant->update($validated);

        return redirect()->back()->with('success', 'Grant updated successfully.');
    }

    /**
     * Delete a grant.
     */
    public function destroy(Grant $grant): RedirectResponse
    {
        $grant->delete();

        return redirect()->back()->with('success', 'Grant deleted successfully.');
    }

    /**
     * Assign a grant to a student.
     */
    public function assignRecipient(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'grant_id' => 'required|exists:grants,id',
            'school_year' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $grant = Grant::findOrFail($validated['grant_id']);

        // Calculate discount amount based on student's fee
        $studentFee = StudentFee::where('student_id', $validated['student_id'])
            ->where('school_year', $validated['school_year'])
            ->first();

        $discountAmount = 0;
        if ($studentFee) {
            $discountAmount = $grant->calculateDiscount((float) $studentFee->total_amount);
        }

        // Check if grant already assigned for this student and school year
        $existingRecipient = GrantRecipient::where('student_id', $validated['student_id'])
            ->where('grant_id', $validated['grant_id'])
            ->where('school_year', $validated['school_year'])
            ->first();

        if ($existingRecipient) {
            return redirect()->back()->withErrors([
                'error' => 'This grant is already assigned to the student for the selected school year.'
            ]);
        }

        GrantRecipient::create([
            ...$validated,
            'discount_amount' => $discountAmount,
            'status' => 'active',
            'assigned_by' => auth()->id(),
            'assigned_at' => now(),
        ]);

        // Update student fee grant discount
        if ($studentFee) {
            $totalDiscount = GrantRecipient::where('student_id', $validated['student_id'])
                ->where('school_year', $validated['school_year'])
                ->where('status', 'active')
                ->sum('discount_amount');
            
            $studentFee->applyGrantDiscount($totalDiscount);
        }

        return redirect()->back()->with('success', 'Grant assigned successfully.');
    }

    /**
     * Update a recipient's status.
     */
    public function updateRecipient(Request $request, GrantRecipient $recipient): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,graduated,withdrawn',
            'notes' => 'nullable|string',
        ]);

        $recipient->update($validated);

        return redirect()->back()->with('success', 'Recipient updated successfully.');
    }

    /**
     * Remove a recipient.
     */
    public function removeRecipient(GrantRecipient $recipient): RedirectResponse
    {
        $studentId = $recipient->student_id;
        $schoolYear = $recipient->school_year;
        
        $recipient->delete();

        // Recalculate student fee grant discount
        $studentFee = StudentFee::where('student_id', $studentId)
            ->where('school_year', $schoolYear)
            ->first();

        if ($studentFee) {
            $totalDiscount = GrantRecipient::where('student_id', $studentId)
                ->where('school_year', $schoolYear)
                ->where('status', 'active')
                ->sum('discount_amount');
            
            $studentFee->applyGrantDiscount($totalDiscount);
        }

        return redirect()->back()->with('success', 'Recipient removed successfully.');
    }
}
