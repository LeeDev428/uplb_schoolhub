<?php

namespace App\Http\Controllers;

use App\Models\Requirement;
use App\Models\RequirementCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequirementController extends Controller
{
    /**
     * Display a listing of the requirements.
     */
    public function index()
    {
        $categories = RequirementCategory::with(['requirements' => function ($query) {
            $query->with('deadline')->orderBy('order');
        }])
            ->active()
            ->ordered()
            ->get();

        $deadlines = \App\Models\AcademicDeadline::where('is_active', true)
            ->orderBy('deadline_date')
            ->get();

        return Inertia::render('registrar/documents/create', [
            'categories' => $categories,
            'deadlines' => $deadlines,
        ]);
    }

    /**
     * Store a newly created requirement category.
     */
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        $validated['slug'] = str($validated['name'])->slug();

        RequirementCategory::create($validated);

        return back()->with('success', 'Category created successfully');
    }

    /**
     * Store a newly created requirement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'requirement_category_id' => 'required|exists:requirement_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline_type' => 'required|in:during_enrollment,before_classes,custom',
            'custom_deadline' => 'nullable|required_if:deadline_type,custom|date',
            'applies_to_new_enrollee' => 'nullable|boolean',
            'applies_to_transferee' => 'nullable|boolean',
            'applies_to_returning' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        // Convert boolean fields properly (handle false, 0, "0", "false")
        $validated['applies_to_new_enrollee'] = filter_var($validated['applies_to_new_enrollee'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['applies_to_transferee'] = filter_var($validated['applies_to_transferee'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['applies_to_returning'] = filter_var($validated['applies_to_returning'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['is_required'] = isset($validated['is_required']) ? filter_var($validated['is_required'], FILTER_VALIDATE_BOOLEAN) : true;

        $requirement = Requirement::create($validated);

        // Automatically assign this requirement to existing students based on applicability
        $this->assignRequirementToExistingStudents($requirement);

        return back()->with('success', 'Requirement created successfully and assigned to applicable students');
    }

    /**
     * Assign a requirement to existing students based on applicability
     */
    private function assignRequirementToExistingStudents(Requirement $requirement)
    {
        $studentQuery = \App\Models\Student::query();
        
        // Filter students based on requirement applicability
        $studentTypes = [];
        if ($requirement->applies_to_new_enrollee) {
            $studentTypes[] = 'new';
        }
        if ($requirement->applies_to_transferee) {
            $studentTypes[] = 'transferee';
        }
        if ($requirement->applies_to_returning) {
            $studentTypes[] = 'returnee';
        }

        // If no specific student types selected, don't assign to any existing students
        if (empty($studentTypes)) {
            return;
        }

        $students = $studentQuery->whereIn('student_type', $studentTypes)->get();

        // Create StudentRequirement records for each applicable student
        foreach ($students as $student) {
            // Check if student already has this requirement
            $exists = \App\Models\StudentRequirement::where('student_id', $student->id)
                ->where('requirement_id', $requirement->id)
                ->exists();

            if (!$exists) {
                \App\Models\StudentRequirement::create([
                    'student_id' => $student->id,
                    'requirement_id' => $requirement->id,
                    'status' => 'pending',
                ]);
            }
        }
    }

    /**
     * Update the specified requirement.
     */
    public function update(Request $request, Requirement $requirement)
    {
        // Debug: Log what we received
        \Log::info('=== UPDATE REQUIREMENT ===');
        \Log::info('Request Data:', $request->all());
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline_type' => 'required|in:during_enrollment,before_classes,custom',
            'custom_deadline' => 'nullable|required_if:deadline_type,custom|date',
            'applies_to_new_enrollee' => 'nullable|boolean',
            'applies_to_transferee' => 'nullable|boolean',
            'applies_to_returning' => 'nullable|boolean',
            'is_required' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        \Log::info('Validated Data:', $validated);

        // Convert boolean fields properly (handle false, 0, "0", "false")
        $validated['applies_to_new_enrollee'] = filter_var($validated['applies_to_new_enrollee'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['applies_to_transferee'] = filter_var($validated['applies_to_transferee'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['applies_to_returning'] = filter_var($validated['applies_to_returning'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['is_required'] = isset($validated['is_required']) ? filter_var($validated['is_required'], FILTER_VALIDATE_BOOLEAN) : true;

        \Log::info('After filter_var:', [
            'applies_to_new_enrollee' => $validated['applies_to_new_enrollee'],
            'applies_to_transferee' => $validated['applies_to_transferee'],
            'applies_to_returning' => $validated['applies_to_returning'],
            'is_required' => $validated['is_required'],
        ]);

        $requirement->update($validated);

        return back()->with('success', 'Requirement updated successfully');
    }

    /**
     * Remove the specified requirement.
     */
    public function destroy(Requirement $requirement)
    {
        $requirement->forceDelete(); // Permanently delete instead of soft delete

        return back()->with('success', 'Requirement deleted successfully');
    }
}
