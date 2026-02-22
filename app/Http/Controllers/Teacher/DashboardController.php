<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user    = $request->user();
        $teacher = $user->teacher;

        // Sections where this teacher is the adviser
        $mySectionIds = Section::where('teacher_id', $teacher?->id)
            ->where('is_active', true)
            ->pluck('id');

        $mySections = Section::whereIn('id', $mySectionIds)
            ->with('yearLevel:id,name')
            ->get(['id', 'name', 'year_level_id', 'room_number']);

        // Students in those sections
        $myStudentCount = Student::whereIn('section_id', $mySectionIds)->count();

        // Enrolled students in my sections
        $enrolledCount = Student::whereIn('section_id', $mySectionIds)
            ->where('enrollment_status', 'enrolled')
            ->count();

        // Quizzes by this teacher
        $myQuizzes = Quiz::where('teacher_id', $teacher?->id)->get(['id', 'title', 'is_published', 'created_at']);
        $publishedQuizzes = $myQuizzes->where('is_published', true)->count();
        $draftQuizzes     = $myQuizzes->where('is_published', false)->count();

        // Recent quiz attempts (this week)
        $recentAttempts = QuizAttempt::whereHas('quiz', fn ($q) => $q->where('teacher_id', $teacher?->id))
            ->where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->count();

        // Recent quizzes (latest 5 created)
        $recentQuizzes = Quiz::where('teacher_id', $teacher?->id)
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'is_published', 'created_at']);

        return Inertia::render('teacher/dashboard', [
            'teacher' => $teacher ? [
                'id'             => $teacher->id,
                'full_name'      => $teacher->full_name,
                'specialization' => $teacher->specialization,
                'department'     => $teacher->department?->name,
                'employee_id'    => $teacher->employee_id,
                'photo_url'      => $teacher->photo_url,
            ] : null,
            'stats' => [
                'mySections'      => $mySectionIds->count(),
                'myStudents'      => $myStudentCount,
                'enrolledStudents'=> $enrolledCount,
                'totalQuizzes'    => $myQuizzes->count(),
                'publishedQuizzes'=> $publishedQuizzes,
                'draftQuizzes'    => $draftQuizzes,
                'recentAttempts'  => $recentAttempts,
            ],
            'sections'     => $mySections,
            'recentQuizzes'=> $recentQuizzes,
        ]);
    }
}

