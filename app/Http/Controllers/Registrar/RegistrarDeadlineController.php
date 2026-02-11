<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AcademicDeadline;
use App\Models\Requirement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrarDeadlineController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicDeadline::query()->with('requirements');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Classification filter
        if ($request->filled('classification') && $request->input('classification') !== 'all') {
            $query->where('classification', $request->input('classification'));
        }

        // Applies To filter
        if ($request->filled('applies_to') && $request->input('applies_to') !== 'all') {
            $query->where('applies_to', $request->input('applies_to'));
        }

        // Status filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $isActive = $request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }

        $deadlines = $query->latest()->paginate(10)->withQueryString();

        // Get all active requirements for the form
        $requirements = Requirement::with('category')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('registrar/deadlines/index', [
            'deadlines' => $deadlines,
            'requirements' => $requirements,
            'filters' => $request->only(['search', 'classification', 'applies_to', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'classification' => 'required|in:K-12,College',
            'deadline_date' => 'required|date',
            'deadline_time' => 'nullable|date_format:H:i',
            'applies_to' => 'required|in:all,new_enrollee,transferee,returning',
            'send_reminder' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:30',
            'is_active' => 'boolean',
            'requirement_ids' => 'nullable|array',
            'requirement_ids.*' => 'exists:requirements,id',
        ]);

        $requirementIds = $validated['requirement_ids'] ?? [];
        unset($validated['requirement_ids']);

        // Auto-generate deadline name from requirements and date
        if (!empty($requirementIds)) {
            $requirements = Requirement::whereIn('id', $requirementIds)->pluck('name')->toArray();
            $validated['name'] = implode(', ', array_slice($requirements, 0, 3)) . 
                (count($requirements) > 3 ? ' +' . (count($requirements) - 3) . ' more' : '') .
                ' - Due ' . date('M d, Y', strtotime($validated['deadline_date']));
        } else {
            $validated['name'] = $validated['classification'] . ' Deadline - ' . date('M d, Y', strtotime($validated['deadline_date']));
        }
        $validated['description'] = 'Auto-generated deadline for selected requirements';

        $deadline = AcademicDeadline::create($validated);

        // Link selected requirements to this deadline
        if (!empty($requirementIds)) {
            Requirement::whereIn('id', $requirementIds)->update(['deadline_id' => $deadline->id]);
        }

        return redirect()->back()->with('success', 'Deadline created successfully.');
    }

    public function update(Request $request, AcademicDeadline $deadline)
    {
        $validated = $request->validate([
            'classification' => 'required|in:K-12,College',
            'deadline_date' => 'required|date',
            'deadline_time' => 'nullable|date_format:H:i',
            'applies_to' => 'required|in:all,new_enrollee,transferee,returning',
            'send_reminder' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:30',
            'is_active' => 'boolean',
            'requirement_ids' => 'nullable|array',
            'requirement_ids.*' => 'exists:requirements,id',
        ]);

        $requirementIds = $validated['requirement_ids'] ?? [];
        unset($validated['requirement_ids']);

        // Auto-generate deadline name from requirements and date
        if (!empty($requirementIds)) {
            $requirements = Requirement::whereIn('id', $requirementIds)->pluck('name')->toArray();
            $validated['name'] = implode(', ', array_slice($requirements, 0, 3)) . 
                (count($requirements) > 3 ? ' +' . (count($requirements) - 3) . ' more' : '') .
                ' - Due ' . date('M d, Y', strtotime($validated['deadline_date']));
        } else {
            $validated['name'] = $validated['classification'] . ' Deadline - ' . date('M d, Y', strtotime($validated['deadline_date']));
        }
        $validated['description'] = 'Auto-generated deadline for selected requirements';

        $deadline->update($validated);

        // Unlink old requirements from this deadline
        Requirement::where('deadline_id', $deadline->id)
            ->whereNotIn('id', $requirementIds)
            ->update(['deadline_id' => null]);

        // Link new requirements to this deadline
        if (!empty($requirementIds)) {
            Requirement::whereIn('id', $requirementIds)->update(['deadline_id' => $deadline->id]);
        }

        return redirect()->back()->with('success', 'Deadline updated successfully.');
    }

    public function destroy(AcademicDeadline $deadline)
    {
        // Unlink requirements before deleting
        Requirement::where('deadline_id', $deadline->id)->update(['deadline_id' => null]);

        $deadline->delete();

        return redirect()->back()->with('success', 'Deadline deleted successfully.');
    }
}
