<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentListController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query()
            ->select('id', 'first_name', 'last_name', 'middle_name', 'suffix',
                     'lrn', 'gender', 'program', 'year_level', 'section',
                     'enrollment_status', 'student_photo_url')
            ->whereNull('deleted_at');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name',  'like', "%{$search}%")
                  ->orWhere('lrn',        'like', "%{$search}%");
            });
        }

        if ($request->filled('program') && $request->input('program') !== 'all') {
            $query->where('program', $request->input('program'));
        }

        if ($request->filled('year_level') && $request->input('year_level') !== 'all') {
            $query->where('year_level', $request->input('year_level'));
        }

        if ($request->filled('enrollment_status') && $request->input('enrollment_status') !== 'all') {
            $query->where('enrollment_status', $request->input('enrollment_status'));
        }

        // Always sort A-Z by last name within gender groups
        $all = $query->orderBy('last_name')->orderBy('first_name')->get();

        $male   = $all->filter(fn($s) => strtolower($s->gender ?? '') === 'male')->values();
        $female = $all->filter(fn($s) => strtolower($s->gender ?? '') === 'female')->values();

        $stats = [
            'total'  => $all->count(),
            'male'   => $male->count(),
            'female' => $female->count(),
        ];

        $programs    = Student::whereNotNull('program')->distinct()->pluck('program')->sort()->values();
        $yearLevels  = Student::whereNotNull('year_level')->distinct()->pluck('year_level')->sort()->values();

        return Inertia::render('owner/students/index', [
            'male'    => $male,
            'female'  => $female,
            'stats'   => $stats,
            'programs'   => $programs,
            'yearLevels' => $yearLevels,
            'filters' => $request->only(['search', 'program', 'year_level', 'enrollment_status']),
        ]);
    }
}
