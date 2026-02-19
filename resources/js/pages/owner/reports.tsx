import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, TrendingUp, Users, Wallet, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/owner/reports',
    },
];

interface ReportsProps {
    summary: {
        total_students: number;
        total_revenue: number;
        total_expected: number;
        total_balance: number;
        collection_rate: number;
    };
    school_year: string;
    feeReport: {
        category: string;
        items: { name: string; selling_price: number; profit: number; students_availed: number; total_revenue: number; total_income: number }[];
        total_revenue: number;
        total_income: number;
        total_assigned: number;
        total_collected: number;
    }[];
    documentFeeReport: {
        category: string;
        items: { name: string; price: number; students_availed: number; total_revenue: number }[];
        total_revenue: number;
    }[];
}

export default function OwnerReports({ summary, school_year, feeReport = [], documentFeeReport = [] }: ReportsProps) {
    const handleExport = (type: string, format: string) => {
        const url = type === 'financial' 
            ? `/owner/reports/export/financial?format=${format}`
            : `/owner/reports/export/students?format=${format}`;
        
        window.location.href = url;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Export and analyze school data
                        </p>
                    </div>
                    <Select defaultValue={school_year}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select school year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2022-2023">2022-2023</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_students.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Enrolled this year</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">Collected payments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.collection_rate}%</div>
                            <p className="text-xs text-muted-foreground">Of expected revenue</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_balance)}</div>
                            <p className="text-xs text-muted-foreground">Pending payments</p>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Export Options */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Reports</CardTitle>
                            <CardDescription>
                                Export detailed financial data including payments, fees, and balances
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h4 className="font-semibold">Payment Transactions</h4>
                                    <p className="text-sm text-muted-foreground">
                                        All payments with OR numbers and dates
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleExport('financial', 'csv')}
                                    size="sm"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h4 className="font-semibold">Student Balances</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Detailed fee breakdown per student
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleExport('financial', 'csv')}
                                    size="sm"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Student Reports</CardTitle>
                            <CardDescription>
                                Export student enrollment, demographic, and academic data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h4 className="font-semibold">Student Master List</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Complete student information and enrollment
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleExport('students', 'csv')}
                                    size="sm"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h4 className="font-semibold">Department Enrollment</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Students grouped by department and program
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleExport('students', 'csv')}
                                    size="sm"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Report Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Reports</CardTitle>
                        <CardDescription>
                            Other available reports and analytics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 font-semibold">Academic Performance</h4>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Grades and performance metrics
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Coming Soon
                            </Button>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 font-semibold">Attendance Records</h4>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Student and faculty attendance data
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Coming Soon
                            </Button>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 font-semibold">Custom Reports</h4>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Build your own custom reports
                            </p>
                            <Button variant="outline" size="sm" disabled>
                                Coming Soon
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Income Section — always visible */}
                <Separator />
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <h2 className="text-xl font-bold">Fee Income Overview</h2>
                    </div>

                    {/* General Fee Income */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General Fee Income</CardTitle>
                            <CardDescription>Revenue and income based on fee items × students availed</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {feeReport.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">No active fee categories found.</p>
                            ) : (
                                <>
                                    {feeReport.map((cat) => (
                                        <div key={cat.category}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-semibold uppercase text-muted-foreground">{cat.category}</h3>
                                                <div className="flex gap-3 text-sm">
                                                    <span className="text-muted-foreground">Assigned: {formatCurrency(cat.total_assigned ?? cat.total_revenue)}</span>
                                                    <span className="text-blue-600 font-medium">Collected: {formatCurrency(cat.total_collected ?? 0)}</span>
                                                    <span className="text-green-600 font-medium">Income: {formatCurrency(cat.total_income)}</span>
                                                </div>
                                            </div>
                                            <div className="rounded border">
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
                                                                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-4">No fee items in this category.</TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            cat.items.map((item) => (
                                                                <TableRow key={item.name}>
                                                                    <TableCell>{item.name}</TableCell>
                                                                    <TableCell className="text-right">{formatCurrency(item.selling_price)}</TableCell>
                                                                    <TableCell className="text-right">{item.students_availed.toLocaleString()}</TableCell>
                                                                    <TableCell className="text-right text-blue-600">{formatCurrency(item.total_revenue)}</TableCell>
                                                                    <TableCell className="text-right text-green-600 font-semibold">{formatCurrency(item.total_income)}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end gap-6 rounded-lg bg-muted p-3 text-sm font-semibold">
                                        <span>Total Assigned: <span className="text-muted-foreground">{formatCurrency(feeReport.reduce((s, c) => s + (c.total_assigned ?? c.total_revenue), 0))}</span></span>
                                        <span>Total Collected: <span className="text-blue-600">{formatCurrency(feeReport.reduce((s, c) => s + (c.total_collected ?? 0), 0))}</span></span>
                                        <span>Total Income: <span className="text-green-600">{formatCurrency(feeReport.reduce((s, c) => s + c.total_income, 0))}</span></span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Document Fee Income */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Fee Income</CardTitle>
                            <CardDescription>Revenue from document request fees</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {documentFeeReport.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">No active document fee items found.</p>
                            ) : (
                                <>
                                    {documentFeeReport.map((cat) => (
                                        <div key={cat.category}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-semibold uppercase text-muted-foreground">{cat.category}</h3>
                                                <span className="text-blue-600 font-medium text-sm">Revenue: {formatCurrency(cat.total_revenue)}</span>
                                            </div>
                                            <div className="rounded border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Document</TableHead>
                                                            <TableHead className="text-right">Price</TableHead>
                                                            <TableHead className="text-right">Availed</TableHead>
                                                            <TableHead className="text-right">Revenue</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {cat.items.map((item) => (
                                                            <TableRow key={item.name}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                                <TableCell className="text-right">{item.students_availed.toLocaleString()}</TableCell>
                                                                <TableCell className="text-right text-blue-600 font-semibold">{formatCurrency(item.total_revenue)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-end rounded-lg bg-muted p-3 text-sm font-semibold">
                                        <span>Total Revenue: <span className="text-blue-600">{formatCurrency(documentFeeReport.reduce((s, c) => s + c.total_revenue, 0))}</span></span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </OwnerLayout>
    );
}
