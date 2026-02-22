import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import {
    Users, BookOpen, ClipboardList, GraduationCap, FileQuestion,
    CheckSquare, Calendar, BarChart3, ChevronRight, PenSquare,
    UserCheck, BookMarked, Eye,
} from 'lucide-react';

interface TeacherSection {
    id: number;
    name: string;
    room_number: string | null;
    yearLevel?: { name: string } | null;
}

interface RecentQuiz {
    id: number;
    title: string;
    is_published: boolean;
    created_at: string;
}

interface Props {
    teacher: {
        id: number;
        full_name: string;
        specialization: string | null;
        department: string | null;
        employee_id: string | null;
        photo_url: string | null;
    } | null;
    stats: {
        mySections: number;
        myStudents: number;
        enrolledStudents: number;
        totalQuizzes: number;
        publishedQuizzes: number;
        draftQuizzes: number;
        recentAttempts: number;
    };
    sections: TeacherSection[];
    recentQuizzes: RecentQuiz[];
}

const QUICK_LINKS = [
    { href: '/teacher/classes',    label: 'My Classes',   desc: 'View your assigned sections',       icon: BookOpen,      color: 'text-blue-600',   bg: 'bg-blue-50' },
    { href: '/teacher/students',   label: 'Students',     desc: 'View and manage student profiles',  icon: Users,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { href: '/teacher/grades',     label: 'Grades',       desc: 'Encode and review student grades',  icon: ClipboardList, color: 'text-green-600',  bg: 'bg-green-50' },
    { href: '/teacher/quizzes',    label: 'Quizzes',      desc: 'Create and manage quizzes',         icon: FileQuestion,  color: 'text-purple-600', bg: 'bg-purple-50' },
    { href: '/teacher/attendance', label: 'Attendance',   desc: 'Record daily attendance',           icon: CheckSquare,   color: 'text-amber-600',  bg: 'bg-amber-50' },
    { href: '/teacher/schedules',  label: 'Schedules',    desc: 'View your teaching schedules',      icon: Calendar,      color: 'text-teal-600',   bg: 'bg-teal-50' },
    { href: '/teacher/subjects',   label: 'Subjects',     desc: 'View subjects in your department',  icon: BookMarked,    color: 'text-pink-600',   bg: 'bg-pink-50' },
    { href: '/teacher/profile',    label: 'My Profile',   desc: 'Update your teacher profile',       icon: UserCheck,     color: 'text-gray-600',   bg: 'bg-gray-50' },
];

export default function TeacherDashboard({ teacher, stats, sections, recentQuizzes }: Props) {
    const initials = teacher?.full_name
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase() ?? 'T';

    const enrollmentRate = stats.myStudents > 0
        ? Math.round((stats.enrolledStudents / stats.myStudents) * 100)
        : 0;

    return (
        <TeacherLayout>
            <Head title="Teacher Dashboard" />

            <div className="space-y-6 p-6">

                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-primary/20 flex-shrink-0">
                        <AvatarImage src={teacher?.photo_url ?? undefined} alt={teacher?.full_name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            Welcome back, {teacher?.full_name ?? 'Teacher'}!
                        </h1>
                        <p className="text-muted-foreground mt-0.5">
                            {teacher?.specialization ? `${teacher.specialization}` : ''}
                            {teacher?.specialization && teacher?.department ? ' · ' : ''}
                            {teacher?.department ?? ''}
                            {teacher?.employee_id ? ` · ID: ${teacher.employee_id}` : ''}
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Sections</CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.mySections}</div>
                            <p className="text-xs text-muted-foreground mt-1">Advisory classes assigned</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Students</CardTitle>
                            <Users className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.myStudents}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.enrolledStudents} officially enrolled</p>
                            {stats.myStudents > 0 && (
                                <Progress value={enrollmentRate} className="mt-2 h-1.5" />
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Quizzes</CardTitle>
                            <FileQuestion className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalQuizzes}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.publishedQuizzes} published · {stats.draftQuizzes} drafts
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quiz Submissions</CardTitle>
                            <BarChart3 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.recentAttempts}</div>
                            <p className="text-xs text-muted-foreground mt-1">Completed this past week</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quick Links */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Access</CardTitle>
                                <CardDescription>Navigate to your portal sections</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {QUICK_LINKS.map(link => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm hover:border-primary/30 group"
                                        >
                                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${link.bg}`}>
                                                <link.icon className={`h-5 w-5 ${link.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm group-hover:text-primary">{link.label}</p>
                                                <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* My Sections List */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                    My Sections
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sections.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No sections assigned yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {sections.map(sec => (
                                            <Link
                                                key={sec.id}
                                                href={`/teacher/classes/${sec.id}`}
                                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
                                            >
                                                <div>
                                                    <p className="font-medium text-sm group-hover:text-primary">{sec.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {sec.yearLevel?.name ?? ''}
                                                        {sec.room_number ? ` · Room ${sec.room_number}` : ''}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Quizzes */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <PenSquare className="h-4 w-4 text-purple-600" />
                                        Recent Quizzes
                                    </CardTitle>
                                    <Link href="/teacher/quizzes" className="text-xs text-primary hover:underline">
                                        View all
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentQuizzes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No quizzes created yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {recentQuizzes.map(quiz => (
                                            <div key={quiz.id} className="flex items-center justify-between rounded-lg border p-2.5">
                                                <p className="text-sm font-medium truncate flex-1 mr-2">{quiz.title}</p>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <Badge
                                                        variant={quiz.is_published ? 'default' : 'secondary'}
                                                        className={`text-xs ${quiz.is_published ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}
                                                    >
                                                        {quiz.is_published ? 'Published' : 'Draft'}
                                                    </Badge>
                                                    <Link href={`/teacher/quizzes/${quiz.id}`}>
                                                        <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
