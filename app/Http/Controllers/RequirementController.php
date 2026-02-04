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
            $query->orderBy('order');
        }])
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('registrar/documents/create', [
            'categories' => $categories,
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

        // Ensure boolean fields are set with default values if not provided
        $validated['applies_to_new_enrollee'] = $validated['applies_to_new_enrollee'] ?? false;
        $validated['applies_to_transferee'] = $validated['applies_to_transferee'] ?? false;
        $validated['applies_to_returning'] = $validated['applies_to_returning'] ?? false;
        $validated['is_required'] = $validated['is_required'] ?? true;

        Requirement::create($validated);

        return back()->with('success', 'Requirement created successfully');
    }

    /**
     * Update the specified requirement.
     */
    public function update(Request $request, Requirement $requirement)
    {
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

        // Ensure boolean fields are set with default values if not provided
        $validated['applies_to_new_enrollee'] = $validated['applies_to_new_enrollee'] ?? false;
        $validated['applies_to_transferee'] = $validated['applies_to_transferee'] ?? false;
        $validated['applies_to_returning'] = $validated['applies_to_returning'] ?? false;
        $validated['is_required'] = $validated['is_required'] ?? true;

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
