<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\GuidanceRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $teacher = $user->teacher;

        return Inertia::render('teacher/dashboard', [
            'stats' => [
                'totalStudents' => Student::count(),
                'totalSections' => Section::where('is_active', true)->count(),
                'recentRecords' => GuidanceRecord::where('counselor_id', $user->id)->count(),
            ],
            'teacher' => $teacher,
        ]);
    }
}
