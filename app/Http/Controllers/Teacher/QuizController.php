<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAnswer;
use App\Models\Subject;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = Auth::user()->teacher;

        if (!$teacher) {
            abort(403, 'You must be a teacher to access this page.');
        }

        $query = Quiz::with(['subject', 'questions'])
            ->where('teacher_id', $teacher->id)
            ->withCount(['questions', 'attempts']);

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            } elseif ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $quizzes = $query->latest()->paginate(10)->withQueryString();

        $subjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teachers.id', $teacher->id);
        })->get();

        return Inertia::render('teacher/quizzes/index', [
            'quizzes' => $quizzes,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function create(): Response
    {
        $teacher = Auth::user()->teacher;

        $subjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teachers.id', $teacher->id);
        })->get();

        return Inertia::render('teacher/quizzes/create', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:0|max:100',
            'max_attempts' => 'required|integer|min:1',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
            'show_correct_answers' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'questions' => 'required|array|min:1',
            'questions.*.type' => 'required|in:multiple_choice,true_false,short_answer,essay',
            'questions.*.question' => 'required|string',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.answers' => 'required_unless:questions.*.type,essay|array',
            'questions.*.answers.*.answer' => 'required|string',
            'questions.*.answers.*.is_correct' => 'boolean',
        ]);

        $teacher = Auth::user()->teacher;

        try {
            DB::beginTransaction();

            $quiz = Quiz::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'subject_id' => $validated['subject_id'],
                'teacher_id' => $teacher->id,
                'department_id' => $teacher->department_id,
                'time_limit_minutes' => $validated['time_limit_minutes'] ?? null,
                'passing_score' => $validated['passing_score'],
                'max_attempts' => $validated['max_attempts'],
                'shuffle_questions' => $validated['shuffle_questions'] ?? false,
                'shuffle_answers' => $validated['shuffle_answers'] ?? false,
                'show_correct_answers' => $validated['show_correct_answers'] ?? true,
                'available_from' => $validated['available_from'] ?? null,
                'available_until' => $validated['available_until'] ?? null,
                'is_published' => false,
                'is_active' => true,
            ]);

            foreach ($validated['questions'] as $index => $questionData) {
                $question = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'type' => $questionData['type'],
                    'question' => $questionData['question'],
                    'explanation' => $questionData['explanation'] ?? null,
                    'points' => $questionData['points'],
                    'order' => $index + 1,
                ]);

                if (isset($questionData['answers']) && is_array($questionData['answers'])) {
                    foreach ($questionData['answers'] as $answerIndex => $answerData) {
                        QuizAnswer::create([
                            'question_id' => $question->id,
                            'answer' => $answerData['answer'],
                            'is_correct' => $answerData['is_correct'] ?? false,
                            'order' => $answerIndex + 1,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()->route('teacher.quizzes.index')
                ->with('success', 'Quiz created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create quiz. Please try again.']);
        }
    }

    public function show(Quiz $quiz): Response
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->load(['subject', 'questions.answers']);

        $attempts = QuizAttempt::with(['student.user'])
            ->where('quiz_id', $quiz->id)
            ->completed()
            ->latest('completed_at')
            ->paginate(10);

        $stats = [
            'total_attempts' => $quiz->attempts()->completed()->count(),
            'average_score' => $quiz->attempts()->completed()->avg('percentage') ?? 0,
            'highest_score' => $quiz->attempts()->completed()->max('percentage') ?? 0,
            'lowest_score' => $quiz->attempts()->completed()->min('percentage') ?? 0,
            'passed_count' => $quiz->attempts()->completed()->where('percentage', '>=', $quiz->passing_score)->count(),
        ];

        return Inertia::render('teacher/quizzes/show', [
            'quiz' => $quiz,
            'attempts' => $attempts,
            'stats' => $stats,
        ]);
    }

    public function edit(Quiz $quiz): Response
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->load(['questions.answers']);

        $subjects = Subject::whereHas('teachers', function ($q) use ($teacher) {
            $q->where('teachers.id', $teacher->id);
        })->get();

        return Inertia::render('teacher/quizzes/edit', [
            'quiz' => $quiz,
            'subjects' => $subjects,
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'time_limit_minutes' => 'nullable|integer|min:1',
            'passing_score' => 'required|integer|min:0|max:100',
            'max_attempts' => 'required|integer|min:1',
            'shuffle_questions' => 'boolean',
            'shuffle_answers' => 'boolean',
            'show_correct_answers' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'questions' => 'required|array|min:1',
            'questions.*.id' => 'nullable|exists:quiz_questions,id',
            'questions.*.type' => 'required|in:multiple_choice,true_false,short_answer,essay',
            'questions.*.question' => 'required|string',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.points' => 'required|integer|min:1',
            'questions.*.answers' => 'required_unless:questions.*.type,essay|array',
            'questions.*.answers.*.id' => 'nullable|exists:quiz_answers,id',
            'questions.*.answers.*.answer' => 'required|string',
            'questions.*.answers.*.is_correct' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $quiz->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'subject_id' => $validated['subject_id'],
                'time_limit_minutes' => $validated['time_limit_minutes'] ?? null,
                'passing_score' => $validated['passing_score'],
                'max_attempts' => $validated['max_attempts'],
                'shuffle_questions' => $validated['shuffle_questions'] ?? false,
                'shuffle_answers' => $validated['shuffle_answers'] ?? false,
                'show_correct_answers' => $validated['show_correct_answers'] ?? true,
                'available_from' => $validated['available_from'] ?? null,
                'available_until' => $validated['available_until'] ?? null,
            ]);

            // Get existing question IDs
            $existingQuestionIds = collect($validated['questions'])
                ->pluck('id')
                ->filter()
                ->toArray();

            // Delete removed questions
            $quiz->questions()->whereNotIn('id', $existingQuestionIds)->delete();

            foreach ($validated['questions'] as $index => $questionData) {
                if (isset($questionData['id'])) {
                    // Update existing question
                    $question = QuizQuestion::find($questionData['id']);
                    $question->update([
                        'type' => $questionData['type'],
                        'question' => $questionData['question'],
                        'explanation' => $questionData['explanation'] ?? null,
                        'points' => $questionData['points'],
                        'order' => $index + 1,
                    ]);

                    // Get existing answer IDs
                    $existingAnswerIds = collect($questionData['answers'] ?? [])
                        ->pluck('id')
                        ->filter()
                        ->toArray();

                    // Delete removed answers
                    $question->answers()->whereNotIn('id', $existingAnswerIds)->delete();
                } else {
                    // Create new question
                    $question = QuizQuestion::create([
                        'quiz_id' => $quiz->id,
                        'type' => $questionData['type'],
                        'question' => $questionData['question'],
                        'explanation' => $questionData['explanation'] ?? null,
                        'points' => $questionData['points'],
                        'order' => $index + 1,
                    ]);
                }

                // Handle answers
                if (isset($questionData['answers']) && is_array($questionData['answers'])) {
                    foreach ($questionData['answers'] as $answerIndex => $answerData) {
                        if (isset($answerData['id'])) {
                            QuizAnswer::find($answerData['id'])->update([
                                'answer' => $answerData['answer'],
                                'is_correct' => $answerData['is_correct'] ?? false,
                                'order' => $answerIndex + 1,
                            ]);
                        } else {
                            QuizAnswer::create([
                                'question_id' => $question->id,
                                'answer' => $answerData['answer'],
                                'is_correct' => $answerData['is_correct'] ?? false,
                                'order' => $answerIndex + 1,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('teacher.quizzes.index')
                ->with('success', 'Quiz updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update quiz. Please try again.']);
        }
    }

    public function destroy(Quiz $quiz)
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->delete();

        return redirect()->route('teacher.quizzes.index')
            ->with('success', 'Quiz deleted successfully!');
    }

    public function togglePublish(Quiz $quiz)
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->update(['is_published' => !$quiz->is_published]);

        $status = $quiz->is_published ? 'published' : 'unpublished';

        return back()->with('success', "Quiz {$status} successfully!");
    }

    public function toggleActive(Quiz $quiz)
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->update(['is_active' => !$quiz->is_active]);

        $status = $quiz->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Quiz {$status} successfully!");
    }

    public function results(Quiz $quiz): Response
    {
        $teacher = Auth::user()->teacher;

        if ($quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->load(['subject']);

        $attempts = QuizAttempt::with(['student.user', 'responses.question', 'responses.answer'])
            ->where('quiz_id', $quiz->id)
            ->completed()
            ->latest('completed_at')
            ->paginate(20);

        return Inertia::render('teacher/quizzes/results', [
            'quiz' => $quiz,
            'attempts' => $attempts,
        ]);
    }

    public function gradeAttempt(Request $request, QuizAttempt $attempt)
    {
        $teacher = Auth::user()->teacher;

        if ($attempt->quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $validated = $request->validate([
            'responses' => 'required|array',
            'responses.*.id' => 'required|exists:quiz_responses,id',
            'responses.*.points_earned' => 'required|integer|min:0',
            'responses.*.feedback' => 'nullable|string',
        ]);

        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($validated['responses'] as $responseData) {
            $response = $attempt->responses()->find($responseData['id']);
            if ($response) {
                $response->update([
                    'points_earned' => $responseData['points_earned'],
                    'feedback' => $responseData['feedback'] ?? null,
                    'is_correct' => $responseData['points_earned'] > 0,
                ]);
                $earnedPoints += $responseData['points_earned'];
            }
        }

        $totalPoints = $attempt->quiz->questions()->sum('points');
        $percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;

        $attempt->update([
            'score' => $earnedPoints,
            'total_points' => $totalPoints,
            'percentage' => round($percentage, 2),
        ]);

        return back()->with('success', 'Attempt graded successfully!');
    }
}
