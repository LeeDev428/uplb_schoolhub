import { Head } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, DollarSign, Download, FileText, RefreshCw, TrendingUp, Users, XCircle, BarChart3 } from 'lucide-react';
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
    student_photo_url?: string | null;
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
    projectedRevenue?: number;
    totalCollected?: number;
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
    projectedRevenue = 0,
    totalCollected = 0,
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

    const totalStudents = stats?.total_students ?? 0;
    const collectionRate = projectedRevenue > 0 ? ((totalCollected / projectedRevenue) * 100).toFixed(1) : '0.0';
    const fullyPaidRate = totalStudents > 0 ? ((stats?.fully_paid ?? 0) / totalStudents * 100).toFixed(1) : '0.0';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalStudents}</div>
                            <p className="text-xs text-muted-foreground mt-1">{fullyPaidRate}% fully paid</p>
                            <Progress value={parseFloat(fullyPaidRate)} className="mt-2 h-1.5" />
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fully Paid</CardTitle>
                            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats?.fully_paid ?? 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">of {totalStudents} enrolled students</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partial Payment</CardTitle>
                            <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats?.partial_payment ?? 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Needs follow-up</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue / Unpaid</CardTitle>
                            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats?.overdue ?? 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Overdue accounts</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Projected Revenue</p>
                                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(projectedRevenue)}</p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Collected</p>
                                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalCollected)}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                                    <p className="text-2xl font-bold text-red-700">{formatCurrency(totalOutstanding)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Collection Rate Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Collection Progress — {selectedYear}
                        </CardTitle>
                        <CardDescription>
                            Overall collection rate against total projected revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Collection Rate</span>
                            <span className="font-semibold">{collectionRate}%</span>
                        </div>
                        <Progress value={Math.min(parseFloat(collectionRate), 100)} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {formatCurrency(totalCollected)} collected out of {formatCurrency(projectedRevenue)} projected
                        </p>
                    </CardContent>
                </Card>

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

                {/* Projected Revenue Section - removed, now shown in top cards */}

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
                                        <Avatar className="h-10 w-10 flex-shrink-0">
                                            <AvatarImage src={payment.student_photo_url ?? undefined} alt={payment.student_name} />
                                            <AvatarFallback className={`text-white text-sm font-semibold ${payment.method === 'GCASH' ? 'bg-blue-600' : payment.method === 'CASH' ? 'bg-green-600' : 'bg-purple-600'}`}>
                                                {payment.student_name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
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
