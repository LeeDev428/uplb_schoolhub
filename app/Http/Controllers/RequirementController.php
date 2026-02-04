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

        return Inertia::render('registrar/requirements/index', [
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
            'applies_to_new_enrollee' => 'boolean',
            'applies_to_transferee' => 'boolean',
            'applies_to_returning' => 'boolean',
            'is_required' => 'boolean',
            'order' => 'nullable|integer',
        ]);

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
            'applies_to_new_enrollee' => 'boolean',
            'applies_to_transferee' => 'boolean',
            'applies_to_returning' => 'boolean',
            'is_required' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        $requirement->update($validated);

        return back()->with('success', 'Requirement updated successfully');
    }

    /**
     * Remove the specified requirement.
     */
    public function destroy(Requirement $requirement)
    {
        $requirement->delete();

        return back()->with('success', 'Requirement deleted successfully');
    }
}
