<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function index(Request $request): Response
    {
        $student = Auth::user()->student;

        // Get quizzes from subjects the student is enrolled in
        $query = Quiz::with(['subject', 'teacher.user'])
            ->whereHas('subject.students', function ($q) use ($student) {
                $q->where('students.id', $student->id);
            })
            ->available()
            ->withCount('questions');

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'not_attempted') {
                $query->whereDoesntHave('attempts', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                });
            } elseif ($request->status === 'in_progress') {
                $query->whereHas('attempts', function ($q) use ($student) {
                    $q->where('student_id', $student->id)
                        ->where('status', 'in_progress');
                });
            } elseif ($request->status === 'completed') {
                $query->whereHas('attempts', function ($q) use ($student) {
                    $q->where('student_id', $student->id)
                        ->where('status', 'completed');
                });
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

        // Add attempt info to each quiz
        $quizzes->getCollection()->transform(function ($quiz) use ($student) {
            $quiz->my_attempts = $quiz->attempts()
                ->where('student_id', $student->id)
                ->get();
            $quiz->attempts_remaining = $quiz->max_attempts - $quiz->my_attempts->count();
            $quiz->best_score = $quiz->my_attempts
                ->where('status', 'completed')
                ->max('percentage');
            $quiz->has_in_progress = $quiz->my_attempts
                ->where('status', 'in_progress')
                ->isNotEmpty();
            return $quiz;
        });

        // Get subjects for filtering
        $subjects = $student->subjects()->get();

        return Inertia::render('student/quizzes/index', [
            'quizzes' => $quizzes,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id', 'status']),
        ]);
    }

    public function show(Quiz $quiz): Response
    {
        $student = Auth::user()->student;

        // Verify student has access to this quiz
        if (!$quiz->subject->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'You do not have access to this quiz.');
        }

        if (!$quiz->is_published || !$quiz->is_active) {
            abort(404, 'Quiz not available.');
        }

        $quiz->load(['subject', 'teacher.user']);
        $quiz->loadCount('questions');

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->orderBy('attempt_number', 'desc')
            ->get();

        $attemptsRemaining = $quiz->max_attempts - $attempts->count();
        $hasInProgress = $attempts->where('status', 'in_progress')->isNotEmpty();
        $inProgressAttempt = $attempts->where('status', 'in_progress')->first();

        return Inertia::render('student/quizzes/show', [
            'quiz' => $quiz,
            'attempts' => $attempts,
            'attemptsRemaining' => $attemptsRemaining,
            'hasInProgress' => $hasInProgress,
            'inProgressAttempt' => $inProgressAttempt,
        ]);
    }

    public function start(Quiz $quiz)
    {
        $student = Auth::user()->student;

        // Verify student has access
        if (!$quiz->subject->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'You do not have access to this quiz.');
        }

        if (!$quiz->is_published || !$quiz->is_active) {
            abort(404, 'Quiz not available.');
        }

        // Check for existing in-progress attempt
        $existingAttempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.quizzes.take', $existingAttempt->id);
        }

        // Check if max attempts reached
        $attemptCount = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->count();

        if ($attemptCount >= $quiz->max_attempts) {
            return back()->withErrors(['error' => 'Maximum attempts reached for this quiz.']);
        }

        // Create new attempt
        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => $student->id,
            'attempt_number' => $attemptCount + 1,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        return redirect()->route('student.quizzes.take', $attempt->id);
    }

    public function take(QuizAttempt $attempt): Response|RedirectResponse
    {
        $student = Auth::user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return redirect()->route('student.quizzes.result', $attempt->id);
        }

        $quiz = $attempt->quiz;
        $quiz->load(['questions.answers']);

        // Shuffle questions if enabled
        $questions = $quiz->questions;
        if ($quiz->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        // Shuffle answers if enabled
        if ($quiz->shuffle_answers) {
            $questions = $questions->map(function ($question) {
                $question->answers = $question->answers->shuffle();
                return $question;
            });
        }

        // Get existing responses
        $existingResponses = QuizResponse::where('attempt_id', $attempt->id)
            ->get()
            ->keyBy('question_id');

        // Calculate remaining time
        $remainingTime = null;
        if ($quiz->time_limit_minutes) {
            $elapsedSeconds = now()->diffInSeconds($attempt->started_at);
            $totalSeconds = $quiz->time_limit_minutes * 60;
            $remainingTime = max(0, $totalSeconds - $elapsedSeconds);
        }

        return Inertia::render('student/quizzes/take', [
            'attempt' => $attempt,
            'quiz' => $quiz,
            'questions' => $questions,
            'existingResponses' => $existingResponses,
            'remainingTime' => $remainingTime,
        ]);
    }

    public function saveResponse(Request $request, QuizAttempt $attempt)
    {
        $student = Auth::user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['error' => 'Attempt already completed'], 400);
        }

        $validated = $request->validate([
            'question_id' => 'required|exists:quiz_questions,id',
            'answer_id' => 'nullable|exists:quiz_answers,id',
            'text_response' => 'nullable|string',
        ]);

        QuizResponse::updateOrCreate(
            [
                'attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'answer_id' => $validated['answer_id'] ?? null,
                'text_response' => $validated['text_response'] ?? null,
            ]
        );

        return response()->json(['success' => true]);
    }

    public function submit(Request $request, QuizAttempt $attempt)
    {
        $student = Auth::user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return redirect()->route('student.quizzes.result', $attempt->id);
        }

        $quiz = $attempt->quiz;

        try {
            DB::beginTransaction();

            // Save any remaining responses
            if ($request->has('responses')) {
                foreach ($request->responses as $questionId => $response) {
                    QuizResponse::updateOrCreate(
                        [
                            'attempt_id' => $attempt->id,
                            'question_id' => $questionId,
                        ],
                        [
                            'answer_id' => $response['answer_id'] ?? null,
                            'text_response' => $response['text_response'] ?? null,
                        ]
                    );
                }
            }

            // Grade auto-gradable questions
            $totalPoints = 0;
            $earnedPoints = 0;
            $hasManualGrading = false;

            foreach ($quiz->questions as $question) {
                $totalPoints += $question->points;

                $response = QuizResponse::where('attempt_id', $attempt->id)
                    ->where('question_id', $question->id)
                    ->first();

                if (!$response) {
                    // No response - 0 points
                    QuizResponse::create([
                        'attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                        'is_correct' => false,
                        'points_earned' => 0,
                    ]);
                    continue;
                }

                if (in_array($question->type, ['multiple_choice', 'true_false'])) {
                    // Auto-grade
                    $correctAnswer = $question->answers()->where('is_correct', true)->first();
                    $isCorrect = $correctAnswer && $response->answer_id === $correctAnswer->id;
                    $pointsEarned = $isCorrect ? $question->points : 0;

                    $response->update([
                        'is_correct' => $isCorrect,
                        'points_earned' => $pointsEarned,
                    ]);

                    $earnedPoints += $pointsEarned;
                } else {
                    // Short answer and essay need manual grading
                    $hasManualGrading = true;
                }
            }

            $percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;

            $attempt->update([
                'completed_at' => now(),
                'status' => 'completed',
                'score' => $earnedPoints,
                'total_points' => $totalPoints,
                'percentage' => $hasManualGrading ? null : round($percentage, 2),
            ]);

            DB::commit();

            return redirect()->route('student.quizzes.result', $attempt->id)
                ->with('success', 'Quiz submitted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to submit quiz. Please try again.']);
        }
    }

    public function result(QuizAttempt $attempt): Response|RedirectResponse
    {
        $student = Auth::user()->student;

        if ($attempt->student_id !== $student->id) {
            abort(403);
        }

        if ($attempt->status === 'in_progress') {
            return redirect()->route('student.quizzes.take', $attempt->id);
        }

        $quiz = $attempt->quiz;
        $showAnswers = $quiz->show_correct_answers;

        $responses = QuizResponse::with(['question', 'answer'])
            ->where('attempt_id', $attempt->id)
            ->get()
            ->keyBy('question_id');

        // Load questions with correct answers if showing answers
        $questions = $quiz->questions()
            ->with(['answers'])
            ->orderBy('order')
            ->get();

        return Inertia::render('student/quizzes/result', [
            'attempt' => $attempt,
            'quiz' => $quiz,
            'questions' => $questions,
            'responses' => $responses,
            'showAnswers' => $showAnswers,
        ]);
    }
}
