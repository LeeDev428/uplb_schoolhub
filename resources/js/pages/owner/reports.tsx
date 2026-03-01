import { Head } from '@inertiajs/react';
import {
    Download, TrendingUp, Users, Wallet, DollarSign, Building2,
    CreditCard, BarChart3, FileText, Receipt, Clock, AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports & Analytics', href: '/owner/reports' },
];

/* ─────────────────────── Type Definitions ─────────────────────── */

interface Summary {
    total_students: number;
    total_revenue: number;
    total_expected: number;
    total_balance: number;
    collection_rate: number;
}

interface FeeReportCategory {
    category: string;
    items: {
        name: string;
        selling_price: number;
        profit: number;
        students_availed: number;
        total_revenue: number;
        total_income: number;
    }[];
    total_revenue: number;
    total_income: number;
    total_assigned: number;
    total_collected: number;
}

interface DocumentFeeCategory {
    category: string;
    items: { name: string; price: number; students_availed: number; total_revenue: number }[];
    total_revenue: number;
}

interface DepartmentRow {
    department: string;
    students: number;
    billed: number;
    collected: number;
    balance: number;
    collection_rate: number;
}

interface CashierRow {
    cashier: string;
    transaction_count: number;
    total_amount: number;
    cash_total: number;
    gcash_total: number;
    bank_total: number;
}

interface Transaction {
    id: number;
    or_number: string;
    date: string;
    student: string;
    amount: number;
    method: string;
    payment_for: string;
    cashier: string;
}

interface MonthlyPoint {
    month: string;
    amount: number;
}

interface ReportsProps {
    summary: Summary;
    school_year: string;
    feeReport: FeeReportCategory[];
    documentFeeReport: DocumentFeeCategory[];
    departmentAnalysis: DepartmentRow[];
    cashierSummary: CashierRow[];
    recentTransactions: Transaction[];
    monthlyTrend: MonthlyPoint[];
}

/* ─────────────────────── Helpers ─────────────────────── */

const fmt = (n: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(n);

const pct = (val: number) => `${val.toFixed(1)}%`;

const methodColor: Record<string, string> = {
    cash:  'bg-green-100 text-green-700',
    gcash: 'bg-blue-100 text-blue-700',
    bank:  'bg-purple-100 text-purple-700',
};

function RateBar({ rate }: { rate: number }) {
    const color = rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(rate, 100)}%` }} />
            </div>
            <span className="text-xs font-medium tabular-nums">{pct(rate)}</span>
        </div>
    );
}

/* ─────────────────────── Main Page ─────────────────────── */

export default function OwnerReports({
    summary,
    school_year,
    feeReport = [],
    documentFeeReport = [],
    departmentAnalysis = [],
    cashierSummary = [],
    recentTransactions = [],
    monthlyTrend = [],
}: ReportsProps) {
    const [txSearch, setTxSearch] = useState('');

    const filteredTx = txSearch.trim()
        ? recentTransactions.filter(
              (t) =>
                  t.student.toLowerCase().includes(txSearch.toLowerCase()) ||
                  t.or_number.toLowerCase().includes(txSearch.toLowerCase()) ||
                  t.cashier.toLowerCase().includes(txSearch.toLowerCase()),
          )
        : recentTransactions;

    const maxMonthly = Math.max(...monthlyTrend.map((m) => m.amount), 1);
    const totalFeeRevenue   = feeReport.reduce((s, c) => s + (c.total_collected ?? 0), 0);
    const totalFeeIncome    = feeReport.reduce((s, c) => s + c.total_income, 0);
    const totalDocRevenue   = documentFeeReport.reduce((s, c) => s + c.total_revenue, 0);
    const grandCollected    = totalFeeRevenue + totalDocRevenue;

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />

            <div className="space-y-6 p-6">
                {/* ── PAGE HEADER ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reports &amp; Analytics</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            School Year <span className="font-medium">{school_year}</span> — comprehensive financial overview
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline"
                            onClick={() => (window.location.href = '/owner/reports/export/financial?format=csv')}>
                            <Download className="mr-2 h-4 w-4" /> Export Financial CSV
                        </Button>
                        <Button size="sm" variant="outline"
                            onClick={() => (window.location.href = '/owner/reports/export/students?format=csv')}>
                            <Download className="mr-2 h-4 w-4" /> Export Students CSV
                        </Button>
                    </div>
                </div>

                {/* ── INCOME QUICK-LINKS ── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <a href="/owner/income/today" className="block">
                        <Card className="hover:bg-accent/40 transition-colors cursor-pointer border-l-4 border-l-green-500">
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-green-100 p-3">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Today's Income</p>
                                    <p className="font-semibold text-sm">View real-time data →</p>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                    <a href="/owner/income/overall" className="block">
                        <Card className="hover:bg-accent/40 transition-colors cursor-pointer border-l-4 border-l-blue-500">
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Overall Income</p>
                                    <p className="font-semibold text-sm">All-time breakdown →</p>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                    <a href="/owner/income/expected" className="block">
                        <Card className="hover:bg-accent/40 transition-colors cursor-pointer border-l-4 border-l-orange-500">
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-full bg-orange-100 p-3">
                                    <TrendingUp className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Expected Income</p>
                                    <p className="font-semibold text-sm">Projections &amp; targets →</p>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                </div>

                {/* ── KPI SUMMARY CARDS ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_students.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Enrolled this school year</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{fmt(summary.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">All payment receipts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pct(summary.collection_rate)}</div>
                            <Progress value={summary.collection_rate} className="mt-2 h-1.5" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{fmt(summary.total_balance)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Pending student payments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── MAIN TABS ── */}
                <Tabs defaultValue="dashboard">
                    <TabsList className="flex flex-wrap h-auto gap-1 mb-2">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="department">Department Analysis</TabsTrigger>
                        <TabsTrigger value="fee-income">Fee Income</TabsTrigger>
                        <TabsTrigger value="cashier">Cashier Transactions</TabsTrigger>
                        <TabsTrigger value="exports">Exports</TabsTrigger>
                    </TabsList>

                    {/* ════ DASHBOARD ════ */}
                    <TabsContent value="dashboard" className="space-y-6 mt-4">
                        {/* Monthly Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    Monthly Collection Trend ({new Date().getFullYear()})
                                </CardTitle>
                                <CardDescription>Total payments received per month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {monthlyTrend.every((m) => m.amount === 0) ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No payment data available yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {monthlyTrend.map((m) => (
                                            <div key={m.month} className="flex items-center gap-3">
                                                <span className="w-8 text-xs font-medium text-muted-foreground shrink-0">{m.month}</span>
                                                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full flex items-center px-2 transition-all"
                                                        style={{ width: `${(m.amount / maxMonthly) * 100}%`, minWidth: m.amount > 0 ? '3rem' : '0' }}
                                                    >
                                                        {m.amount > 0 && (
                                                            <span className="text-xs text-white font-medium truncate">{fmt(m.amount)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {m.amount === 0 && <span className="text-xs text-muted-foreground">—</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Income breakdown cards */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Fee Collections</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="text-xl font-bold text-green-600">{fmt(totalFeeRevenue)}</div>
                                    <p className="text-xs text-muted-foreground">Collected from tuition / misc fees</p>
                                    <Separator className="my-2" />
                                    <p className="text-xs text-muted-foreground">
                                        Profit income: <span className="font-medium text-foreground">{fmt(totalFeeIncome)}</span>
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Document Fees</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="text-xl font-bold text-blue-600">{fmt(totalDocRevenue)}</div>
                                    <p className="text-xs text-muted-foreground">From approved document requests</p>
                                    <Separator className="my-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {documentFeeReport.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.students_availed, 0), 0)} requests fulfilled
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Grand Total Collected</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="text-xl font-bold">{fmt(grandCollected)}</div>
                                    <p className="text-xs text-muted-foreground">Fees + Document fees</p>
                                    <Separator className="my-2" />
                                    <p className="text-xs text-muted-foreground">
                                        Expected: <span className="font-medium text-foreground">{fmt(summary.total_expected)}</span>
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Department snapshot */}
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
