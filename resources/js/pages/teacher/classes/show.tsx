import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    lrn: string;
    email: string;
    enrollment_status: string;
}

interface Section {
    id: number;
    name: string;
    code: string;
    capacity: number;
    school_year: string;
    department?: { id: number; name: string; code: string } | null;
    year_level?: { id: number; name: string } | null;
}

interface Props {
    section: Section;
    students: Student[];
}

export default function ClassShow({ section, students }: Props) {
    return (
        <TeacherLayout>
            <Head title={`Class - ${section.name}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/classes">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{section.name}</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {section.department?.name} &bull; {section.year_level?.name} &bull; {section.school_year}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Roster ({students.length} / {section.capacity})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">#</th>
                                        <th className="p-3 text-left font-semibold">Student No.</th>
                                        <th className="p-3 text-left font-semibold">Name</th>
                                        <th className="p-3 text-left font-semibold">Email</th>
                                        <th className="p-3 text-center font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                                No students enrolled in this section.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((student, index) => (
                                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                                                <td className="p-3 font-mono text-sm">{student.lrn}</td>
                                                <td className="p-3 font-medium">
                                                    {student.last_name}, {student.first_name}
                                                    {student.middle_name ? ` ${student.middle_name[0]}.` : ''}
                                                </td>
                                                <td className="p-3 text-sm">{student.email}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${
                                                        student.enrollment_status === 'enrolled'
                                                            ? 'bg-green-100 text-green-700'
                                                            : student.enrollment_status === 'dropped'
                                                              ? 'bg-red-100 text-red-700'
                                                              : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {student.enrollment_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
