import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student/student-layout';
import {
    FileQuestion,
    Search,
    Clock,
    Target,
    CheckCircle,
    XCircle,
    Play,
    BarChart,
    BookOpen,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quizzes',
        href: '/student/quizzes',
    },
];

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
    status: string;
    percentage: number | null;
    completed_at: string | null;
}

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    subject_id: number;
    time_limit_minutes: number | null;
    passing_score: number;
    max_attempts: number;
    available_from: string | null;
    available_until: string | null;
    created_at: string;
    subject: Subject;
    teacher: Teacher;
    questions_count: number;
    my_attempts: Attempt[];
    attempts_remaining: number;
    best_score: number | null;
    has_in_progress: boolean;
}

interface Props {
    quizzes: {
        data: Quiz[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    subjects: Subject[];
    filters: {
        search?: string;
        subject_id?: string;
        status?: string;
    };
}

export default function QuizzesIndex({ quizzes, subjects, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [subjectId, setSubjectId] = useState(filters.subject_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = (newFilters: Partial<typeof filters>) => {
        router.get('/student/quizzes', {
            search: newFilters.search ?? search,
            subject_id: newFilters.subject_id ?? subjectId,
            status: newFilters.status ?? status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getQuizStatus = (quiz: Quiz) => {
        if (quiz.has_in_progress) {
            return { label: 'In Progress', variant: 'warning' as const };
        }
        if (quiz.attempts_remaining === 0) {
            return { label: 'Completed', variant: 'default' as const };
        }
        if (quiz.my_attempts.length === 0) {
            return { label: 'Not Started', variant: 'secondary' as const };
        }
        return { label: 'Can Retry', variant: 'outline' as const };
    };

    const stats = {
        available: quizzes.data.filter(q => q.attempts_remaining > 0 || q.has_in_progress).length,
        completed: quizzes.data.filter(q => q.attempts_remaining === 0 && !q.has_in_progress).length,
        inProgress: quizzes.data.filter(q => q.has_in_progress).length,
    };

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Quizzes" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
                    <p className="text-muted-foreground">
                        View and take quizzes for your enrolled subjects
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                <FileQuestion className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Available Quizzes</p>
                                <p className="text-2xl font-bold">{stats.available}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{stats.inProgress}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search quizzes..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleFilter({ search: e.target.value });
                                    }}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={subjectId}
                                onValueChange={(value) => {
                                    setSubjectId(value);
                                    handleFilter({ subject_id: value });
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            {subject.code} - {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value);
                                    handleFilter({ status: value });
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="not_attempted">Not Started</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Quiz Cards */}
                {quizzes.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Quizzes Found</h3>
                            <p className="text-muted-foreground text-center">
                                There are no quizzes available for your enrolled subjects yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {quizzes.data.map((quiz) => {
                            const quizStatus = getQuizStatus(quiz);
                            return (
                                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <Badge variant="outline">
                                                <BookOpen className="mr-1 h-3 w-3" />
                                                {quiz.subject.code}
                                            </Badge>
                                            <Badge variant={quizStatus.variant === 'warning' ? 'secondary' : quizStatus.variant}>
                                                {quizStatus.label}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg mt-2">{quiz.title}</CardTitle>
                                        {quiz.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {quiz.description}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                                                <span>{quiz.questions_count} questions</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {quiz.time_limit_minutes
                                                        ? `${quiz.time_limit_minutes} min`
                                                        : 'No limit'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-muted-foreground" />
                                                <span>Pass: {quiz.passing_score}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BarChart className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {quiz.attempts_remaining}/{quiz.max_attempts} left
                                                </span>
                                            </div>
                                        </div>

                                        {quiz.best_score !== null && (
                                            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                                                <span className="text-sm text-muted-foreground">Best Score</span>
                                                <span className={`font-semibold ${
                                                    quiz.best_score >= quiz.passing_score
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}>
                                                    {quiz.best_score}%
                                                    {quiz.best_score >= quiz.passing_score ? (
                                                        <CheckCircle className="inline ml-1 h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="inline ml-1 h-4 w-4" />
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {quiz.available_until && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>Due: {formatDate(quiz.available_until)}</span>
                                            </div>
                                        )}

                                        <Button asChild className="w-full">
                                            <Link href={`/student/quizzes/${quiz.id}`}>
                                                {quiz.has_in_progress ? (
                                                    <>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        Continue Quiz
                                                    </>
                                                ) : quiz.attempts_remaining > 0 ? (
                                                    <>
                                                        <Play className="mr-2 h-4 w-4" />
                                                        {quiz.my_attempts.length > 0 ? 'Retry Quiz' : 'Start Quiz'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <BarChart className="mr-2 h-4 w-4" />
                                                        View Results
                                                    </>
                                                )}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {quizzes.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={quizzes.current_page}
                            totalPages={quizzes.last_page}
                            onPageChange={(page) => {
                                router.get('/student/quizzes', {
                                    ...filters,
                                    page,
                                }, {
                                    preserveState: true,
                                });
                            }}
                        />
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
