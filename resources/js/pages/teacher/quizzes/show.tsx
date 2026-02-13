import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import {
    FileQuestion,
    Edit,
    Trash2,
    ArrowLeft,
    Clock,
    Target,
    Users,
    CheckCircle,
    XCircle,
    BarChart,
    TrendingUp,
    TrendingDown,
    Award,
    BookOpen,
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { Pagination } from '@/components/ui/pagination';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Answer {
    id: number;
    answer: string;
    is_correct: boolean;
    order: number;
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

interface User {
    id: number;
    name: string;
    email: string;
}

interface Student {
    id: number;
    user: User;
}

interface Attempt {
    id: number;
    student: Student;
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
    time_limit_minutes: number | null;
    passing_score: number;
    max_attempts: number;
    shuffle_questions: boolean;
    shuffle_answers: boolean;
    show_correct_answers: boolean;
    available_from: string | null;
    available_until: string | null;
    is_published: boolean;
    is_active: boolean;
    created_at: string;
    questions: Question[];
}

interface Stats {
    total_attempts: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    passed_count: number;
}

interface Props {
    quiz: Quiz;
    attempts: {
        data: Attempt[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: Stats;
}

export default function QuizShow({ quiz, attempts, stats }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Quizzes', href: '/teacher/quizzes' },
        { title: quiz.title, href: `/teacher/quizzes/${quiz.id}` },
    ];

    const handleTogglePublish = () => {
        router.post(`/teacher/quizzes/${quiz.id}/toggle-publish`, {}, { preserveScroll: true });
    };

    const handleToggleActive = () => {
        router.post(`/teacher/quizzes/${quiz.id}/toggle-active`, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        router.delete(`/teacher/quizzes/${quiz.id}`);
    };

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

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const passRate = stats.total_attempts > 0 ? (stats.passed_count / stats.total_attempts) * 100 : 0;

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title={quiz.title} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/teacher/quizzes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
                                <Badge variant={quiz.is_published ? 'default' : 'secondary'}>
                                    {quiz.is_published ? 'Published' : 'Draft'}
                                </Badge>
                                {!quiz.is_active && <Badge variant="destructive">Inactive</Badge>}
                            </div>
                            {quiz.description && (
                                <p className="text-muted-foreground mt-1">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    {quiz.subject.code}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleTogglePublish}>
                            {quiz.is_published ? (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Publish
                                </>
                            )}
                        </Button>
                        <Button asChild>
                            <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Questions</p>
                                <p className="text-xl font-bold">{quiz.questions.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Points</p>
                                <p className="text-xl font-bold">{totalPoints}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Attempts</p>
                                <p className="text-xl font-bold">{stats.total_attempts}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                                <BarChart className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Avg Score</p>
                                <p className="text-xl font-bold">{stats.average_score.toFixed(1)}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pass Rate</p>
                                <p className="text-xl font-bold">{passRate.toFixed(1)}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quiz Info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Quiz Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Time Limit</span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Clock className="h-4 w-4" />
                                    {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'Unlimited'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Passing Score</span>
                                <span className="font-medium">{quiz.passing_score}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Max Attempts</span>
                                <span className="font-medium">{quiz.max_attempts}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shuffle Questions</span>
                                <span className="font-medium">{quiz.shuffle_questions ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shuffle Answers</span>
                                <span className="font-medium">{quiz.shuffle_answers ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Show Answers</span>
                                <span className="font-medium">{quiz.show_correct_answers ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-1">Availability</p>
                                <p className="text-sm">
                                    <span className="font-medium">From:</span> {formatDate(quiz.available_from)}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Until:</span> {formatDate(quiz.available_until)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions Preview */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Questions Preview</CardTitle>
                            <CardDescription>
                                {quiz.questions.length} questions totaling {totalPoints} points
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {quiz.questions.map((question, index) => (
                                    <div key={question.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Question {index + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {question.points} pt{question.points !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm mb-3">{question.question}</p>
                                        {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                                            <div className="space-y-1 pl-4">
                                                {question.answers.map((answer) => (
                                                    <div
                                                        key={answer.id}
                                                        className={`text-sm flex items-center gap-2 ${
                                                            answer.is_correct ? 'text-green-600 font-medium' : ''
                                                        }`}
                                                    >
                                                        {answer.is_correct && <CheckCircle className="h-3 w-3" />}
                                                        <span>{answer.answer}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Attempts */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Attempts</CardTitle>
                                <CardDescription>Student attempts for this quiz</CardDescription>
                            </div>
                            {stats.total_attempts > 0 && (
                                <Button asChild variant="outline">
                                    <Link href={`/teacher/quizzes/${quiz.id}/results`}>
                                        <BarChart className="mr-2 h-4 w-4" />
                                        View All Results
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {attempts.data.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No attempts yet</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Attempt #</TableHead>
                                        <TableHead>Completed</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attempts.data.map((attempt) => (
                                        <TableRow key={attempt.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{attempt.student.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {attempt.student.user.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>#{attempt.attempt_number}</TableCell>
                                            <TableCell>{formatDate(attempt.completed_at)}</TableCell>
                                            <TableCell>
                                                {attempt.percentage !== null ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{attempt.percentage}%</span>
                                                        {attempt.percentage >= quiz.passing_score ? (
                                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Pending</span>
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
                                                            : 'secondary'
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{quiz.title}"? This action cannot be undone
                            and will remove all questions and student attempts.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TeacherLayout>
    );
}
