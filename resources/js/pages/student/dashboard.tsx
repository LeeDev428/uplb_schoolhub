import { Head } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/layouts/student/student-layout';

interface Requirement {
    id: number;
    name: string;
}

interface StudentRequirement {
    id: number;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue';
    submitted_at: string | null;
    approved_at: string | null;
    requirement: Requirement;
}

interface EnrollmentClearance {
    requirements_complete: boolean;
    requirements_complete_percentage: number;
    registrar_clearance: boolean;
    accounting_clearance: boolean;
    official_enrollment: boolean;
    enrollment_status: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    program: string;
    year_level: string;
    enrollment_status: string;
    requirements: StudentRequirement[];
}

interface Props {
    student: Student;
    stats: {
        totalRequirements: number;
        completedRequirements: number;
        pendingRequirements: number;
        requirementsPercentage: number;
    };
    enrollmentClearance: EnrollmentClearance | null;
}

export default function Dashboard({ student, stats, enrollmentClearance }: Props) {
    const getStatusBadge = (status: string) => {
        const colors = {
            'not-enrolled': 'bg-gray-100 text-gray-800',
            'pending-registrar': 'bg-yellow-100 text-yellow-800',
            'pending-accounting': 'bg-purple-100 text-purple-800',
            'enrolled': 'bg-green-100 text-green-800',
            'dropped': 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back, {student.first_name}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's your enrollment status and requirements progress
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Requirements
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalRequirements}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedRequirements}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingRequirements}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Progress
                            </CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.requirementsPercentage}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Student Info & Requirements */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Student Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Information</CardTitle>
                            <CardDescription>Your enrollment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Student ID</p>
                                    <p className="font-medium">{student.student_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Program</p>
                                    <p className="font-medium">{student.program}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Year Level</p>
                                    <p className="font-medium">{student.year_level}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusBadge(student.enrollment_status)}>
                                        {student.enrollment_status.replace('-', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements Progress</CardTitle>
                            <CardDescription>
                                {stats.completedRequirements} of {stats.totalRequirements} completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={stats.requirementsPercentage} className="h-2" />
                            <div className="space-y-2">
                                {student.requirements.slice(0, 5).map((req) => (
                                    <div key={req.id} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{req.requirement.name}</span>
                                        <Badge 
                                            variant={req.status === 'approved' ? 'default' : 'outline'}
                                            className={req.status === 'approved' ? 'bg-green-600' : ''}
                                        >
                                            {req.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Clearance Status */}
                {enrollmentClearance && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Clearance</CardTitle>
                            <CardDescription>Your clearance progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${enrollmentClearance.requirements_complete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <p className="mt-2 text-sm text-center">Requirements</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${enrollmentClearance.registrar_clearance ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <p className="mt-2 text-sm text-center">Registrar</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${enrollmentClearance.accounting_clearance ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <p className="mt-2 text-sm text-center">Accounting</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${enrollmentClearance.official_enrollment ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <p className="mt-2 text-sm text-center">Enrolled</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
