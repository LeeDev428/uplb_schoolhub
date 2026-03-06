import { Head, useForm, Link } from '@inertiajs/react';
import {
    GraduationCap,
    CheckCircle2,
    Clock,
    BookOpen,
    Info,
    Calendar,
    XCircle,
    PhilippinePeso as PesoIcon,
    CreditCard,
    FileText,
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    CircleDot,
    Receipt,
    MessageSquare,
    Banknote,
} from 'lucide-react';
import { useState } from 'react';
import { PhilippinePeso } from '@/components/icons/philippine-peso';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student/student-layout';

// ─── Shared types ─────────────────────────────────────────────────────────────
interface Department { id: number; name: string; code: string; classification: string; }
interface Program    { id: number; name: string; code: string; department_id: number; }
interface YearLevel  { id: number; name: string; code: string; department_id: number; }

interface StudentBase {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    enrollment_status: string;
    school_year: string | null;
    student_photo_url: string | null;
}

interface EnrolledStudent extends StudentBase {
    student_type: string | null;
    department: string | null;
    classification: string | null;
    remarks: string | null;
}

interface NotEnrolledStudent extends StudentBase {
    department_id: number | null;
}

interface Fee {
    id: number;
    school_year: string;
    total_amount: number;
    total_paid: number;
    balance: number;
    grant_discount: number;
    payment_status: string;
    is_overdue: boolean;
    due_date: string | null;
}

interface Payment {
    id: number;
    payment_date: string;
    or_number: string | null;
    amount: number;
    payment_mode: string;
    payment_for: string | null;
    notes: string | null;
    school_year: string | null;
}

interface PromissoryNote {
    id: number;
    submitted_date: string;
    due_date: string;
    amount: number | null;
    reason: string;
    status: string;
    school_year: string | null;
    review_notes: string | null;
}

interface Requirement {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    status: string;
    notes: string | null;
    submitted_at: string | null;
    approved_at: string | null;
}

interface Clearance {
    requirements_complete: boolean;
    requirements_complete_percentage: number;
    registrar_clearance: boolean;
    registrar_cleared_at: string | null;
    registrar_notes: string | null;
    accounting_clearance: boolean;
    accounting_cleared_at: string | null;
    accounting_notes: string | null;
    official_enrollment: boolean;
    officially_enrolled_at: string | null;
}

// ─── Props for the page ────────────────────────────────────────────────────────
interface EnrolledProps {
    isEnrolled: true;
    currentSchoolYear: string;
    classification: string;
    student: EnrolledStudent;
    fees: Fee[];
    payments: Payment[];
    promissoryNotes: PromissoryNote[];
    requirements: Requirement[];
    clearance: Clearance | null;
    summary: { total_fees: number; total_discount: number; total_paid: number; total_balance: number; };
}

interface NotEnrolledProps {
    isEnrolled: false;
    currentSchoolYear: string;
    classification: string;
    student: NotEnrolledStudent;
    hasPendingRequest: boolean;
    enrollmentOpen: boolean;
    enrollmentPeriod: { start: string | null; end: string | null; };
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevel[];
}

type Props = EnrolledProps | NotEnrolledProps;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (val: number) =>
    `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors: Record<string, string> = {
    'not-enrolled':       'bg-gray-100 text-gray-800',
    'pending-registrar':  'bg-yellow-100 text-yellow-800',
    'pending-accounting': 'bg-purple-100 text-purple-800',
    'pending-enrollment': 'bg-orange-100 text-orange-800',
    'enrolled':           'bg-green-100 text-green-800',
    'dropped':            'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    'not-enrolled':       'Not Enrolled',
    'pending-registrar':  'Pending Registrar',
    'pending-accounting': 'Pending Accounting',
    'pending-enrollment': 'Pending Enrollment',
    'enrolled':           'Enrolled',
    'dropped':            'Dropped',
};

const reqStatusIcon = (status: string) => {
    switch (status) {
        case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'pending':  return <Clock className="h-4 w-4 text-yellow-600" />;
        case 'submitted': return <CircleDot className="h-4 w-4 text-blue-600" />;
        default:          return <XCircle className="h-4 w-4 text-red-600" />;
    }
};

// ─── Enrolled Details View ────────────────────────────────────────────────────
function EnrollmentDetails({ student, fees, payments, promissoryNotes, requirements, clearance, summary, currentSchoolYear }: EnrolledProps) {
    const [tab, setTab] = useState<'fees' | 'payments' | 'requirements' | 'notes'>('fees');

    const currentFee = fees.find(f => f.school_year === currentSchoolYear);

    return (
        <StudentLayout>
            <Head title="My Enrollment" />

            <div className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        My Enrollment
                    </h1>
                    <p className="text-muted-foreground">
                        Enrollment details for School Year {student.school_year ?? currentSchoolYear}
                    </p>
                </div>

                {/* Student Info + Status */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Avatar className="h-14 w-14 shrink-0">
                                <AvatarImage src={student.student_photo_url ?? undefined} />
                                <AvatarFallback className="text-lg font-bold">
                                    {student.first_name[0]}{student.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-lg leading-tight">{student.first_name} {student.last_name}</p>
                                <p className="text-sm text-muted-foreground">LRN / Student No.: <span className="font-mono">{student.lrn}</span></p>
                            </div>
                            <Badge className={statusColors[student.enrollment_status] ?? 'bg-gray-100 text-gray-800'}>
                                {statusLabels[student.enrollment_status] ?? student.enrollment_status}
                            </Badge>
                        </div>

                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground font-medium">School Year</p>
                                <p className="font-semibold">{student.school_year ?? '—'}</p>
                            </div>
                            {student.classification && (
                                <div>
                                    <p className="text-muted-foreground font-medium">Classification</p>
                                    <p className="font-semibold">{student.classification}</p>
                                </div>
                            )}
                            {student.department && (
                                <div>
                                    <p className="text-muted-foreground font-medium">Department</p>
                                    <p className="font-semibold">{student.department}</p>
                                </div>
                            )}
                            {student.program && (
                                <div>
                                    <p className="text-muted-foreground font-medium">Program / Strand</p>
                                    <p className="font-semibold">{student.program}</p>
                                </div>
                            )}
                            {student.year_level && (
                                <div>
                                    <p className="text-muted-foreground font-medium">Year Level</p>
                                    <p className="font-semibold">{student.year_level}</p>
                                </div>
                            )}
                            {student.section && (
                                <div>
                                    <p className="text-muted-foreground font-medium">Section</p>
                                    <p className="font-semibold">{student.section}</p>
                                </div>
                            )}
                            {student.student_type && (
                                <div>
                                    <p className="text-muted-foreground font-medium">Student Type</p>
                                    <p className="font-semibold capitalize">{student.student_type}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="pt-4 pb-3">
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Fees</p>
                            <p className="text-xl font-bold text-blue-900 mt-1">{formatCurrency(summary.total_fees)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardContent className="pt-4 pb-3">
                            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Discount</p>
                            <p className="text-xl font-bold text-purple-900 mt-1">{formatCurrency(summary.total_discount)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="pt-4 pb-3">
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Total Paid</p>
                            <p className="text-xl font-bold text-green-900 mt-1">{formatCurrency(summary.total_paid)}</p>
                        </CardContent>
                    </Card>
                    <Card className={summary.total_balance > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}>
                        <CardContent className="pt-4 pb-3">
                            <p className={`text-xs font-medium uppercase tracking-wide ${summary.total_balance > 0 ? 'text-red-700' : 'text-gray-600'}`}>Balance</p>
                            <p className={`text-xl font-bold mt-1 ${summary.total_balance > 0 ? 'text-red-900' : 'text-gray-700'}`}>{formatCurrency(summary.total_balance)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Clearance Status */}
                {clearance && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" /> Clearance Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className={`rounded-lg p-3 border flex items-start gap-3 ${clearance.requirements_complete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                    {clearance.requirements_complete ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />}
                                    <div>
                                        <p className="font-medium text-sm">Requirements</p>
                                        <p className="text-xs text-muted-foreground">{clearance.requirements_complete_percentage}% complete</p>
                                    </div>
                                </div>
                                <div className={`rounded-lg p-3 border flex items-start gap-3 ${clearance.registrar_clearance ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                    {clearance.registrar_clearance ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />}
                                    <div>
                                        <p className="font-medium text-sm">Registrar</p>
                                        <p className="text-xs text-muted-foreground">{clearance.registrar_clearance ? (clearance.registrar_cleared_at ?? 'Cleared') : 'Pending clearance'}</p>
                                    </div>
                                </div>
                                <div className={`rounded-lg p-3 border flex items-start gap-3 ${clearance.accounting_clearance ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                    {clearance.accounting_clearance ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />}
                                    <div>
                                        <p className="font-medium text-sm">Accounting</p>
                                        <p className="text-xs text-muted-foreground">{clearance.accounting_clearance ? (clearance.accounting_cleared_at ?? 'Cleared') : 'Pending clearance'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs: Fees / Payments / Requirements / Notes */}
                <div className="flex gap-1 border-b">
                    {(['fees', 'payments', 'requirements', 'notes'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            {t === 'fees' ? 'Fees & Balance' : t === 'payments' ? 'Payments' : t === 'notes' ? 'Notes' : 'Requirements'}
                        </button>
                    ))}
                </div>

                {/* Tab: Fees */}
                {tab === 'fees' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <PhilippinePeso className="h-4 w-4" /> Fee Breakdown by School Year
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {fees.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-6 text-center">No fee records found.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>School Year</TableHead>
                                            <TableHead className="text-right">Total Fees</TableHead>
                                            <TableHead className="text-right">Discount</TableHead>
                                            <TableHead className="text-right">Total Paid</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fees.map(fee => (
                                            <TableRow key={fee.id} className={fee.school_year === currentSchoolYear ? 'bg-blue-50/50' : ''}>
                                                <TableCell className="font-medium">
                                                    {fee.school_year}
                                                    {fee.school_year === currentSchoolYear && (
                                                        <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">{formatCurrency(fee.total_amount)}</TableCell>
                                                <TableCell className="text-right text-purple-700">{formatCurrency(fee.grant_discount)}</TableCell>
                                                <TableCell className="text-right text-green-700">{formatCurrency(fee.total_paid)}</TableCell>
                                                <TableCell className={`text-right font-semibold ${fee.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                                    {formatCurrency(fee.balance)}
                                                </TableCell>
                                                <TableCell>
                                                    {fee.is_overdue ? (
                                                        <Badge variant="destructive" className="text-xs">
                                                            <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
                                                        </Badge>
                                                    ) : (
                                                        <Badge className={`text-xs ${
                                                            fee.payment_status === 'paid' ? 'bg-green-500' :
                                                            fee.payment_status === 'partial' ? 'bg-yellow-500' : ''
                                                        }`} variant={fee.payment_status === 'unpaid' ? 'outline' : 'default'}>
                                                            {fee.payment_status === 'paid' ? 'Fully Paid' :
                                                             fee.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* Promissory notes if any */}
                            {promissoryNotes.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                                        <FileText className="h-4 w-4" /> Promissory Notes
                                    </p>
                                    <div className="space-y-2">
                                        {promissoryNotes.map(note => (
                                            <div key={note.id} className={`rounded-lg border p-3 text-sm ${note.status === 'approved' ? 'bg-green-50 border-green-200' : note.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium">{note.reason}</span>
                                                    <Badge variant={note.status === 'approved' ? 'default' : 'outline'} className={`text-xs capitalize ${note.status === 'approved' ? 'bg-green-600' : ''}`}>
                                                        {note.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-xs mt-1">
                                                    Submitted: {note.submitted_date} · Due: {note.due_date}
                                                    {note.amount !== null && ` · Amount: ${formatCurrency(note.amount)}`}
                                                </p>
                                                {note.review_notes && <p className="text-xs mt-1 italic">Note: {note.review_notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Payments */}
                {tab === 'payments' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Receipt className="h-4 w-4" /> Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {payments.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-6 text-center">No payments recorded yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>OR No.</TableHead>
                                            <TableHead>School Year</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.payment_date}</TableCell>
                                                <TableCell className="font-mono text-sm">{p.or_number ?? '—'}</TableCell>
                                                <TableCell>{p.school_year ?? '—'}</TableCell>
                                                <TableCell>{p.payment_mode}</TableCell>
                                                <TableCell className="text-right font-semibold text-green-700">{formatCurrency(p.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="font-bold bg-muted/30">
                                            <TableCell colSpan={4}>Total Paid</TableCell>
                                            <TableCell className="text-right text-green-700">{formatCurrency(payments.reduce((s, p) => s + p.amount, 0))}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Requirements */}
                {tab === 'requirements' && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" /> Enrollment Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {requirements.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-6 text-center">No requirements found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {requirements.map(req => (
                                        <div key={req.id} className={`flex items-start gap-3 rounded-lg border p-3 ${req.status === 'approved' ? 'bg-green-50/50 border-green-100' : req.status === 'submitted' ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                            <div className="mt-0.5 shrink-0">{reqStatusIcon(req.status)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{req.name}</p>
                                                {req.category && <p className="text-xs text-muted-foreground">{req.category}</p>}
                                                {req.notes && <p className="text-xs text-muted-foreground italic mt-0.5">Note: {req.notes}</p>}
                                                {req.approved_at && <p className="text-xs text-green-700 mt-0.5">Approved: {req.approved_at}</p>}
                                            </div>
                                            <Badge variant="outline" className={`capitalize text-xs shrink-0 ${
                                                req.status === 'approved' ? 'border-green-300 text-green-700' :
                                                req.status === 'submitted' ? 'border-blue-300 text-blue-700' :
                                                req.status === 'rejected' ? 'border-red-300 text-red-700' : ''
                                            }`}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: Notes */}
                {tab === 'notes' && (
                    <div className="space-y-4">
                        {/* Registrar notes */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Registrar Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {student.remarks ? (
                                    <p className="text-sm whitespace-pre-wrap">{student.remarks}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No notes from Registrar.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Accounting notes (from clearance) */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Banknote className="h-4 w-4" /> Accounting Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {clearance?.accounting_notes ? (
                                    <p className="text-sm whitespace-pre-wrap">{clearance.accounting_notes}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No notes from Accounting.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Registrar clearance notes */}
                        {clearance?.registrar_notes && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Registrar Clearance Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{clearance.registrar_notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

// ─── Non-enrolled Form View ───────────────────────────────────────────────────
function EnrollmentForm({ student, currentSchoolYear, hasPendingRequest, enrollmentOpen, enrollmentPeriod, classification, departments, programs, yearLevels }: NotEnrolledProps) {
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(student.department_id);

    const filteredPrograms   = programs.filter(p => !selectedDeptId || p.department_id === selectedDeptId);
    const filteredYearLevels = yearLevels.filter(y => !selectedDeptId || y.department_id === selectedDeptId);

    const { data, setData, post, processing, errors } = useForm({
        year_level:    student.year_level ?? '',
        program:       student.program ?? '',
        department_id: student.department_id ? student.department_id.toString() : '',
        notes:         '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/enrollment');
    };

    const statusInfo = { label: statusLabels[student.enrollment_status] ?? student.enrollment_status, color: statusColors[student.enrollment_status] ?? 'bg-gray-100 text-gray-800' };

    return (
        <StudentLayout>
            <Head title="Re-Enrollment" />

            <div className="space-y-6 p-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Re-Enrollment
                    </h1>
                    <p className="text-muted-foreground">Submit your enrollment request for School Year {currentSchoolYear}</p>
                </div>

                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={student.student_photo_url ?? undefined} />
                                <AvatarFallback className="text-lg font-bold">{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{student.first_name} {student.last_name}</p>
                                <p className="text-sm text-muted-foreground">LRN: {student.lrn}</p>
                                {student.school_year && <p className="text-xs text-muted-foreground">Last S.Y.: {student.school_year}</p>}
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                    </CardContent>
                </Card>

                {hasPendingRequest && (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Enrollment Request Pending</AlertTitle>
                        <AlertDescription>
                            Your re-enrollment request for <strong>{currentSchoolYear}</strong> has been submitted and is waiting for the Registrar's review.
                        </AlertDescription>
                    </Alert>
                )}

                {!enrollmentOpen && !hasPendingRequest && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Enrollment Period Closed</AlertTitle>
                        <AlertDescription>
                            <p>Enrollment for <strong>{classification}</strong> students for School Year <strong>{currentSchoolYear}</strong> is currently closed.</p>
                            {enrollmentPeriod.start && enrollmentPeriod.end && (
                                <p className="mt-2 text-sm">Enrollment period: {enrollmentPeriod.start} to {enrollmentPeriod.end}</p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {!hasPendingRequest && enrollmentOpen && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Enrollment Information</CardTitle>
                            <CardDescription>Fill in your academic details for School Year {currentSchoolYear}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">Department / Track</Label>
                                    <Select value={data.department_id} onValueChange={(val) => {
                                        setData('department_id', val);
                                        setSelectedDeptId(val ? parseInt(val) : null);
                                        setData('year_level', '');
                                        setData('program', '');
                                    }}>
                                        <SelectTrigger id="department_id"><SelectValue placeholder="Select department" /></SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="text-sm text-destructive">{errors.department_id}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="year_level">Year Level / Grade *</Label>
                                    {filteredYearLevels.length > 0 ? (
                                        <Select value={data.year_level} onValueChange={(val) => setData('year_level', val)}>
                                            <SelectTrigger id="year_level"><SelectValue placeholder="Select year level" /></SelectTrigger>
                                            <SelectContent>
                                                {filteredYearLevels.map(yl => <SelectItem key={yl.id} value={yl.name}>{yl.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input id="year_level" value={data.year_level} onChange={e => setData('year_level', e.target.value)} placeholder="e.g., Grade 11, 1st Year" required />
                                    )}
                                    {errors.year_level && <p className="text-sm text-destructive">{errors.year_level}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="program">Program / Strand</Label>
                                    {filteredPrograms.length > 0 ? (
                                        <Select value={data.program} onValueChange={(val) => setData('program', val)}>
                                            <SelectTrigger id="program"><SelectValue placeholder="Select program or strand" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Not Applicable --</SelectItem>
                                                {filteredPrograms.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input id="program" value={data.program} onChange={e => setData('program', e.target.value)} placeholder="e.g., STEM, BSIT (optional)" />
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea id="notes" value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Any additional information for the registrar..." rows={3} maxLength={1000} />
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>What happens next?</AlertTitle>
                                    <AlertDescription className="text-sm">
                                        <p>Once you submit, your request will be reviewed by the Registrar. You'll need to submit required documents, settle any outstanding balance, and wait for clearance.</p>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-3 justify-end">
                                    <Link href="/student/dashboard"><Button type="button" variant="outline">Cancel</Button></Link>
                                    <Button type="submit" disabled={processing || !data.year_level}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        {processing ? 'Submitting…' : 'Submit Enrollment Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {hasPendingRequest && (
                    <div className="text-center">
                        <Link href="/student/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}

// ─── Default export ───────────────────────────────────────────────────────────
export default function EnrollmentIndex(props: Props) {
    if (props.isEnrolled) {
        return <EnrollmentDetails {...props} />;
    }
    return <EnrollmentForm {...props} />;
}


interface Department {
    id: number;
    name: string;
    code: string;
    classification: string;
}

interface Program {
    id: number;
    name: string;
    code: string;
    department_id: number;
}

interface YearLevel {
    id: number;
    name: string;
    code: string;
    department_id: number;
}

interface StudentInfo {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    department_id: number | null;
    enrollment_status: string;
    school_year: string | null;
    student_photo_url: string | null;
}

interface Props {
    student: StudentInfo;
    currentSchoolYear: string;
    hasPendingRequest: boolean;
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevel[];
    enrollmentOpen: boolean;
    classification: string;
    enrollmentPeriod: {
        start: string | null;
        end: string | null;
    };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    'not-enrolled':      { label: 'Not Enrolled',       color: 'bg-gray-100 text-gray-800' },
    'pending-registrar': { label: 'Pending Registrar',  color: 'bg-yellow-100 text-yellow-800' },
    'pending-accounting':{ label: 'Pending Accounting', color: 'bg-purple-100 text-purple-800' },
    'pending-enrollment':{ label: 'Enrollment Pending', color: 'bg-orange-100 text-orange-800' },
    'enrolled':          { label: 'Enrolled',           color: 'bg-green-100 text-green-800' },
    'dropped':           { label: 'Dropped',            color: 'bg-red-100 text-red-800' },
};

export default function SelfEnrollmentIndex({
    student,
    currentSchoolYear,
    hasPendingRequest,
    departments,
    programs,
    yearLevels,
    enrollmentOpen,
    classification,
    enrollmentPeriod,
}: Props) {
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(student.department_id);

    const filteredPrograms  = programs.filter(p => !selectedDeptId || p.department_id === selectedDeptId);
    const filteredYearLevels = yearLevels.filter(y => !selectedDeptId || y.department_id === selectedDeptId);

    const { data, setData, post, processing, errors } = useForm({
        year_level:    student.year_level ?? '',
        program:       student.program ?? '',
        department_id: student.department_id ? student.department_id.toString() : '',
        notes:         '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/enrollment');
    };

    const statusInfo = statusConfig[student.enrollment_status] ?? { label: student.enrollment_status, color: 'bg-gray-100 text-gray-800' };

    return (
        <StudentLayout>
            <Head title="Re-Enrollment" />

            <div className="space-y-6 p-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Re-Enrollment
                    </h1>
                    <p className="text-muted-foreground">
                        Submit your enrollment request for School Year {currentSchoolYear}
                    </p>
                </div>

                {/* Student Info Card */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={student.student_photo_url ?? undefined} alt={`${student.first_name} ${student.last_name}`} />
                                <AvatarFallback className="text-lg font-bold">
                                    {student.first_name[0]}{student.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{student.first_name} {student.last_name}</p>
                                <p className="text-sm text-muted-foreground">LRN: {student.lrn}</p>
                                {student.school_year && (
                                    <p className="text-xs text-muted-foreground">Last S.Y.: {student.school_year}</p>
                                )}
                            </div>
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending request notice */}
                {hasPendingRequest && (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Enrollment Request Pending</AlertTitle>
                        <AlertDescription>
                            Your re-enrollment request for <strong>{currentSchoolYear}</strong> has been submitted and is waiting for the Registrar's review. You will be notified once it's processed.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Enrollment Closed Notice */}
                {!enrollmentOpen && !hasPendingRequest && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Enrollment Period Closed</AlertTitle>
                        <AlertDescription>
                            <p>
                                Enrollment for <strong>{classification}</strong> students for School Year <strong>{currentSchoolYear}</strong> is currently closed.
                            </p>
                            {enrollmentPeriod.start && enrollmentPeriod.end && (
                                <p className="mt-2 text-sm">
                                    Enrollment period: {enrollmentPeriod.start} to {enrollmentPeriod.end}
                                </p>
                            )}
                            <p className="mt-2 text-sm">
                                Please contact the Registrar's Office for more information.
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Enrollment Form */}
                {!hasPendingRequest && enrollmentOpen && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Enrollment Information
                            </CardTitle>
                            <CardDescription>
                                Fill in your academic details for School Year {currentSchoolYear}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Department */}
                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">Department / Track</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(val) => {
                                            setData('department_id', val);
                                            setSelectedDeptId(val ? parseInt(val) : null);
                                            // Reset year level and program if department changed
                                            setData('year_level', '');
                                            setData('program', '');
                                        }}
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="text-sm text-destructive">{errors.department_id}</p>}
                                </div>

                                {/* Year Level */}
                                <div className="grid gap-2">
                                    <Label htmlFor="year_level">Year Level / Grade *</Label>
                                    {filteredYearLevels.length > 0 ? (
                                        <Select
                                            value={data.year_level}
                                            onValueChange={(val) => setData('year_level', val)}
                                        >
                                            <SelectTrigger id="year_level">
                                                <SelectValue placeholder="Select year level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredYearLevels.map(yl => (
                                                    <SelectItem key={yl.id} value={yl.name}>
                                                        {yl.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="year_level"
                                            value={data.year_level}
                                            onChange={e => setData('year_level', e.target.value)}
                                            placeholder="e.g., Grade 11, 1st Year"
                                            required
                                        />
                                    )}
                                    {errors.year_level && <p className="text-sm text-destructive">{errors.year_level}</p>}
                                </div>

                                {/* Program (optional) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="program">Program / Strand</Label>
                                    {filteredPrograms.length > 0 ? (
                                        <Select
                                            value={data.program}
                                            onValueChange={(val) => setData('program', val)}
                                        >
                                            <SelectTrigger id="program">
                                                <SelectValue placeholder="Select program or strand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Not Applicable --</SelectItem>
                                                {filteredPrograms.map(p => (
                                                    <SelectItem key={p.id} value={p.name}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="program"
                                            value={data.program}
                                            onChange={e => setData('program', e.target.value)}
                                            placeholder="e.g., STEM, BSIT (optional)"
                                        />
                                    )}
                                    {errors.program && <p className="text-sm text-destructive">{errors.program}</p>}
                                </div>

                                {/* Notes */}
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Any additional information for the registrar..."
                                        rows={3}
                                        maxLength={1000}
                                    />
                                    {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>What happens next?</AlertTitle>
                                    <AlertDescription className="text-sm space-y-1">
                                        <p>Once you submit, your request will be reviewed by the Registrar. You'll need to:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                                            <li>Submit required enrollment documents</li>
                                            <li>Settle any outstanding balance</li>
                                            <li>Wait for Registrar and Accounting clearance</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-3 justify-end">
                                    <Link href="/student/dashboard">
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing || !data.year_level}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        {processing ? 'Submitting…' : 'Submit Enrollment Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Back link if pending */}
                {hasPendingRequest && (
                    <div className="text-center">
                        <Link href="/student/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
