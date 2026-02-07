import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { reports as reportsRoute } from '@/routes/accounting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, FileText, Calendar, TrendingUp, Users } from 'lucide-react';

interface Student {
    id: number;
    lrn: string;
    full_name: string;
    program?: string;
    year_level?: string;
}

interface PaymentSummary {
    date: string;
    count: number;
    total_amount: string;
}

interface BalanceReport {
    student: Student;
    school_year: string;
    total_amount: string;
    total_paid: string;
    balance: string;
    payment_status: string;
}

interface Props {
    paymentSummary: PaymentSummary[];
    balanceReport: BalanceReport[];
    filters: {
        from?: string;
        to?: string;
        school_year?: string;
        status?: string;
    };
    schoolYears: string[];
    summaryStats: {
        total_collectibles: number;
        total_collected: number;
        fully_paid_count: number;
        partial_paid_count: number;
        unpaid_count: number;
    };
}

export default function AccountingReports({
    paymentSummary = [],
    balanceReport = [],
    filters = {},
    schoolYears = [],
    summaryStats = {
        total_collectibles: 0,
        total_collected: 0,
        fully_paid_count: 0,
        partial_paid_count: 0,
        unpaid_count: 0,
    },
}: Props) {
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFetchReport = () => {
        router.get(
            reportsRoute.url(),
            {
                from: from || undefined,
                to: to || undefined,
                school_year: schoolYear !== 'all' ? schoolYear : undefined,
                status: status !== 'all' ? status : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleExport = (type: 'excel' | 'csv' | 'pdf') => {
        // In a real implementation, this would trigger a backend route to generate the file
        alert(`Export as ${type.toUpperCase()} - This would download the report in ${type} format`);
        
        // Example implementation:
        // window.location.href = route('accounting.reports.export', {
        //     type,
        //     from,
        //     to,
        //     school_year: schoolYear !== 'all' ? schoolYear : undefined,
        //     status: status !== 'all' ? status : undefined,
        // });
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: string | number) => {
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        if (status === 'paid') {
            return <Badge className="bg-green-500">Fully Paid</Badge>;
        } else if (status === 'partial') {
            return <Badge className="bg-yellow-500">Partial</Badge>;
        } else {
            return <Badge variant="destructive">Unpaid</Badge>;
        }
    };

    const calculatePercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(1);
    };

    const totalStudents =
        summaryStats.fully_paid_count +
        summaryStats.partial_paid_count +
        summaryStats.unpaid_count;

    return (
        <AccountingLayout>
            <Head title="Reports" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Reports & Analytics"
                    description="Generate comprehensive reports on payments and fees"
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                <FileText className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                            <Button variant="outline" onClick={() => handleExport('csv')}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button onClick={() => handleExport('excel')}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>
                    }
                />

                {/* Summary Statistics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Collectibles</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(summaryStats.total_collectibles)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Outstanding balance from all students
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                            <FileDown className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(summaryStats.total_collected)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">All-time payments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fully Paid</CardTitle>
                            <Users className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.fully_paid_count}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {calculatePercentage(summaryStats.fully_paid_count, totalStudents)}% of
                                students
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
                            <Users className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.unpaid_count}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {calculatePercentage(summaryStats.unpaid_count, totalStudents)}% of students
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Report Filters
                        </CardTitle>
                        <CardDescription>
                            Customize report parameters to generate specific views
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">Date From</Label>
                                <Input
                                    id="from"
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="to">Date To</Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schoolYear">School Year</Label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger id="schoolYear">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {schoolYears.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Payment Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="paid">Fully Paid</SelectItem>
                                        <SelectItem value="partial">Partial Payment</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFetchReport}>Generate Report</Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFrom('');
                                    setTo('');
                                    setSchoolYear('all');
                                    setStatus('all');
                                    router.get(reportsRoute.url());
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Tabs */}
                <Tabs defaultValue="balance" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="balance">Balance Report</TabsTrigger>
                        <TabsTrigger value="collection">Collection Summary</TabsTrigger>
                    </TabsList>

                    <TabsContent value="balance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Balance Report</CardTitle>
                                <CardDescription>
                                    Detailed breakdown of student fees and balances
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>LRN</TableHead>
                                                <TableHead>Program</TableHead>
                                                <TableHead>School Year</TableHead>
                                                <TableHead className="text-right">Total Amount</TableHead>
                                                <TableHead className="text-right">Total Paid</TableHead>
                                                <TableHead className="text-right">Balance</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {balanceReport.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                                            <p className="text-muted-foreground">
                                                                No data available. Adjust filters and generate report.
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                balanceReport.map((record, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">
                                                            {record.student.full_name}
                                                        </TableCell>
                                                        <TableCell>{record.student.lrn}</TableCell>
                                                        <TableCell>
                                                            {record.student.program || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>{record.school_year}</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(record.total_amount)}
                                                        </TableCell>
                                                        <TableCell className="text-right text-green-600">
                                                            {formatCurrency(record.total_paid)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            {formatCurrency(record.balance)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(record.payment_status)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="collection" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Collection Summary</CardTitle>
                                <CardDescription>
                                    Timeline of payment collections grouped by date
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Number of Payments</TableHead>
                                                <TableHead className="text-right">Total Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paymentSummary.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-24 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                                            <p className="text-muted-foreground">
                                                                No payment data available for the selected period.
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paymentSummary.map((summary, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">
                                                            {formatDate(summary.date)}
                                                        </TableCell>
                                                        <TableCell>{summary.count} payments</TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">
                                                            {formatCurrency(summary.total_amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                            {paymentSummary.length > 0 && (
                                                <TableRow className="bg-muted/50 font-semibold">
                                                    <TableCell>Total</TableCell>
                                                    <TableCell>
                                                        {paymentSummary.reduce((sum, s) => sum + s.count, 0)}{' '}
                                                        payments
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        {formatCurrency(
                                                            paymentSummary.reduce(
                                                                (sum, s) => sum + parseFloat(s.total_amount),
                                                                0
                                                            )
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AccountingLayout>
    );
}
