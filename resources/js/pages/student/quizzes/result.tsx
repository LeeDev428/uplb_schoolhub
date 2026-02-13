import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student/student-layout';
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    Award,
    Clock,
    Target,
    RefreshCw,
    BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

interface Answer {
    id: number;
    answer: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    question: string;
    explanation: string | null;
    points: number;
    order: number;
    answers: Answer[];
}

interface Response {
    id: number;
    question_id: number;
    answer_id: number | null;
    text_response: string | null;
    is_correct: boolean | null;
    points_earned: number;
    feedback: string | null;
    answer?: Answer;
    question?: Question;
}

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    passing_score: number;
    show_correct_answers: boolean;
}

interface Attempt {
    id: number;
    attempt_number: number;
    started_at: string;
    completed_at: string | null;
    score: number | null;
    total_points: number | null;
    percentage: number | null;
    status: string;
}

interface Props {
    attempt: Attempt;
    quiz: Quiz;
    questions: Question[];
    responses: Record<number, Response>;
    showAnswers: boolean;
}

export default function QuizResult({
    attempt,
    quiz,
    questions,
    responses,
    showAnswers,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quizzes', href: '/student/quizzes' },
        { title: quiz.title, href: `/student/quizzes/${quiz.id}` },
        { title: 'Result', href: '#' },
    ];

    const passed = (attempt.percentage || 0) >= quiz.passing_score;
    const correctCount = Object.values(responses).filter((r) => r.is_correct).length;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDuration = () => {
        if (!attempt.started_at || !attempt.completed_at) return 'N/A';
        const start = new Date(attempt.started_at);
        const end = new Date(attempt.completed_at);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return `${diffMins}m ${diffSecs}s`;
    };

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title={`Result: ${quiz.title}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/student/quizzes/${quiz.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quiz Result</h1>
                        <p className="text-muted-foreground">{quiz.title}</p>
                    </div>
                </div>

                {/* Result Card */}
                <Card
                    className={cn(
                        'border-2',
                        passed
                            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                            : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                    )}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={cn(
                                    'rounded-full p-4 mb-4',
                                    passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                                )}
                            >
                                {passed ? (
                                    <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            <h2 className="text-3xl font-bold mb-2">
                                {passed ? 'Congratulations!' : 'Keep Trying!'}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {passed
                                    ? 'You have passed this quiz.'
                                    : `You need ${quiz.passing_score}% to pass.`}
                            </p>
                            <div
                                className={cn(
                                    'text-6xl font-bold mb-2',
                                    passed ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {attempt.percentage !== null ? `${attempt.percentage}%` : 'Pending'}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {attempt.score}/{attempt.total_points} points
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Correct</p>
                                <p className="text-xl font-bold">{correctCount}/{questions.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Time Taken</p>
                                <p className="text-xl font-bold">{getDuration()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Passing Score</p>
                                <p className="text-xl font-bold">{quiz.passing_score}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                                <RefreshCw className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Attempt</p>
                                <p className="text-xl font-bold">#{attempt.attempt_number}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Questions Review */}
                {showAnswers && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Questions Review</CardTitle>
                            <CardDescription>
                                Review your answers and see the correct solutions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {questions.map((question, index) => {
                                const response = responses[question.id];
                                const isCorrect = response?.is_correct;

                                return (
                                    <div
                                        key={question.id}
                                        className={cn(
                                            'rounded-lg border p-4',
                                            isCorrect
                                                ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                                                : isCorrect === false
                                                ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
                                                : 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20'
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-muted-foreground">
                                                    Question {index + 1}
                                                </span>
                                                <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isCorrect ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : isCorrect === false ? (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-yellow-600" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {response?.points_earned || 0}/{question.points} pts
                                                </span>
                                            </div>
                                        </div>

                                        <p className="font-medium mb-3">{question.question}</p>

                                        {/* Multiple Choice / True False */}
                                        {(question.type === 'multiple_choice' ||
                                            question.type === 'true_false') && (
                                            <div className="space-y-2 mb-3">
                                                {question.answers.map((answer) => {
                                                    const isSelected = response?.answer_id === answer.id;
                                                    const isCorrectAnswer = answer.is_correct;

                                                    return (
                                                        <div
                                                            key={answer.id}
                                                            className={cn(
                                                                'flex items-center gap-3 rounded-lg border p-3',
                                                                isCorrectAnswer
                                                                    ? 'border-green-500 bg-green-100/50 dark:bg-green-900/30'
                                                                    : isSelected
                                                                    ? 'border-red-500 bg-red-100/50 dark:bg-red-900/30'
                                                                    : 'border-transparent bg-muted/50'
                                                            )}
                                                        >
                                                            {isCorrectAnswer ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                            ) : isSelected ? (
                                                                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-full border-2 flex-shrink-0" />
                                                            )}
                                                            <span
                                                                className={cn(
                                                                    isCorrectAnswer
                                                                        ? 'text-green-700 dark:text-green-300 font-medium'
                                                                        : ''
                                                                )}
                                                            >
                                                                {answer.answer}
                                                            </span>
                                                            {isSelected && !isCorrectAnswer && (
                                                                <Badge variant="destructive" className="ml-auto">
                                                                    Your answer
                                                                </Badge>
                                                            )}
                                                            {isSelected && isCorrectAnswer && (
                                                                <Badge className="ml-auto bg-green-600">
                                                                    Correct!
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Short Answer / Essay */}
                                        {(question.type === 'short_answer' || question.type === 'essay') && (
                                            <div className="mb-3">
                                                <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                                                <div className="rounded-lg border bg-muted/50 p-3">
                                                    <p className="whitespace-pre-wrap">
                                                        {response?.text_response || (
                                                            <span className="text-muted-foreground italic">
                                                                No answer provided
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                {response?.feedback && (
                                                    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                            <strong>Feedback:</strong> {response.feedback}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Explanation */}
                                        {question.explanation && (
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    <strong>Explanation:</strong> {question.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href={`/student/quizzes/${quiz.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Quiz
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/student/quizzes">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Browse Quizzes
                        </Link>
                    </Button>
                </div>
            </div>
        </StudentLayout>
    );
}
