import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Clock, FileText, GraduationCap, CreditCard, XCircle, ArrowRight, BookOpen, CalendarDays, ChevronRight, Receipt, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

interface PaymentInfo {
    total_fees: number;
    discount_amount: number;
    total_paid: number;
    balance: number;
    effective_balance: number;
    promissory_amount: number;
    is_fully_paid: boolean;
    is_overdue: boolean;
    due_date: string | null;
    has_promissory: boolean;
}

interface IncompleteRequirement {
    id: number;
    name: string;
    status: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;  // used as Student No.
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
    paymentInfo: PaymentInfo | null;
    incompleteRequirements: IncompleteRequirement[];
}

export default function Dashboard({ student, stats, enrollmentClearance, paymentInfo, incompleteRequirements }: Props) {
    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

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

    const isNotEnrolled = student.enrollment_status !== 'enrolled';

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Unenrolled Warning Banner */}
                {isNotEnrolled && (
                    <Alert variant="destructive" className="border-2 border-red-500 bg-red-50">
                        <AlertTriangle className="h-6 w-6" />
                        <AlertTitle className="text-lg font-bold">You are NOT officially enrolled</AlertTitle>
                        <AlertDescription className="mt-2">
                            <p className="text-base mb-4">
                                Your enrollment status is <strong className="uppercase">{student.enrollment_status.replace(/-/g, ' ')}</strong>.
                                You need to complete the following before you can be officially enrolled:
                            </p>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Payment Status */}
                                {paymentInfo && (
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Payment Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Total Fees:</span>
                                                <span>{formatCurrency(paymentInfo.total_fees)}</span>
                                            </div>
                                            {paymentInfo.discount_amount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Discount:</span>
                                                    <span>-{formatCurrency(paymentInfo.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span>Total Paid:</span>
                                                <span>{formatCurrency(paymentInfo.total_paid)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold pt-2 border-t">
                                                <span>Balance:</span>
                                                <span className={paymentInfo.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                                                    {formatCurrency(paymentInfo.balance)}
                                                </span>
                                            </div>
                                            {paymentInfo.is_fully_paid ? (
                                                <Badge className="w-full justify-center bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Fully Paid
                                                </Badge>
                                            ) : (
                                                <Badge className="w-full justify-center bg-red-100 text-red-800">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Balance Due
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Incomplete Requirements */}
                                {incompleteRequirements.length > 0 && (
                                    <Card className="bg-white">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Incomplete Requirements ({incompleteRequirements.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                                {incompleteRequirements.slice(0, 5).map((req) => (
                                                    <li key={req.id} className="flex items-center justify-between">
                                                        <span className="truncate">{req.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {req.status}
                                                        </Badge>
                                                    </li>
                                                ))}
                                                {incompleteRequirements.length > 5 && (
                                                    <li className="text-muted-foreground">
                                                        and {incompleteRequirements.length - 5} more...
                                                    </li>
                                                )}
                                            </ul>
                                            <Link href="/student/requirements">
                                                <Button variant="outline" size="sm" className="w-full mt-3">
                                                    View All Requirements
                                                    <ArrowRight className="h-3 w-3 ml-2" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Clearance Status Summary */}
                            {enrollmentClearance && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge className={enrollmentClearance.requirements_complete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                        {enrollmentClearance.requirements_complete ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                        Requirements
                                    </Badge>
                                    <Badge className={enrollmentClearance.registrar_clearance ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                        {enrollmentClearance.registrar_clearance ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                        Registrar Clearance
                                    </Badge>
                                    <Badge className={enrollmentClearance.accounting_clearance ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                        {enrollmentClearance.accounting_clearance ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                        Accounting Clearance
                                    </Badge>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

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
                                    <p className="text-sm text-muted-foreground">Student No.</p>
                                    <p className="font-medium">{student.lrn}</p>
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

                {/* Payment Summary Card - Always visible for all students */}
                {paymentInfo && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Summary
                            </CardTitle>
                            <CardDescription>Your current payment status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Fees</p>
                                    <p className="text-2xl font-bold">{formatCurrency(paymentInfo.total_fees)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Paid</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(paymentInfo.total_paid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {paymentInfo.discount_amount > 0 ? 'Discount Applied' : 'Discount'}
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {paymentInfo.discount_amount > 0 ? `-${formatCurrency(paymentInfo.discount_amount)}` : formatCurrency(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className={`text-2xl font-bold ${paymentInfo.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(paymentInfo.balance)}
                                    </p>
                                </div>
                            </div>

                            {/* Status badges */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {paymentInfo.is_fully_paid ? (
                                    <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Fully Paid
                                    </Badge>
                                ) : (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Balance Due
                                    </Badge>
                                )}

                                {paymentInfo.is_overdue && (
                                    <Badge className="bg-red-100 text-red-800">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Overdue
                                    </Badge>
                                )}

                                {paymentInfo.has_promissory && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                        <FileText className="h-3 w-3 mr-1" />
                                        Promissory Note Active ({formatCurrency(paymentInfo.promissory_amount)})
                                    </Badge>
                                )}

                                {paymentInfo.due_date && (
                                    <Badge variant="outline">
                                        Due: {new Date(paymentInfo.due_date).toLocaleDateString()}
                                    </Badge>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Link href="/student/online-payments">
                                    <Button variant="outline" size="sm">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Make Online Payment
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Access</CardTitle>
                        <CardDescription>Navigate to your student portal sections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { href: '/student/quizzes',          label: 'Quizzes',           desc: 'Take and review quizzes',         icon: BookOpen,      color: 'text-purple-600', bg: 'bg-purple-50', requiresEnrollment: true },
                                { href: '/student/document-requests',label: 'Document Requests',  desc: 'Request official documents',      icon: FileText,      color: 'text-blue-600',   bg: 'bg-blue-50',   requiresEnrollment: false },
                                { href: '/student/schedules',        label: 'My Schedule',        desc: 'View your class timetable',       icon: CalendarDays,  color: 'text-teal-600',   bg: 'bg-teal-50',   requiresEnrollment: true },
                                { href: '/student/promissory-notes', label: 'Promissory Notes',   desc: 'Manage your payment agreements',  icon: Receipt,       color: 'text-amber-600',  bg: 'bg-amber-50',  requiresEnrollment: false },
                                { href: '/student/online-payments',  label: 'Online Payments',    desc: 'Submit and track fee payments',   icon: CreditCard,    color: 'text-green-600',  bg: 'bg-green-50',  requiresEnrollment: false },
                                { href: '/student/requirements',     label: 'Requirements',       desc: 'Upload and track requirements',   icon: CheckCircle,   color: 'text-indigo-600', bg: 'bg-indigo-50', requiresEnrollment: false },
                                { href: '/student/subjects',         label: 'Subjects',           desc: 'View your enrolled subjects',     icon: GraduationCap, color: 'text-pink-600',   bg: 'bg-pink-50',   requiresEnrollment: true },
                                { href: '/student/profile',          label: 'My Profile',         desc: 'Manage your student profile',     icon: ArrowRight,    color: 'text-gray-600',   bg: 'bg-gray-50',   requiresEnrollment: false },
                            ].map(link => {
                                const locked = link.requiresEnrollment && isNotEnrolled;
                                return locked ? (
                                    <div
                                        key={link.href}
                                        className="flex items-center gap-3 rounded-xl border border-dashed p-3 opacity-60 cursor-not-allowed bg-muted/30"
                                        title="Requires official enrollment"
                                    >
                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${link.bg}`}>
                                            <link.icon className={`h-4 w-4 ${link.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-muted-foreground">{link.label}</p>
                                            <p className="text-xs text-muted-foreground truncate">Enrollment required</p>
                                        </div>
                                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    </div>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm hover:border-primary/30 group"
                                    >
                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${link.bg}`}>
                                            <link.icon className={`h-4 w-4 ${link.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm group-hover:text-primary">{link.label}</p>
                                            <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
