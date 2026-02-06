import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/layouts/student/student-layout';

type Requirement = {
    id: number;
    name: string;
    description: string | null;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    submitted_at: string | null;
    approved_at: string | null;
    notes: string | null;
};

type Props = {
    requirements: Requirement[];
    student: {
        name: string;
        student_id: string;
    };
};

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        variant: 'secondary' as const,
        color: 'text-gray-500',
    },
    submitted: {
        label: 'Submitted',
        icon: FileText,
        variant: 'default' as const,
        color: 'text-blue-500',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle2,
        variant: 'default' as const,
        color: 'text-green-500',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        variant: 'destructive' as const,
        color: 'text-red-500',
    },
};

export default function Requirements({ requirements, student }: Props) {
    const completedCount = requirements.filter((r) => r.status === 'approved').length;
    const submittedCount = requirements.filter((r) => r.status === 'submitted').length;
    const pendingCount = requirements.filter((r) => r.status === 'pending').length;

    return (
        <StudentLayout>
            <Head title="My Requirements" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Requirements</h1>
                    <p className="text-muted-foreground">
                        Track your enrollment requirements and submission status
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{requirements.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                            <FileText className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submittedCount}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Requirements List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Requirements List</CardTitle>
                        <CardDescription>
                            View the status of all your enrollment requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {requirements.map((requirement) => {
                                const config = statusConfig[requirement.status];
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={requirement.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center"
                                    >
                                        <div className="flex flex-1 items-start gap-3">
                                            <StatusIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.color}`} />
                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-semibold">{requirement.name}</h3>
                                                {requirement.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {requirement.description}
                                                    </p>
                                                )}
                                                {requirement.notes && (
                                                    <div className="mt-2 rounded-md bg-muted p-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            <span className="font-medium">Note:</span> {requirement.notes}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                    {requirement.submitted_at && (
                                                        <span>Submitted: {requirement.submitted_at}</span>
                                                    )}
                                                    {requirement.approved_at && (
                                                        <span>Approved: {requirement.approved_at}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end md:justify-center">
                                            <Badge variant={config.variant}>{config.label}</Badge>
                                        </div>
                                    </div>
                                );
                            })}

                            {requirements.length === 0 && (
                                <div className="py-12 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        No requirements assigned yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
