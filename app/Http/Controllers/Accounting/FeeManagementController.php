<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\FeeCategory;
use App\Models\FeeItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeManagementController extends Controller
{
    /**
     * Display a listing of fee categories and items.
     */
    public function index(Request $request): Response
    {
        $categories = FeeCategory::with(['items' => function ($query) {
            $query->orderBy('name');
        }])
        ->ordered()
        ->get()
        ->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'code' => $category->code,
                'description' => $category->description,
                'is_active' => $category->is_active,
                'sort_order' => $category->sort_order,
                'items' => $category->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'code' => $item->code,
                        'description' => $item->description,
                        'cost_price' => $item->cost_price,
                        'selling_price' => $item->selling_price,
                        'profit' => $item->profit,
                        'school_year' => $item->school_year,
                        'program' => $item->program,
                        'year_level' => $item->year_level,
                        'is_required' => $item->is_required,
                        'is_active' => $item->is_active,
                    ];
                }),
                'total_cost' => $category->activeItems->sum('cost_price'),
                'total_selling' => $category->activeItems->sum('selling_price'),
                'total_profit' => $category->activeItems->sum('selling_price') - $category->activeItems->sum('cost_price'),
            ];
        });

        return Inertia::render('accounting/fee-management/index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new fee category.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:fee_categories',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        FeeCategory::create($validated);

        return redirect()->back()->with('success', 'Fee category created successfully.');
    }

    /**
     * Update a fee category.
     */
    public function updateCategory(Request $request, FeeCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:fee_categories,code,' . $category->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Fee category updated successfully.');
    }

    /**
     * Delete a fee category.
     */
    public function destroyCategory(FeeCategory $category): RedirectResponse
    {
        $category->delete();

        return redirect()->back()->with('success', 'Fee category deleted successfully.');
    }

    /**
     * Store a new fee item.
     */
    public function storeItem(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fee_category_id' => 'required|exists:fee_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'school_year' => 'nullable|string',
            'program' => 'nullable|string',
            'year_level' => 'nullable|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ]);

        FeeItem::create($validated);

        return redirect()->back()->with('success', 'Fee item created successfully.');
    }

    /**
     * Update a fee item.
     */
    public function updateItem(Request $request, FeeItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'fee_category_id' => 'required|exists:fee_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'school_year' => 'nullable|string',
            'program' => 'nullable|string',
            'year_level' => 'nullable|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', 'Fee item updated successfully.');
    }

    /**
     * Delete a fee item.
     */
    public function destroyItem(FeeItem $item): RedirectResponse
    {
        $item->delete();

        return redirect()->back()->with('success', 'Fee item deleted successfully.');
    }
}
