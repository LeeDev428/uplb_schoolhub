import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Download,
    FileBarChart,
    TrendingUp,
    Users,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { PhilippinePeso } from '@/components/icons/philippine-peso';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import SuperAccountingLayout from '@/layouts/super-accounting/super-accounting-layout';

interface SummaryStats {
    totalRequests: number;
    totalApproved: number;
    totalRejected: number;
    totalPending: number;
    totalAmountRequested: number;
    totalAmountApproved: number;
    averageProcessingDays: number;
}

interface MonthlyBreakdown {
    month: string;
    year: number;
    requests: number;
    approved: number;
    rejected: number;
    amountRequested: number;
    amountApproved: number;
}

interface Props {
    summary: SummaryStats;
    monthlyBreakdown: MonthlyBreakdown[];
    selectedYear: number;
    availableYears: number[];
}

const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Reports({ summary, monthlyBreakdown = [], selectedYear, availableYears = [] }: Props) {
    const [year, setYear] = useState(selectedYear?.toString() || new Date().getFullYear().toString());

    const handleYearChange = (newYear: string) => {
        setYear(newYear);
        router.get('/super-accounting/reports', { year: newYear }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = `/super-accounting/reports/export?year=${year}`;
    };

    const approvalRate = summary.totalRequests > 0 
        ? ((summary.totalApproved / summary.totalRequests) * 100).toFixed(1) 
        : '0';

    return (
        <SuperAccountingLayout>
            <Head title="Refund Reports" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Refund Reports"
                        description="Comprehensive refund statistics and analytics"
                    />
                    <div className="flex items-center gap-4">
                        <Select value={year} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <FileBarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalRequests}</div>
                            <p className="text-xs text-muted-foreground">
                                For year {year}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvalRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.totalApproved} approved / {summary.totalRejected} rejected
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Amount Approved</CardTitle>
                            <PhilippinePeso className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(summary.totalAmountApproved)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                of {formatCurrency(summary.totalAmountRequested)} requested
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.averageProcessingDays} days
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From request to decision
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Breakdown */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <CardTitle className="text-base">Pending</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.totalPending}</div>
                            <p className="text-sm text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <CardTitle className="text-base">Approved</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.totalApproved}</div>
                            <p className="text-sm text-muted-foreground">
                                {formatCurrency(summary.totalAmountApproved)} total
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-base">Rejected</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.totalRejected}</div>
                            <p className="text-sm text-muted-foreground">Did not qualify</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Breakdown Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Monthly Breakdown - {year}
                        </CardTitle>
                        <CardDescription>
                            Detailed refund statistics by month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-center">Requests</TableHead>
                                    <TableHead className="text-center">Approved</TableHead>
                                    <TableHead className="text-center">Rejected</TableHead>
                                    <TableHead className="text-right">Amount Requested</TableHead>
                                    <TableHead className="text-right">Amount Approved</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyBreakdown.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <FileBarChart className="h-8 w-8 mb-2" />
                                                <p>No data available for {year}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    monthlyBreakdown.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.month}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{item.requests}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    {item.approved}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    {item.rejected}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.amountRequested)}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {formatCurrency(item.amountApproved)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Totals Row */}
                        {monthlyBreakdown.length > 0 && (
                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Year Total</span>
                                    <div className="flex gap-8">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Requested</p>
                                            <p className="font-semibold">{formatCurrency(summary.totalAmountRequested)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Approved</p>
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(summary.totalAmountApproved)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAccountingLayout>
    );
}
