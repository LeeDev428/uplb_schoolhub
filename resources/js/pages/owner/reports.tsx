import { Head, router } from '@inertiajs/react';
import { FileDown, FileText, Calendar, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { ExportButton } from '@/components/export-button';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StudentPhoto } from '@/components/ui/student-photo';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { reports as reportsRoute } from '@/routes/owner';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Audit Reports', href: '/owner/reports' },
];

interface Student {
    id: number;
    lrn: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    student_photo_url?: string | null;
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

interface FeeReportItem {
    name: string;
    selling_price: number;
    cost_price: number;
    profit: number;
    students_availed: number;
    total_revenue: number;
    total_income: number;
}

interface FeeReportCategory {
    category: string;
    items: FeeReportItem[];
    total_revenue: number;
    total_income: number;
    total_assigned: number;
    total_collected: number;
}

interface DocFeeReportItem {
    name: string;
    price: number;
    students_availed: number;
    total_revenue: number;
}

interface DocFeeReportCategory {
    category: string;
    items: DocFeeReportItem[];
    total_revenue: number;
}

interface Department {
    id: number;
    name: string;
    code: string;
    classification: string;
}

interface DepartmentRow {
    department: string;
    students: number;
    billed: number;
    collected: number;
    balance: number;
    collection_rate: number;
}

interface Props {
    paymentSummary: PaymentSummary[];
    balanceReport: BalanceReport[];
    feeReport: FeeReportCategory[];
    documentFeeReport: DocFeeReportCategory[];
    departmentAnalysis: DepartmentRow[];
    filters: {
        from?: string;
        to?: string;
        school_year?: string;
        status?: string;
        department_id?: string;
        classification?: string;
    };
    schoolYears: string[];
    departments: Department[];
    classifications: string[];
    summaryStats: {
        total_collectibles: number;
        total_collected: number;
        fully_paid_count: number;
        partial_paid_count: number;
        unpaid_count: number;
    };
}

export default function OwnerReports({
    paymentSummary = [],
    balanceReport = [],
    feeReport = [],
    documentFeeReport = [],
    departmentAnalysis = [],
    filters = {},
    schoolYears = [],
    departments = [],
    classifications = [],
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
    const [departmentId, setDepartmentId] = useState(filters.department_id || 'all');
    const [classification, setClassification] = useState(filters.classification || 'all');

    const handleFetchReport = () => {
        router.get(
            reportsRoute.url(),
            {
                from: from || undefined,
                to: to || undefined,
                school_year: schoolYear !== 'all' ? schoolYear : undefined,
                status: status !== 'all' ? status : undefined,
                department_id: departmentId !== 'all' ? departmentId : undefined,
                classification: classification !== 'all' ? classification : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
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

    const getStatusBadge = (currentStatus: string) => {
        if (currentStatus === 'paid') {
            return <Badge className="bg-green-500">Fully Paid</Badge>;
        }
        if (currentStatus === 'partial') {
            return <Badge className="bg-yellow-500">Partial</Badge>;
        }
        return <Badge variant="destructive">Unpaid</Badge>;
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
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Reports" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Audit Reports"
                    description="Generate comprehensive reports on payments and fees"
                    action={
                        <div className="flex gap-2">
                            <ExportButton
                                exportUrl="/owner/reports/export"
                                filters={{ from, to, school_year: schoolYear, status, department_id: departmentId, classification }}
                                buttonText="Export Report"
                            />
                            <Button variant="outline" onClick={handlePrint}>
                                <FileText className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    }
                />

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
                                {calculatePercentage(summaryStats.fully_paid_count, totalStudents)}% of students
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
                                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="to">Date To</Label>
                                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
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

                            <div className="space-y-2">
                                <Label htmlFor="classification">Classification</Label>
                                <Select value={classification} onValueChange={setClassification}>
                                    <SelectTrigger id="classification">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classifications</SelectItem>
                                        {classifications.map((currentClassification) => (
                                            <SelectItem key={currentClassification} value={currentClassification}>
                                                {currentClassification}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Select value={departmentId} onValueChange={setDepartmentId}>
                                    <SelectTrigger id="department">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id.toString()}>
                                                {department.name}
                                            </SelectItem>
                                        ))}
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
                                    setDepartmentId('all');
                                    setClassification('all');
                                    router.get(reportsRoute.url());
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="balance" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="balance">Balance Report</TabsTrigger>
                        <TabsTrigger value="collection">Collection Summary</TabsTrigger>
                        <TabsTrigger value="fee-income">Fee Income</TabsTrigger>
                        <TabsTrigger value="department">Department Analysis</TabsTrigger>
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
                                                <TableHead>Student No.</TableHead>
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
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <StudentPhoto
                                                                    src={record.student.student_photo_url}
                                                                    firstName={record.student.first_name}
                                                                    lastName={record.student.last_name}
                                                                    size="sm"
                                                                />
                                                                <span className="font-medium">{record.student.full_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{record.student.lrn}</TableCell>
                                                        <TableCell>{record.student.program || 'N/A'}</TableCell>
                                                        <TableCell>{record.school_year}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(record.total_amount)}</TableCell>
                                                        <TableCell className="text-right text-green-600">{formatCurrency(record.total_paid)}</TableCell>
                                                        <TableCell className="text-right font-semibold">{formatCurrency(record.balance)}</TableCell>
                                                        <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
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
                                                        <TableCell className="font-medium">{formatDate(summary.date)}</TableCell>
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
                                                        {paymentSummary.reduce((sum, summary) => sum + summary.count, 0)} payments
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        {formatCurrency(
                                                            paymentSummary.reduce(
                                                                (sum, summary) => sum + parseFloat(summary.total_amount),
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

                    <TabsContent value="fee-income" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Fee Income Report</CardTitle>
                                <CardDescription>
                                    Revenue and income from fee items based on students availed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {feeReport.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                        <FileText className="mb-3 h-10 w-10" />
                                        <p>No fee income data yet. Set the number of students availed in Fee Management.</p>
                                    </div>
                                ) : (
                                    <>
                                        {feeReport.map((category) => (
                                            <div key={category.category} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{category.category}</h3>
                                                    <div className="flex gap-4 text-sm">
                                                        <span className="text-muted-foreground">Assigned: {formatCurrency(category.total_assigned ?? category.total_revenue)}</span>
                                                        <span className="font-medium text-blue-600">Collected: {formatCurrency(category.total_collected ?? 0)}</span>
                                                        <span className="font-medium text-green-600">Income: {formatCurrency(category.total_income)}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-lg border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Fee Item</TableHead>
                                                                <TableHead className="text-right">Selling Price</TableHead>
                                                                <TableHead className="text-right">Profit/Unit</TableHead>
                                                                <TableHead className="text-right">Students Availed</TableHead>
                                                                <TableHead className="text-right">Total Revenue</TableHead>
                                                                <TableHead className="text-right">Total Income</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {category.items.map((item) => (
                                                                <TableRow key={item.name}>
                                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                                    <TableCell className="text-right">{formatCurrency(item.selling_price)}</TableCell>
                                                                    <TableCell className={`text-right ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {formatCurrency(item.profit)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">{item.students_availed.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right font-medium text-blue-600">{formatCurrency(item.total_revenue)}</TableCell>
                                                                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(item.total_income)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-end gap-8 rounded-lg bg-muted p-4 text-sm font-semibold">
                                            <span>Total Assigned: <span className="text-muted-foreground">{formatCurrency(feeReport.reduce((sum, category) => sum + (category.total_assigned ?? category.total_revenue), 0))}</span></span>
                                            <span>Total Collected: <span className="text-blue-600">{formatCurrency(feeReport.reduce((sum, category) => sum + (category.total_collected ?? 0), 0))}</span></span>
                                            <span>Total Income: <span className="text-green-600">{formatCurrency(feeReport.reduce((sum, category) => sum + category.total_income, 0))}</span></span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Document Fee Income Report</CardTitle>
                                <CardDescription>
                                    Revenue from document request fees based on students availed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {documentFeeReport.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                        <FileText className="mb-3 h-10 w-10" />
                                        <p>No document fee income data. Set students availed in Document Fees.</p>
                                    </div>
                                ) : (
                                    <>
                                        {documentFeeReport.map((category) => (
                                            <div key={category.category} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{category.category}</h3>
                                                    <span className="text-sm font-medium text-blue-600">Revenue: {formatCurrency(category.total_revenue)}</span>
                                                </div>
                                                <div className="rounded-lg border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Document Type</TableHead>
                                                                <TableHead className="text-right">Price</TableHead>
                                                                <TableHead className="text-right">Students Availed</TableHead>
                                                                <TableHead className="text-right">Total Revenue</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {category.items.map((item) => (
                                                                <TableRow key={item.name}>
                                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                                    <TableCell className="text-right">{item.students_availed.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right font-semibold text-blue-600">{formatCurrency(item.total_revenue)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-end rounded-lg bg-muted p-4 text-sm font-semibold">
                                            <span>Total Document Fee Revenue: <span className="text-blue-600">{formatCurrency(documentFeeReport.reduce((sum, category) => sum + category.total_revenue, 0))}</span></span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="department" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Department Financial Summary</CardTitle>
                                <CardDescription>Fee billing, collections, and outstanding balances per department</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {departmentAnalysis.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">No department data available.</p>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Department</TableHead>
                                                    <TableHead className="text-right">Students</TableHead>
                                                    <TableHead className="text-right">Total Billed</TableHead>
                                                    <TableHead className="text-right">Collected</TableHead>
                                                    <TableHead className="text-right">Outstanding</TableHead>
                                                    <TableHead>Collection Rate</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {departmentAnalysis.map((department) => {
                                                    const rate = department.collection_rate;
                                                    const rateColor = rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500';

                                                    return (
                                                        <TableRow key={department.department}>
                                                            <TableCell className="font-medium">
                                                                {department.department}
                                                                <span className="ml-1 text-xs text-muted-foreground">({department.students} students)</span>
                                                            </TableCell>
                                                            <TableCell className="text-right">{department.students.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(department.billed)}</TableCell>
                                                            <TableCell className="text-right font-semibold text-green-600">{formatCurrency(department.collected)}</TableCell>
                                                            <TableCell className="text-right">
                                                                <span className={department.balance > 0 ? 'font-semibold text-red-500' : 'text-muted-foreground'}>
                                                                    {formatCurrency(department.balance)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                                        <div className={`h-full rounded-full ${rateColor}`} style={{ width: `${Math.min(rate, 100)}%` }} />
                                                                    </div>
                                                                    <span className="text-xs font-medium tabular-nums">{rate.toFixed(1)}%</span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4 flex flex-wrap justify-end gap-6 rounded-lg bg-muted p-3 text-sm font-semibold">
                                            <span>Billed: <span className="text-foreground">{formatCurrency(departmentAnalysis.reduce((sum, department) => sum + department.billed, 0))}</span></span>
                                            <span>Collected: <span className="text-green-600">{formatCurrency(departmentAnalysis.reduce((sum, department) => sum + department.collected, 0))}</span></span>
                                            <span>Outstanding: <span className="text-red-500">{formatCurrency(departmentAnalysis.reduce((sum, department) => sum + department.balance, 0))}</span></span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </OwnerLayout>
    );
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                    Department Collection Snapshot
                                </CardTitle>
                                <CardDescription>Top departments by amount collected</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {departmentAnalysis.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No department data available.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Department</TableHead>
                                                <TableHead className="text-right">Students</TableHead>
                                                <TableHead className="text-right">Collected</TableHead>
                                                <TableHead className="text-right">Balance</TableHead>
                                                <TableHead>Rate</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {departmentAnalysis.slice(0, 6).map((d) => (
                                                <TableRow key={d.department}>
                                                    <TableCell className="font-medium">{d.department}</TableCell>
                                                    <TableCell className="text-right">{d.students.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-green-600 font-medium">{fmt(d.collected)}</TableCell>
                                                    <TableCell className="text-right text-red-500">{fmt(d.balance)}</TableCell>
                                                    <TableCell><RateBar rate={d.collection_rate} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ════ DEPARTMENT ANALYSIS ════ */}
                    <TabsContent value="department" className="space-y-6 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                    Department Financial Summary
                                </CardTitle>
                                <CardDescription>
                                    Fee billing, collections, and outstanding balances per department
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {departmentAnalysis.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground">No department data available.</p>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Department</TableHead>
                                                    <TableHead className="text-right">Students</TableHead>
                                                    <TableHead className="text-right">Total Billed</TableHead>
                                                    <TableHead className="text-right">Collected</TableHead>
                                                    <TableHead className="text-right">Outstanding</TableHead>
                                                    <TableHead>Collection Rate</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {departmentAnalysis.map((d) => (
                                                    <TableRow key={d.department}>
                                                        <TableCell className="font-medium">{d.department}</TableCell>
                                                        <TableCell className="text-right">{d.students.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right">{fmt(d.billed)}</TableCell>
                                                        <TableCell className="text-right text-green-600 font-semibold">{fmt(d.collected)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={d.balance > 0 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
                                                                {fmt(d.balance)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell><RateBar rate={d.collection_rate} /></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4 flex flex-wrap justify-end gap-6 rounded-lg bg-muted p-3 text-sm font-semibold">
                                            <span>Billed: <span className="text-foreground">{fmt(departmentAnalysis.reduce((s, d) => s + d.billed, 0))}</span></span>
                                            <span>Collected: <span className="text-green-600">{fmt(departmentAnalysis.reduce((s, d) => s + d.collected, 0))}</span></span>
                                            <span>Outstanding: <span className="text-red-500">{fmt(departmentAnalysis.reduce((s, d) => s + d.balance, 0))}</span></span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Collection-rate bar chart per department */}
                        {departmentAnalysis.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Collection Rate by Department</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {departmentAnalysis.map((d) => {
                                        const color =
                                            d.collection_rate >= 80 ? 'bg-green-500'
                                            : d.collection_rate >= 50 ? 'bg-yellow-500'
                                            : 'bg-red-500';
                                        return (
                                            <div key={d.department} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium truncate max-w-sm">{d.department}</span>
                                                    <span className="text-muted-foreground tabular-nums shrink-0 ml-2">{pct(d.collection_rate)}</span>
                                                </div>
                                                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${color}`}
                                                        style={{ width: `${Math.min(d.collection_rate, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ════ FEE INCOME ════ */}
                    <TabsContent value="fee-income" className="space-y-6 mt-4">
                        {/* General Fee Income */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    General Fee Income
                                </CardTitle>
                                <CardDescription>Revenue and projected income per fee category</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {feeReport.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No active fee categories found.</p>
                                ) : (
                                    <>
                                        {feeReport.map((cat) => (
                                            <div key={cat.category} className="space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                                        {cat.category}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3 text-xs font-medium">
                                                        <span>Assigned: <span className="text-foreground">{fmt(cat.total_assigned ?? cat.total_revenue)}</span></span>
                                                        <span className="text-blue-600">Collected: {fmt(cat.total_collected ?? 0)}</span>
                                                        <span className="text-green-600">Income: {fmt(cat.total_income)}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded border overflow-hidden">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Fee Item</TableHead>
                                                                <TableHead className="text-right">Price</TableHead>
                                                                <TableHead className="text-right">Availed</TableHead>
                                                                <TableHead className="text-right">Revenue</TableHead>
                                                                <TableHead className="text-right">Income</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {cat.items.length === 0 ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={5} className="py-4 text-center text-sm text-muted-foreground">
                                                                        No fee items in this category.
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                cat.items.map((item) => (
                                                                    <TableRow key={item.name}>
                                                                        <TableCell>{item.name}</TableCell>
                                                                        <TableCell className="text-right">{fmt(item.selling_price)}</TableCell>
                                                                        <TableCell className="text-right">{item.students_availed.toLocaleString()}</TableCell>
                                                                        <TableCell className="text-right text-blue-600">{fmt(item.total_revenue)}</TableCell>
                                                                        <TableCell className="text-right text-green-600 font-semibold">{fmt(item.total_income)}</TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex flex-wrap justify-end gap-6 rounded-lg bg-muted p-3 text-sm font-semibold">
                                            <span>Assigned: <span className="text-muted-foreground">{fmt(feeReport.reduce((s, c) => s + (c.total_assigned ?? c.total_revenue), 0))}</span></span>
                                            <span>Collected: <span className="text-blue-600">{fmt(feeReport.reduce((s, c) => s + (c.total_collected ?? 0), 0))}</span></span>
                                            <span>Income: <span className="text-green-600">{fmt(feeReport.reduce((s, c) => s + c.total_income, 0))}</span></span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Document Fee Income */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Document Fee Income
                                </CardTitle>
                                <CardDescription>Revenue from approved document requests</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {documentFeeReport.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No document fee data found.</p>
                                ) : (
                                    <>
                                        {documentFeeReport.map((cat) => (
                                            <div key={cat.category} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{cat.category}</h3>
                                                    <span className="text-xs font-medium text-blue-600">Revenue: {fmt(cat.total_revenue)}</span>
                                                </div>
                                                <div className="rounded border overflow-hidden">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Document</TableHead>
                                                                <TableHead className="text-right">Price</TableHead>
                                                                <TableHead className="text-right">Requests</TableHead>
                                                                <TableHead className="text-right">Revenue</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {cat.items.map((item) => (
                                                                <TableRow key={item.name}>
                                                                    <TableCell>{item.name}</TableCell>
                                                                    <TableCell className="text-right">{fmt(item.price)}</TableCell>
                                                                    <TableCell className="text-right">{item.students_availed.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right text-blue-600 font-semibold">{fmt(item.total_revenue)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-end rounded-lg bg-muted p-3 text-sm font-semibold">
                                            Total Revenue: <span className="ml-1 text-blue-600">{fmt(totalDocRevenue)}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ════ CASHIER TRANSACTIONS ════ */}
                    <TabsContent value="cashier" className="space-y-6 mt-4">
                        {/* Cashier Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-indigo-600" />
                                    Cashier Transaction Summary
                                </CardTitle>
                                <CardDescription>Total collections per accounting staff member</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {cashierSummary.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No cashier data available.</p>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Cashier</TableHead>
                                                    <TableHead className="text-right">Transactions</TableHead>
                                                    <TableHead className="text-right">Total Collected</TableHead>
                                                    <TableHead className="text-right">Cash</TableHead>
                                                    <TableHead className="text-right">GCash</TableHead>
                                                    <TableHead className="text-right">Bank</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cashierSummary.map((c) => (
                                                    <TableRow key={c.cashier}>
                                                        <TableCell className="font-medium">{c.cashier}</TableCell>
                                                        <TableCell className="text-right">{c.transaction_count.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">{fmt(c.total_amount)}</TableCell>
                                                        <TableCell className="text-right text-sm">{fmt(c.cash_total)}</TableCell>
                                                        <TableCell className="text-right text-sm">{fmt(c.gcash_total)}</TableCell>
                                                        <TableCell className="text-right text-sm">{fmt(c.bank_total)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4 flex flex-wrap justify-end gap-6 rounded-lg bg-muted p-3 text-sm font-semibold">
                                            <span>Transactions: <span className="text-foreground">{cashierSummary.reduce((s, c) => s + c.transaction_count, 0).toLocaleString()}</span></span>
                                            <span>Total: <span className="text-green-600">{fmt(cashierSummary.reduce((s, c) => s + c.total_amount, 0))}</span></span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Receipt className="h-5 w-5 text-gray-600" />
                                            Recent Transactions
                                        </CardTitle>
                                        <CardDescription>Last 50 payment records</CardDescription>
                                    </div>
                                    <input
                                        type="search"
                                        placeholder="Search student / OR / cashier…"
                                        value={txSearch}
                                        onChange={(e) => setTxSearch(e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:w-64"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredTx.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        {txSearch ? 'No transactions match your search.' : 'No transactions found.'}
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>OR #</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>For</TableHead>
                                                    <TableHead>Cashier</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredTx.map((t) => (
                                                    <TableRow key={t.id}>
                                                        <TableCell className="font-mono text-xs">{t.or_number}</TableCell>
                                                        <TableCell className="text-sm">{t.date}</TableCell>
                                                        <TableCell className="font-medium text-sm">{t.student}</TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">{fmt(t.amount)}</TableCell>
                                                        <TableCell>
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${methodColor[t.method?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                {t.method?.toUpperCase() ?? 'CASH'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-sm capitalize">{t.payment_for}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{t.cashier}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ════ EXPORTS ════ */}
                    <TabsContent value="exports" className="mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Financial Reports</CardTitle>
                                    <CardDescription>Export payment transactions and fee balances</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold text-sm">Payment Transactions</p>
                                            <p className="text-xs text-muted-foreground">All OR numbers, dates, and amounts</p>
                                        </div>
                                        <Button size="sm"
                                            onClick={() => (window.location.href = '/owner/reports/export/financial?format=csv')}>
                                            <Download className="mr-2 h-4 w-4" /> CSV
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold text-sm">Student Balances</p>
                                            <p className="text-xs text-muted-foreground">Outstanding amounts per student</p>
                                        </div>
                                        <Button size="sm"
                                            onClick={() => (window.location.href = '/owner/reports/export/financial?format=csv')}>
                                            <Download className="mr-2 h-4 w-4" /> CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Reports</CardTitle>
                                    <CardDescription>Export enrollment and demographic data</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold text-sm">Student Master List</p>
                                            <p className="text-xs text-muted-foreground">Complete student information</p>
                                        </div>
                                        <Button size="sm"
                                            onClick={() => (window.location.href = '/owner/reports/export/students?format=csv')}>
                                            <Download className="mr-2 h-4 w-4" /> CSV
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div>
                                            <p className="font-semibold text-sm">Department Enrollment</p>
                                            <p className="text-xs text-muted-foreground">Students grouped by department</p>
                                        </div>
                                        <Button size="sm"
                                            onClick={() => (window.location.href = '/owner/reports/export/students?format=csv')}>
                                            <Download className="mr-2 h-4 w-4" /> CSV
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Additional Reports</CardTitle>
                                    <CardDescription>More report types — coming soon</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-3">
                                    {['Academic Performance', 'Attendance Records', 'Custom Reports'].map((label) => (
                                        <div key={label} className="rounded-lg border p-4">
                                            <h4 className="mb-1 font-semibold text-sm">{label}</h4>
                                            <p className="mb-3 text-xs text-muted-foreground">Feature in development</p>
                                            <Button variant="outline" size="sm" disabled>Coming Soon</Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </OwnerLayout>
    );
}
