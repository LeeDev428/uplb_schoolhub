import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, TrendingUp, Users, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export default function OwnerReports({ summary, school_year }: ReportsProps) {
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
            </div>
        </OwnerLayout>
    );
}
