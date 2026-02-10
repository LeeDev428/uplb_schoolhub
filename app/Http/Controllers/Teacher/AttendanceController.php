<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        if ($request->filled('section') && $request->section !== 'all') {
            $query->where('section', $request->section);
        }

        $students = $query->orderBy('last_name')->paginate(25)->withQueryString();

        $sections = Section::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('teacher/attendance/index', [
            'students' => $students,
            'sections' => $sections,
            'filters' => [
                'search' => $request->search,
                'section' => $request->section,
            ],
        ]);
    }
}
