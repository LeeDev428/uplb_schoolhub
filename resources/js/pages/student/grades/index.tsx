import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentLayout from '@/layouts/student/student-layout';
import { GraduationCap, BookOpen, Award, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Grades',
        href: '/student/grades',
    },
];

interface GradeEntry {
    id: number;
    subject_code: string;
    subject_name: string;
    units: number;
    semester: string | null;
    school_year: string;
    year_level: string;
    grade: number | null;
    status: string;
    is_passed: boolean;
}

interface Summary {
    total_subjects: number;
    graded_subjects?: number;
    total_units: number;
    passed_subjects: number;
    failed_subjects: number;
    gwa?: number | null;
    cumulative_gwa?: number | null;
}

interface Props {
    student: {
        id: number;
        first_name: string;
        last_name: string;
        lrn: string;
        program: string | null;
        year_level: string | null;
    };
    currentSchoolYear: string;
    gradesByYear: Record<string, GradeEntry[]>;
    summaryByYear: Record<string, Summary>;
    overallSummary: Summary;
}

export default function GradesIndex({
    student,
    currentSchoolYear,
    gradesByYear,
    summaryByYear,
    overallSummary,
}: Props) {
    const schoolYears = Object.keys(gradesByYear).sort().reverse();
    const hasGrades = schoolYears.length > 0;

    const getGradeBadge = (grade: number | null, status: string) => {
        if (grade === null) {
            if (status === 'dropped') {
                return <Badge variant="outline">Dropped</Badge>;
            }
            return <Badge variant="secondary">No Grade</Badge>;
        }

        if (grade >= 90) {
            return <Badge className="bg-green-600 hover:bg-green-700">{grade.toFixed(2)}</Badge>;
        } else if (grade >= 85) {
            return <Badge className="bg-blue-600 hover:bg-blue-700">{grade.toFixed(2)}</Badge>;
        } else if (grade >= 80) {
            return <Badge className="bg-sky-600 hover:bg-sky-700">{grade.toFixed(2)}</Badge>;
        } else if (grade >= 75) {
            return <Badge className="bg-yellow-600 hover:bg-yellow-700">{grade.toFixed(2)}</Badge>;
        } else {
            return <Badge variant="destructive">{grade.toFixed(2)}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default" className="bg-green-600">Passed</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'dropped':
                return <Badge variant="outline">Dropped</Badge>;
            case 'active':
                return <Badge variant="secondary">In Progress</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="My Grades" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Grades</h1>
                        <p className="text-muted-foreground">
                            View your academic grades and performance summary
                        </p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        Current S.Y.: {currentSchoolYear}
                    </Badge>
                </div>

                {/* Overall Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Subjects</p>
                                <p className="text-2xl font-bold">{overallSummary.total_subjects}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Passed</p>
                                <p className="text-2xl font-bold">{overallSummary.passed_subjects}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Failed</p>
                                <p className="text-2xl font-bold">{overallSummary.failed_subjects}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cumulative GWA</p>
                                <p className="text-2xl font-bold">
                                    {overallSummary.cumulative_gwa !== null
                                        ? overallSummary.cumulative_gwa.toFixed(2)
                                        : '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Grades by School Year */}
                {hasGrades ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Grade Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={schoolYears[0]} className="w-full">
                                <TabsList className="mb-4 flex-wrap h-auto">
                                    {schoolYears.map((year) => (
                                        <TabsTrigger key={year} value={year} className="text-sm">
                                            S.Y. {year}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {schoolYears.map((year) => (
                                    <TabsContent key={year} value={year}>
                                        {/* Year Summary */}
                                        {summaryByYear[year] && (
                                            <div className="grid gap-3 sm:grid-cols-4 mb-4 p-4 bg-muted/30 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">Subjects</p>
                                                    <p className="font-semibold">{summaryByYear[year].total_subjects}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">Units</p>
                                                    <p className="font-semibold">{summaryByYear[year].total_units}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">Passed</p>
                                                    <p className="font-semibold text-green-600">{summaryByYear[year].passed_subjects}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">GWA</p>
                                                    <p className="font-semibold">
                                                        {summaryByYear[year].gwa !== null
                                                            ? summaryByYear[year].gwa?.toFixed(2)
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Grades Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="px-4 py-2 text-left font-medium">Code</th>
                                                        <th className="px-4 py-2 text-left font-medium">Subject</th>
                                                        <th className="px-4 py-2 text-center font-medium">Units</th>
                                                        <th className="px-4 py-2 text-center font-medium">Semester</th>
                                                        <th className="px-4 py-2 text-center font-medium">Grade</th>
                                                        <th className="px-4 py-2 text-center font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gradesByYear[year]?.map((entry) => (
                                                        <tr key={entry.id} className="border-b hover:bg-muted/50">
                                                            <td className="px-4 py-3 font-mono text-xs">
                                                                {entry.subject_code}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div>
                                                                    <p className="font-medium">{entry.subject_name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {entry.year_level}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {entry.units}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {entry.semester || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {getGradeBadge(entry.grade, entry.status)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {getStatusBadge(entry.status)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Grades Yet</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Your grade records will appear here once your teachers submit them.
                                Check back after your subjects have been graded.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
