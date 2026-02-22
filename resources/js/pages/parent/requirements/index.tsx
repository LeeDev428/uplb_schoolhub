import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ParentLayout from '@/layouts/parent/parent-layout';
import { CheckCircle2, Clock, XCircle, FileText, AlertCircle } from 'lucide-react';

interface Requirement {
    id: number;
    name: string;
    description: string | null;
    is_required: boolean;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    submitted_at: string | null;
    approved_at: string | null;
    notes: string | null;
}

interface ChildRequirements {
    id: number;
    full_name: string;
    student_id: string | number;
    enrollment_status: string;
    department: string | null;
    year_level: string | null;
    requirements: Requirement[];
    stats: {
        total: number;
        approved: number;
        submitted: number;
        pending: number;
        rejected: number;
        percentage: number;
    };
}

interface Props {
    children: ChildRequirements[];
}

const STATUS_CONFIG = {
    pending:   { icon: Clock,         label: 'Pending',   classes: 'bg-gray-100 text-gray-600' },
    submitted: { icon: FileText,      label: 'Submitted', classes: 'bg-blue-100 text-blue-700' },
    approved:  { icon: CheckCircle2,  label: 'Approved',  classes: 'bg-green-100 text-green-700' },
    rejected:  { icon: XCircle,       label: 'Rejected',  classes: 'bg-red-100 text-red-700' },
} as const;

function ChildRequirementsCard({ child }: { child: ChildRequirements }) {
    const s = child.stats;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg">{child.full_name}</CardTitle>
                        <CardDescription>
                            {child.year_level && `${child.year_level} · `}
                            {child.department && `${child.department} · `}
                            ID: {child.student_id}
                        </CardDescription>
                    </div>
                    <Badge
                        className={`flex-shrink-0 ${s.percentage === 100 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
                    >
                        {s.percentage}% Complete
                    </Badge>
                </div>

                {/* Progress */}
                <div className="mt-3">
                    <Progress value={s.percentage} className="h-2.5" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{s.approved} approved of {s.total} total</span>
                        {s.pending > 0 && <span className="text-amber-600">{s.pending} pending</span>}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Summary counters */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {([
                        { label: 'Approved', count: s.approved, color: 'text-green-600' },
                        { label: 'Submitted', count: s.submitted, color: 'text-blue-600' },
                        { label: 'Pending', count: s.pending, color: 'text-gray-600' },
                        { label: 'Rejected', count: s.rejected, color: 'text-red-600' },
                    ] as const).map(item => (
                        <div key={item.label} className="rounded-lg border p-2 text-center">
                            <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Requirements list */}
                {child.requirements.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        No requirements found for this student.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {child.requirements.map(req => {
                            const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
                            const Icon = cfg.icon;
                            return (
                                <div key={req.id} className="flex items-start justify-between rounded-lg border p-3 gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{req.name}</p>
                                            {req.is_required && (
                                                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 rounded px-1 py-0.5">Required</span>
                                            )}
                                        </div>
                                        {req.notes && (
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{req.notes}</p>
                                        )}
                                        {req.approved_at && (
                                            <p className="text-xs text-green-600 mt-0.5">Approved: {req.approved_at}</p>
                                        )}
                                        {req.submitted_at && req.status !== 'approved' && (
                                            <p className="text-xs text-muted-foreground mt-0.5">Submitted: {req.submitted_at}</p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${cfg.classes}`}>
                                        <Icon className="h-3 w-3" />
                                        {cfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ParentRequirements({ children }: Props) {
    const overallAvg = children.length > 0
        ? Math.round(children.reduce((s, c) => s + c.stats.percentage, 0) / children.length)
        : 0;

    return (
        <>
            <Head title="Requirements" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Requirements</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Track document submission status for your children</p>
                    </div>
                    {children.length > 0 && (
                        <div className="rounded-xl border px-4 py-3 text-right self-start sm:self-auto">
                            <p className="text-xs text-muted-foreground">Average Completion</p>
                            <p className={`text-xl font-bold ${overallAvg === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                                {overallAvg}%
                            </p>
                        </div>
                    )}
                </div>

                {children.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No children linked to your parent account.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {children.map(child => (
                            <ChildRequirementsCard key={child.id} child={child} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ParentRequirements.layout = (page: React.ReactNode) => <ParentLayout>{page}</ParentLayout>;
