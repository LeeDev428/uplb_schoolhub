import { Head, Link } from '@inertiajs/react';
import SuperAccountingLayout from '@/layouts/super-accounting/super-accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    BadgeDollarSign,
    CheckCircle,
    Clock,
    FileText,
    RotateCcw,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface RefundStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: string;
    approvedAmount: string;
}

interface MonthlyRefund {
    month: string;
    count: number;
    amount: number;
}

interface RecentRefund {
    id: number;
    student_name: string;
    lrn: string;
    amount: string;
    reason: string;
    status: string;
    created_at: string;
}

interface Props {
    refundStats: RefundStats;
    monthlyRefunds: MonthlyRefund[];
    droppedStudentsCount: number;
    recentRefunds: RecentRefund[];
    refundTrend: 'up' | 'down' | 'stable';
}

const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function SuperAccountingDashboard({
    refundStats,
    monthlyRefunds = [],
    droppedStudentsCount = 0,
    recentRefunds = [],
    refundTrend = 'stable',
}: Props) {
    return (
        <SuperAccountingLayout>
            <Head title="Super Accounting Dashboard" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Super Accounting Dashboard"
                    description="Manage refund requests and view financial reports"
                />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Refund Requests</CardTitle>
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{refundStats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {refundTrend === 'up' ? (
                                    <span className="text-red-500 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" /> Increasing
                                    </span>
                                ) : refundTrend === 'down' ? (
                                    <span className="text-green-500 flex items-center gap-1">
                                        <TrendingDown className="h-3 w-3" /> Decreasing
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">Stable</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{refundStats.pending}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting your review
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved Refunds</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{refundStats.approved}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(refundStats.approvedAmount)} total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dropped Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{droppedStudentsCount}</div>
                            <p className="text-xs text-muted-foreground">
                                May request refunds
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Refunds Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BadgeDollarSign className="h-5 w-5" />
                                Monthly Refunds Overview
                            </CardTitle>
                            <CardDescription>
                                Refund requests and amounts by month
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {monthlyRefunds.length > 0 ? (
                                <div className="space-y-4">
                                    {monthlyRefunds.slice(0, 6).map((month, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{month.month}</span>
                                                <Badge variant="outline">{month.count} requests</Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {formatCurrency(month.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <FileText className="h-8 w-8 mb-2" />
                                    <p>No refund data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Refund Requests */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Refund Requests</CardTitle>
                                <CardDescription>
                                    Latest refund submissions
                                </CardDescription>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/super-accounting/refunds">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentRefunds.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentRefunds.map((refund) => (
                                            <TableRow key={refund.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{refund.student_name}</p>
                                                        <p className="text-xs text-muted-foreground">{refund.lrn}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(refund.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={statusColors[refund.status] || ''}
                                                        variant="outline"
                                                    >
                                                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {format(new Date(refund.created_at), 'MMM d, yyyy')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <RotateCcw className="h-8 w-8 mb-2" />
                                    <p>No recent refund requests</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks and shortcuts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Button asChild>
                                <Link href="/super-accounting/refunds?tab=pending">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Review Pending Refunds ({refundStats.pending})
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/super-accounting/reports">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Reports
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/super-accounting/reports?export=csv">
                                    <BadgeDollarSign className="mr-2 h-4 w-4" />
                                    Export Financial Data
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SuperAccountingLayout>
    );
}
