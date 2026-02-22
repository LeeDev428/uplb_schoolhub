import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calendar, FileText, ChevronRight, GraduationCap, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import ParentLayout from '@/layouts/parent/parent-layout';

interface ChildPayment {
    total_fees: number;
    total_paid: number;
    discount_amount: number;
    balance: number;
    effective_balance: number;
    has_promissory: boolean;
    is_fully_paid: boolean;
}

interface Child {
    id: number;
    full_name: string;
    student_id: string | number;
    photo_url?: string | null;
    enrollment_status: string;
    department?: string | null;
    program?: string | null;
    section?: string | null;
    year_level?: string | null;
    classification?: string | null;
    requirements: {
        total: number;
        approved: number;
        percentage: number;
    };
    payment?: ChildPayment | null;
}

interface Props {
    parentName: string;
    children: Child[];
}

const ENROLLMENT_COLORS: Record<string, string> = {
    enrolled:     'bg-green-100 text-green-800',
    not_enrolled: 'bg-gray-100 text-gray-600',
    pending:      'bg-yellow-100 text-yellow-800',
    dropped:      'bg-red-100 text-red-700',
};

const QUICK_LINKS = [
    { href: '/parent/subjects',  label: 'Subjects',   icon: BookOpen,  color: 'text-purple-600', bg: 'bg-purple-50' },
    { href: '/parent/schedules', label: 'Schedules',  icon: Calendar,  color: 'text-blue-600',   bg: 'bg-blue-50' },
];

function formatPeso(amount: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount);
}

function ChildCard({ child }: { child: Child }) {
    const initials = child.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    const statusLabel = child.enrollment_status.replace(/_/g, ' ');
    const statusBg = ENROLLMENT_COLORS[child.enrollment_status] ?? 'bg-gray-100 text-gray-600';
    const payPercent = child.payment && child.payment.total_fees > 0
        ? Math.round((child.payment.total_paid / child.payment.total_fees) * 100)
        : 0;

    return (
        <Card className="overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 pt-5 pb-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-white flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight truncate">{child.full_name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {child.student_id}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBg}`}>
                                {statusLabel}
                            </span>
                            {child.classification && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    {child.classification}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Academic Info */}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {child.year_level && (
                        <span className="flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {child.year_level}
                        </span>
                    )}
                    {child.section && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            Section: {child.section}
                        </span>
                    )}
                    {child.department && (
                        <span>{child.department}</span>
                    )}
                </div>
            </div>

            <CardContent className="p-4 space-y-4">
                {/* Requirements */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-amber-600" />
                            Requirements
                        </span>
                        <span className="text-sm font-semibold">
                            {child.requirements.approved}/{child.requirements.total}
                            <span className="text-muted-foreground font-normal ml-1">({child.requirements.percentage}%)</span>
                        </span>
                    </div>
                    <Progress value={child.requirements.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {child.requirements.total - child.requirements.approved} remaining
                    </p>
                </div>

                {/* Payment */}
                {child.payment && child.payment.total_fees > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                Fees
                            </span>
                            {child.payment.is_fully_paid ? (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Fully Paid
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Balance: {formatPeso(child.payment.effective_balance)}
                                </span>
                            )}
                        </div>
                        <Progress value={Math.min(payPercent, 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Paid: {formatPeso(child.payment.total_paid)}</span>
                            <span>Total: {formatPeso(child.payment.total_fees)}</span>
                        </div>
                        {child.payment.has_promissory && (
                            <p className="text-xs text-blue-600 mt-1">Promissory note on file</p>
                        )}
                    </div>
                )}

                {/* Quick Links */}
                <div className="flex gap-2 pt-1">
                    {QUICK_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors hover:bg-muted/60"
                        >
                            <link.icon className={`h-3.5 w-3.5 ${link.color}`} />
                            {link.label}
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ParentDashboard({ parentName, children }: Props) {
    return (
        <>
            <Head title="Parent Dashboard" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {parentName}!</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Monitor your {children.length === 1 ? "child's" : "children's"} academic progress
                        </p>
                    </div>
                    <Badge variant="outline" className="self-start sm:self-auto text-sm px-3 py-1">
                        {children.length} {children.length === 1 ? 'Child' : 'Children'} Enrolled
                    </Badge>
                </div>

                {/* Summary Stats */}
                {children.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="pt-4">
                                <p className="text-sm text-muted-foreground">Enrolled</p>
                                <p className="text-2xl font-bold mt-0.5">
                                    {children.filter(c => c.enrollment_status === 'enrolled').length}
                                </p>
                                <p className="text-xs text-muted-foreground">of {children.length} children</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-amber-500">
                            <CardContent className="pt-4">
                                <p className="text-sm text-muted-foreground">Requirements</p>
                                <p className="text-2xl font-bold mt-0.5">
                                    {children.length > 0
                                        ? Math.round(children.reduce((s, c) => s + c.requirements.percentage, 0) / children.length)
                                        : 0}%
                                </p>
                                <p className="text-xs text-muted-foreground">avg completion</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                                <p className="text-sm text-muted-foreground">Fees Settled</p>
                                <p className="text-2xl font-bold mt-0.5">
                                    {children.filter(c => c.payment?.is_fully_paid).length}
                                </p>
                                <p className="text-xs text-muted-foreground">fully paid accounts</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Children Cards */}
                {children.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Children Found</CardTitle>
                            <CardDescription>
                                No student accounts are linked to your parent profile yet. Please contact the registrar.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {children.map(child => (
                            <ChildCard key={child.id} child={child} />
                        ))}
                    </div>
                )}

                {/* Portal Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Parent Portal</CardTitle>
                        <CardDescription>Access your portal features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {QUICK_LINKS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm hover:border-primary/30 group"
                                >
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${link.bg}`}>
                                        <link.icon className={`h-5 w-5 ${link.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm group-hover:text-primary">{link.label}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ParentDashboard.layout = (page: React.ReactNode) => <ParentLayout>{page}</ParentLayout>;
