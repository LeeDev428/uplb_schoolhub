<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\FeeCategory;
use App\Models\FeeItem;
use App\Models\Program;
use App\Models\Section;
use App\Models\YearLevel;
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
                        'fee_category_id' => $item->fee_category_id,
                        'name' => $item->name,
                        'code' => $item->code,
                        'description' => $item->description,
                        'cost_price' => $item->cost_price,
                        'selling_price' => $item->selling_price,
                        'profit' => $item->profit,
                        'school_year' => $item->school_year,
                        'program' => $item->program,
                        'year_level' => $item->year_level,
                        'classification' => $item->classification,
                        'department_id' => $item->department_id,
                        'program_id' => $item->program_id,
                        'year_level_id' => $item->year_level_id,
                        'section_id' => $item->section_id,
                        'assignment_scope' => $item->assignment_scope,
                        'department' => $item->department,
                        'program_relation' => $item->program,
                        'year_level_relation' => $item->yearLevel,
                        'section' => $item->section,
                        'is_required' => $item->is_required,
                        'is_active' => $item->is_active,
                    ];
                }),
                'total_cost' => $category->activeItems->sum('cost_price'),
                'total_selling' => $category->activeItems->sum('selling_price'),
                'total_profit' => $category->activeItems->sum('selling_price') - $category->activeItems->sum('cost_price'),
            ];
        });

        // Calculate totals
        $totals = [
            'cost' => $categories->sum('total_cost'),
            'selling' => $categories->sum('total_selling'),
            'profit' => $categories->sum('total_profit'),
        ];

        // Get all departments, programs, year levels, sections for assignment dropdowns
        $departments = Department::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'classification']);
        
        $programs = Program::where('is_active', true)
            ->with('department:id,classification')
            ->orderBy('name')
            ->get(['id', 'name', 'department_id'])
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'department_id' => $program->department_id,
                    'classification' => $program->department ? $program->department->classification : null,
                ];
            });
            
        $yearLevels = YearLevel::where('is_active', true)
            ->with('department:id,classification')
            ->orderBy('level_number')
            ->get(['id', 'name', 'department_id', 'level_number'])
            ->map(function ($yearLevel) {
                return [
                    'id' => $yearLevel->id,
                    'name' => $yearLevel->name,
                    'department_id' => $yearLevel->department_id,
                    'level_number' => $yearLevel->level_number,
                    'classification' => $yearLevel->department ? $yearLevel->department->classification : null,
                ];
            });
            
        $sections = Section::where('is_active', true)
            ->with('department:id,classification')
            ->orderBy('name')
            ->get(['id', 'name', 'year_level_id', 'department_id'])
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'year_level_id' => $section->year_level_id,
                    'department_id' => $section->department_id,
                    'classification' => $section->department ? $section->department->classification : null,
                ];
            });

        return Inertia::render('accounting/fee-management/index', [
            'categories' => $categories,
            'totals' => $totals,
            'departments' => $departments,
            'programs' => $programs,
            'yearLevels' => $yearLevels,
            'sections' => $sections,
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
            'school_year' => 'required|string',
            'program' => 'nullable|string',
            'year_level' => 'nullable|string',
            'classification' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'program_id' => 'nullable|exists:programs,id',
            'year_level_id' => 'nullable|exists:year_levels,id',
            'section_id' => 'nullable|exists:sections,id',
            'assignment_scope' => 'required|in:all,specific',
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
            'school_year' => 'required|string',
            'program' => 'nullable|string',
            'year_level' => 'nullable|string',
            'classification' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'program_id' => 'nullable|exists:programs,id',
            'year_level_id' => 'nullable|exists:year_levels,id',
            'section_id' => 'nullable|exists:sections,id',
            'assignment_scope' => 'required|in:all,specific',
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
