import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student/student-layout';
import {
    FileQuestion,
    Clock,
    Target,
    CheckCircle,
    XCircle,
    Play,
    BarChart,
    BookOpen,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    user: User;
}

interface Attempt {
    id: number;
    attempt_number: number;
    started_at: string;
    completed_at: string | null;
    score: number | null;
    total_points: number | null;
    percentage: number | null;
    status: 'in_progress' | 'completed' | 'timed_out' | 'abandoned';
}

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    subject: Subject;
    teacher: Teacher;
    time_limit_minutes: number | null;
    passing_score: number;
    max_attempts: number;
    available_from: string | null;
    available_until: string | null;
    questions_count: number;
}

interface Props {
    quiz: Quiz;
    attempts: Attempt[];
    attemptsRemaining: number;
    hasInProgress: boolean;
    inProgressAttempt: Attempt | null;
}

export default function QuizShow({
    quiz,
    attempts,
    attemptsRemaining,
    hasInProgress,
    inProgressAttempt,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quizzes', href: '/student/quizzes' },
        { title: quiz.title, href: `/student/quizzes/${quiz.id}` },
    ];

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

    const handleStartQuiz = () => {
        router.post(`/student/quizzes/${quiz.id}/start`);
    };

    const bestAttempt = attempts
        .filter((a) => a.status === 'completed' && a.percentage !== null)
        .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title={quiz.title} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/student/quizzes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    {quiz.subject.code}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
                            {quiz.description && (
                                <p className="text-muted-foreground mt-1">{quiz.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                                By {quiz.teacher.user.name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quiz Info */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Quiz Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                            <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Questions</p>
                                            <p className="font-semibold">{quiz.questions_count}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Time Limit</p>
                                            <p className="font-semibold">
                                                {quiz.time_limit_minutes
                                                    ? `${quiz.time_limit_minutes} minutes`
                                                    : 'No limit'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Passing Score</p>
                                            <p className="font-semibold">{quiz.passing_score}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                            <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Attempts Remaining</p>
                                            <p className="font-semibold">
                                                {attemptsRemaining}/{quiz.max_attempts}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {quiz.available_until && (
                                <div className="mt-6 flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">
                                        Due by {formatDate(quiz.available_until)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Take Quiz</CardTitle>
                            <CardDescription>
                                {hasInProgress
                                    ? 'You have an attempt in progress'
                                    : attemptsRemaining > 0
                                    ? 'Start or retry this quiz'
                                    : 'You have used all attempts'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bestAttempt && (
                                <div className="rounded-lg bg-muted p-4">
                                    <p className="text-sm text-muted-foreground mb-1">Best Score</p>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-2xl font-bold ${
                                                (bestAttempt.percentage || 0) >= quiz.passing_score
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {bestAttempt.percentage}%
                                        </span>
                                        {(bestAttempt.percentage || 0) >= quiz.passing_score ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {(bestAttempt.percentage || 0) >= quiz.passing_score
                                            ? 'Passed'
                                            : 'Not Passed'}
                                    </p>
                                </div>
                            )}

                            {hasInProgress && inProgressAttempt ? (
                                <Button asChild className="w-full" size="lg">
                                    <Link href={`/student/quizzes/take/${inProgressAttempt.id}`}>
                                        <Play className="mr-2 h-5 w-5" />
                                        Continue Quiz
                                    </Link>
                                </Button>
                            ) : attemptsRemaining > 0 ? (
                                <Button onClick={handleStartQuiz} className="w-full" size="lg">
                                    <Play className="mr-2 h-5 w-5" />
                                    {attempts.length > 0 ? 'Retry Quiz' : 'Start Quiz'}
                                </Button>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <XCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p>No attempts remaining</p>
                                </div>
                            )}

                            {quiz.time_limit_minutes && (
                                <p className="text-xs text-center text-muted-foreground">
                                    You will have {quiz.time_limit_minutes} minutes to complete this quiz
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Previous Attempts */}
                {attempts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Attempts</CardTitle>
                            <CardDescription>
                                {attempts.length} attempt{attempts.length !== 1 ? 's' : ''} recorded
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Attempt</TableHead>
                                        <TableHead>Started</TableHead>
                                        <TableHead>Completed</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attempts.map((attempt) => (
                                        <TableRow key={attempt.id}>
                                            <TableCell className="font-medium">
                                                #{attempt.attempt_number}
                                            </TableCell>
                                            <TableCell>{formatDate(attempt.started_at)}</TableCell>
                                            <TableCell>
                                                {attempt.completed_at
                                                    ? formatDate(attempt.completed_at)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {attempt.percentage !== null ? (
                                                    <span
                                                        className={`font-medium ${
                                                            attempt.percentage >= quiz.passing_score
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >
                                                        {attempt.percentage}%
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        attempt.status === 'completed'
                                                            ? attempt.percentage !== null &&
                                                              attempt.percentage >= quiz.passing_score
                                                                ? 'default'
                                                                : 'destructive'
                                                            : attempt.status === 'in_progress'
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {attempt.status === 'completed' &&
                                                    attempt.percentage !== null
                                                        ? attempt.percentage >= quiz.passing_score
                                                            ? 'Passed'
                                                            : 'Failed'
                                                        : attempt.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {attempt.status === 'in_progress' ? (
                                                    <Button asChild size="sm">
                                                        <Link href={`/student/quizzes/take/${attempt.id}`}>
                                                            Continue
                                                        </Link>
                                                    </Button>
                                                ) : attempt.status === 'completed' ? (
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/student/quizzes/result/${attempt.id}`}>
                                                            <BarChart className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
