<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\GuidanceRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['department:id,name', 'section:id,name'])
            ->withCount('guidanceRecords')
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        if ($request->filled('has_records') && $request->input('has_records') === '1') {
            $query->whereHas('guidanceRecords');
        }

        $students = $query->paginate(20)->withQueryString();

        return Inertia::render('guidance/students/index', [
            'students' => $students,
            'filters'  => $request->only(['search', 'has_records']),
        ]);
    }

    public function show(Student $student)
    {
        $student->load([
            'department:id,name',
            'section:id,name',
            'section.yearLevel:id,name',
            'guidanceRecords' => fn ($q) => $q->with('counselor:id,name')->orderByDesc('created_at'),
        ]);

        return Inertia::render('guidance/students/show', [
            'student' => $student,
        ]);
    }
}
