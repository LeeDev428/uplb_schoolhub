<?php

namespace App\Http\Controllers\Registrar;

use App\Http\Controllers\Controller;
use App\Models\AcademicDeadline;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrarDeadlineController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicDeadline::query();

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

        return Inertia::render('registrar/deadlines/index', [
            'deadlines' => $deadlines,
            'filters' => $request->only(['search', 'classification', 'applies_to', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'classification' => 'required|in:K-12,College',
            'deadline_date' => 'required|date',
            'deadline_time' => 'nullable|date_format:H:i',
            'applies_to' => 'required|in:all,new_enrollee,transferee,returning',
            'send_reminder' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:30',
            'is_active' => 'boolean',
        ]);

        AcademicDeadline::create($validated);

        return redirect()->back()->with('success', 'Deadline created successfully.');
    }

    public function update(Request $request, AcademicDeadline $deadline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'classification' => 'required|in:K-12,College',
            'deadline_date' => 'required|date',
            'deadline_time' => 'nullable|date_format:H:i',
            'applies_to' => 'required|in:all,new_enrollee,transferee,returning',
            'send_reminder' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:30',
            'is_active' => 'boolean',
        ]);

        $deadline->update($validated);

        return redirect()->back()->with('success', 'Deadline updated successfully.');
    }

    public function destroy(AcademicDeadline $deadline)
    {
        $deadline->delete();

        return redirect()->back()->with('success', 'Deadline deleted successfully.');
    }
}
