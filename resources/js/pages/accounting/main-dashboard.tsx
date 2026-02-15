import { Head } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Clock, DollarSign, Download, FileText, RefreshCw, Users } from 'lucide-react';
import { useState } from 'react';

interface Stats {
    total_students: number;
    fully_paid: number;
    partial_payment: number;
    overdue: number;
    document_payments: number;
}

interface MonthlyCollection {
    month: string;
    month_name: string;
    amount: number;
    time: string;
}

interface DepartmentBalance {
    department: string;
    student_count: number;
    balance: number;
}

interface RecentPayment {
    id: number;
    student_name: string;
    amount: number;
    method: string;
    or_number: string;
    time_ago: string;
}

interface Props {
    stats: Stats;
    monthlyCollections: MonthlyCollection[];
    departmentBalances: DepartmentBalance[];
    recentPayments: RecentPayment[];
    totalOutstanding: number;
    averageCollectionTime: string;
    years: number[];
    selectedYear: number;
}

export default function MainDashboard({
    stats,
    monthlyCollections,
    departmentBalances,
    recentPayments,
    totalOutstanding,
    averageCollectionTime,
    years,
    selectedYear,
}: Props) {
    const [year, setYear] = useState(selectedYear.toString());

    const formatCurrency = (amount: number) => {
        return `₱ ${amount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleYearChange = (value: string) => {
        setYear(value);
        window.location.href = `/accounting/dashboard?year=${value}`;
    };

    // Find max amount for chart scaling
    const maxAmount = Math.max(...(monthlyCollections?.map(m => m.amount) || [1]), 1);

    return (
        <AccountingLayout>
            <Head title="Main Dashboard" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Dashboard Overview"
                        description="Monitor student payments and fee collections"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-3xl font-bold">{stats?.total_students ?? 0}</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-blue-600 font-medium">Total Students</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-3xl font-bold">{stats?.fully_paid ?? 0}</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-green-600 font-medium">Fully Paid</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-3xl font-bold">{stats?.partial_payment ?? 0}</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-yellow-600 font-medium">Partial Payment</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-3xl font-bold">{stats?.overdue ?? 0}</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-600 font-medium">Overdue</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-3xl font-bold">{stats?.document_payments ?? 0}</CardTitle>
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-purple-600 font-medium">Document Payments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Collection Chart */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Monthly Collection
                            </CardTitle>
                            <CardDescription>
                                {averageCollectionTime && `⏱ Average collection time: ${averageCollectionTime}`}
                            </CardDescription>
                        </div>
                        <Select value={year} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {(years || [new Date().getFullYear()]).map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2 h-64 pt-8">
                            {(monthlyCollections || []).map((month, index) => {
                                const heightPercent = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div 
                                            className="w-full bg-blue-600 rounded-t-md transition-all hover:bg-blue-700 cursor-pointer min-h-[4px]"
                                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                            title={formatCurrency(month.amount)}
                                        />
                                        <div className="text-center">
                                            <p className="text-sm font-medium">{month.month_name}</p>
                                            <p className="text-xs text-blue-600">{formatCurrency(month.amount)}</p>
                                            <p className="text-xs text-muted-foreground">({month.time})</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Outstanding Balance by Department */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Outstanding Balance by Department
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                            {(departmentBalances || []).map((dept, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm font-medium truncate">{dept.department}</span>
                                        <span className="text-sm font-bold text-red-600">
                                            {formatCurrency(dept.balance)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {dept.student_count} students with balance
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground">
                                TOTAL OUTSTANDING BALANCE
                            </span>
                            <span className="text-2xl font-bold text-red-600">
                                {formatCurrency(totalOutstanding ?? 0)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Payment Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Payment Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(recentPayments || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No recent payment activities
                                </p>
                            ) : (
                                (recentPayments || []).map((payment, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                            payment.method === 'GCASH' ? 'bg-blue-100' :
                                            payment.method === 'CASH' ? 'bg-green-100' : 'bg-purple-100'
                                        }`}>
                                            <DollarSign className={`h-5 w-5 ${
                                                payment.method === 'GCASH' ? 'text-blue-600' :
                                                payment.method === 'CASH' ? 'text-green-600' : 'text-purple-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                <span className="text-blue-600">{payment.student_name}</span>
                                                {' '}made a payment of{' '}
                                                <span className="text-green-600 font-bold">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {payment.time_ago} • {payment.method} • {payment.or_number}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AccountingLayout>
    );
}
