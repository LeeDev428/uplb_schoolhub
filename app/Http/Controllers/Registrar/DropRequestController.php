<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\DropRequest;
use App\Models\FeeCategory;
use App\Models\FeeItem;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DropRequestController extends Controller
{
    /**
     * Display all drop requests for registrar management.
     */
    public function index(Request $request): Response
    {
        $query = DropRequest::with([
            'student:id,first_name,last_name,middle_name,suffix,lrn,email,program,year_level,section,student_photo_url,enrollment_status,department_id',
            'student.department:id,name,classification',
            'registrarApprovedBy:id,name',
            'feeItems',
        ]);

        // Filter by registrar_status
        $tab = $request->input('tab', 'pending');
        if ($tab && $tab !== 'all') {
            $query->where('registrar_status', $tab);
        }

        // Search
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $requests = $query->latest()->paginate(20)->withQueryString();

        $requests->getCollection()->transform(function ($r) {
            return [
                'id' => $r->id,
                'reason' => $r->reason,
                'status' => $r->status,
                'registrar_status' => $r->registrar_status,
                'accounting_status' => $r->accounting_status,
                'semester' => $r->semester,
                'school_year' => $r->school_year,
                'registrar_remarks' => $r->registrar_remarks,
                'fee_amount' => (float) $r->fee_amount,
                'is_paid' => $r->is_paid,
                'registrar_approved_by' => $r->registrarApprovedBy ? [
                    'id' => $r->registrarApprovedBy->id,
                    'name' => $r->registrarApprovedBy->name,
                ] : null,
                'registrar_approved_at' => $r->registrar_approved_at?->format('M d, Y h:i A'),
                'created_at' => $r->created_at->format('M d, Y h:i A'),
                'fee_items' => $r->feeItems->map(fn($fi) => [
                    'id' => $fi->id,
                    'name' => $fi->name,
                    'amount' => (float) $fi->pivot->amount,
                ]),
                'student' => $r->student ? [
                    'id' => $r->student->id,
                    'full_name' => $r->student->full_name,
                    'lrn' => $r->student->lrn,
                    'email' => $r->student->email,
                    'program' => $r->student->program,
                    'year_level' => $r->student->year_level,
                    'section' => $r->student->section,
                    'student_photo_url' => $r->student->student_photo_url,
                    'enrollment_status' => $r->student->enrollment_status,
                    'classification' => $r->student->department?->classification,
                ] : null,
            ];
        });

        // Stats
        $stats = [
            'pending' => DropRequest::where('registrar_status', 'pending')->count(),
            'approved' => DropRequest::where('registrar_status', 'approved')->count(),
            'rejected' => DropRequest::where('registrar_status', 'rejected')->count(),
        ];

        // Get drop fee items for selection
        $dropFeeItems = FeeItem::whereHas('category', function ($q) {
            $q->where('name', 'like', '%Drop%');
        })->where('is_active', true)->get()->map(fn($item) => [
            'id' => $item->id,
            'name' => $item->name,
            'selling_price' => (float) $item->selling_price,
            'category' => $item->category?->name,
        ]);

        $dropSettings = AppSetting::current();

        return Inertia::render('registrar/drop-requests/index', [
            'requests' => $requests,
            'stats' => $stats,
            'tab' => $tab,
            'filters' => $request->only(['search']),
            'dropFeeItems' => $dropFeeItems,
            'dropRequestDeadline' => $dropSettings->drop_request_deadline?->format('Y-m-d'),
        ]);
    }

    /**
     * Set the global drop request submission deadline.
     */
    public function setDeadline(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'drop_request_deadline' => 'nullable|date',
        ]);

        AppSetting::current()->update([
            'drop_request_deadline' => $validated['drop_request_deadline'] ?? null,
        ]);

        return back()->with('success', $validated['drop_request_deadline']
            ? 'Drop request deadline set to ' . date('M d, Y', strtotime($validated['drop_request_deadline'])) . '.'
            : 'Drop request deadline cleared.');
    }

    /**
     * Approve a drop request (registrar stage - first approval).
     */
    public function approve(Request $request, DropRequest $dropRequest): RedirectResponse
    {
        if ($dropRequest->registrar_status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        $validated = $request->validate([
            'registrar_remarks' => 'nullable|string|max:1000',
            'fee_item_ids' => 'nullable|array',
            'fee_item_ids.*' => 'exists:fee_items,id',
        ]);

        // Approve at registrar level (forwards to accounting)
        $dropRequest->approveByRegistrar(
            Auth::id(),
            $validated['registrar_remarks'] ?? null
        );

        // Attach fee items if selected
        if (!empty($validated['fee_item_ids'])) {
            $feeItemsData = [];
            $totalFee = 0;

            foreach ($validated['fee_item_ids'] as $feeItemId) {
                $feeItem = FeeItem::find($feeItemId);
                if ($feeItem) {
                    $amount = (float) $feeItem->selling_price;
                    $feeItemsData[$feeItemId] = ['amount' => $amount];
                    $totalFee += $amount;
                }
            }

            $dropRequest->feeItems()->sync($feeItemsData);
            $dropRequest->update(['fee_amount' => $totalFee]);
        }

        return back()->with('success', 'Drop request approved and forwarded to accounting for final approval.');
    }

    /**
     * Reject a drop request (registrar stage).
     */
    public function reject(Request $request, DropRequest $dropRequest): RedirectResponse
    {
        if ($dropRequest->registrar_status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $validated = $request->validate([
            'registrar_remarks' => 'required|string|max:1000',
        ]);

        $dropRequest->rejectByRegistrar(
            Auth::id(),
            $validated['registrar_remarks']
        );

        return back()->with('success', 'Drop request rejected.');
    }

    /**
     * Reactivate a dropped student.
     */
    public function reactivate(Student $student): RedirectResponse
    {
        if ($student->enrollment_status !== 'dropped') {
            return back()->with('error', 'Only dropped students can be reactivated.');
        }

        $student->update([
            'enrollment_status' => 'not-enrolled',
            'is_active' => true,
        ]);

        return back()->with('success', 'Student has been reactivated and can now log in again.');
    }

    /**
     * Get applicable drop fee items for a specific drop request.
     * Filters fee items based on the student's classification, department, program, year level, and section.
     */
    public function getApplicableFeeItems(DropRequest $dropRequest)
    {
        $student = $dropRequest->student;
        
        if (!$student) {
            return response()->json(['feeItems' => []]);
        }

        // Load department for classification
        $student->load('department');

        $feeItems = FeeItem::whereHas('category', function ($q) {
            $q->where('name', 'like', '%Drop%');
        })
            ->where('is_active', true)
            ->where(function ($query) use ($student) {
                // Items for ALL students (only if no explicit assignments exist)
                $query->where(function ($inner) {
                        $inner->where(function ($i) {
                            $i->where('assignment_scope', 'all')
                              ->orWhereNull('assignment_scope');
                        })->whereDoesntHave('assignments');
                    })
                    // Items with 'specific' scope that have at least one filter set and match this student
                    ->orWhere(function ($q) use ($student) {
                        $q->where('assignment_scope', 'specific')
                          ->where(function ($inner) {
                              $inner->whereNotNull('classification')
                                    ->orWhereNotNull('department_id')
                                    ->orWhereNotNull('program_id')
                                    ->orWhereNotNull('year_level_id')
                                    ->orWhereNotNull('section_id');
                          });
                        $this->applyStudentFilters($q, $student);
                    })
                    ->orWhereHas('assignments', function ($q) use ($student) {
                        $this->applyAssignmentFilters($q, $student);
                    });
            })
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'selling_price' => (float) $item->selling_price,
                'category' => $item->category?->name,
            ]);

        return response()->json(['feeItems' => $feeItems]);
    }

    /**
     * Apply student-specific filters to fee item query.
     */
    private function applyStudentFilters($query, Student $student): void
    {
        // Match classification if set
        if ($student->department) {
            $query->where(function ($sq) use ($student) {
                $sq->whereNull('classification')
                    ->orWhere('classification', $student->department->classification);
            });
        }

        // Match department if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('department_id')
                ->orWhere('department_id', $student->department_id);
        });

        // Note: program_id not filtered — Student model has no program_id FK;
        // department_id provides sufficient program-level scoping for College.

        // Match year level if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('year_level_id')
                ->orWhere('year_level_id', $student->year_level_id);
        });

        // Match section if set
        $query->where(function ($sq) use ($student) {
            $sq->whereNull('section_id')
                ->orWhere('section_id', $student->section_id);
        });
    }

    /**
     * Apply student-specific filters to fee_item_assignments query.
     */
    private function applyAssignmentFilters($query, Student $student): void
    {
        $query->where('is_active', true);

        if (!$student->department_id) {
            $query->whereRaw('1 = 0');
            return;
        }

        if ($student->department) {
            $query->where('classification', $student->department->classification);
        }

        $query->where('department_id', $student->department_id);

        if ($student->year_level_id) {
            $query->where('year_level_id', $student->year_level_id);
        }
    }
}
