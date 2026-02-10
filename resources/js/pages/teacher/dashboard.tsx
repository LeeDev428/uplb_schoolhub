import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { Users, BookOpen, ClipboardList } from 'lucide-react';

interface Props {
    stats: {
        totalStudents: number;
        totalSections: number;
        recentRecords: number;
    };
    teacher: {
        id: number;
        full_name: string;
        specialization: string | null;
        department?: { name: string } | null;
    } | null;
}

export default function TeacherDashboard({ stats, teacher }: Props) {
    const statCards = [
        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600' },
        { label: 'Active Sections', value: stats.totalSections, icon: BookOpen, color: 'text-green-600' },
        { label: 'Guidance Records', value: stats.recentRecords, icon: ClipboardList, color: 'text-orange-600' },
    ];

    return (
        <TeacherLayout>
            <Head title="Teacher Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome{teacher ? `, ${teacher.full_name}` : ''}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        {teacher?.specialization ? `${teacher.specialization} Teacher` : 'Teacher Dashboard'}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((stat) => (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            <a
                                href="/teacher/classes"
                                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                            >
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium">View Classes</p>
                                    <p className="text-sm text-gray-500">See your assigned sections</p>
                                </div>
                            </a>
                            <a
                                href="/teacher/grades"
                                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                            >
                                <ClipboardList className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium">Manage Grades</p>
                                    <p className="text-sm text-gray-500">View and update student grades</p>
                                </div>
                            </a>
                            <a
                                href="/teacher/attendance"
                                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                            >
                                <Users className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-medium">Attendance</p>
                                    <p className="text-sm text-gray-500">Record student attendance</p>
                                </div>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
