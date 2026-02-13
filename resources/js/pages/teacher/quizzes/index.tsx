import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import {
    FileQuestion,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    MoreHorizontal,
    BookOpen,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    BarChart,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quizzes',
        href: '/teacher/quizzes',
    },
];

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    subject_id: number;
    time_limit_minutes: number | null;
    passing_score: number;
    max_attempts: number;
    is_published: boolean;
    is_active: boolean;
    available_from: string | null;
    available_until: string | null;
    created_at: string;
    subject: Subject;
    questions_count: number;
    attempts_count: number;
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
    const [deleteQuiz, setDeleteQuiz] = useState<Quiz | null>(null);

    const handleFilter = (newFilters: Partial<typeof filters>) => {
        router.get('/teacher/quizzes', {
            search: newFilters.search ?? search,
            subject_id: newFilters.subject_id ?? subjectId,
            status: newFilters.status ?? status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTogglePublish = (quiz: Quiz) => {
        router.post(`/teacher/quizzes/${quiz.id}/toggle-publish`, {}, {
            preserveScroll: true,
        });
    };

    const handleToggleActive = (quiz: Quiz) => {
        router.post(`/teacher/quizzes/${quiz.id}/toggle-active`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (deleteQuiz) {
            router.delete(`/teacher/quizzes/${deleteQuiz.id}`, {
                preserveScroll: true,
                onSuccess: () => setDeleteQuiz(null),
            });
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const stats = {
        total: quizzes.total,
        published: quizzes.data.filter(q => q.is_published).length,
        draft: quizzes.data.filter(q => !q.is_published).length,
        totalAttempts: quizzes.data.reduce((acc, q) => acc + q.attempts_count, 0),
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Quizzes" />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
                        <p className="text-muted-foreground">
                            Create and manage quizzes for your subjects
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/teacher/quizzes/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Quiz
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                <FileQuestion className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Published</p>
                                <p className="text-2xl font-bold">{stats.published}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                                <Edit className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Draft</p>
                                <p className="text-2xl font-bold">{stats.draft}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Attempts</p>
                                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
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
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Quizzes Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Time Limit</TableHead>
                                    <TableHead>Attempts</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quizzes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileQuestion className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">No quizzes found</p>
                                                <Button asChild size="sm">
                                                    <Link href="/teacher/quizzes/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create your first quiz
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    quizzes.data.map((quiz) => (
                                        <TableRow key={quiz.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{quiz.title}</p>
                                                    {quiz.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {quiz.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <BookOpen className="mr-1 h-3 w-3" />
                                                    {quiz.subject.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{quiz.questions_count}</TableCell>
                                            <TableCell>
                                                {quiz.time_limit_minutes ? (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {quiz.time_limit_minutes} min
                                                    </span>
                                                ) : (
                                                    'Unlimited'
                                                )}
                                            </TableCell>
                                            <TableCell>{quiz.attempts_count}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={quiz.is_published ? 'default' : 'secondary'}>
                                                        {quiz.is_published ? 'Published' : 'Draft'}
                                                    </Badge>
                                                    {!quiz.is_active && (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/teacher/quizzes/${quiz.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/teacher/quizzes/${quiz.id}/results`}>
                                                                <BarChart className="mr-2 h-4 w-4" />
                                                                Results
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleTogglePublish(quiz)}>
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
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleActive(quiz)}>
                                                            {quiz.is_active ? (
                                                                <>
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => setDeleteQuiz(quiz)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {quizzes.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination
                            currentPage={quizzes.current_page}
                            totalPages={quizzes.last_page}
                            onPageChange={(page) => {
                                router.get('/teacher/quizzes', {
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteQuiz} onOpenChange={() => setDeleteQuiz(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteQuiz?.title}"? This action cannot be
                            undone and will remove all questions and student attempts.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TeacherLayout>
    );
}
