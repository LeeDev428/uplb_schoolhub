import { Head } from '@inertiajs/react';
import { BarChart3, Users, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { IncomeCard } from '@/components/owner/income-card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Income', href: '/owner/income/overall' },
    { title: 'Overall Income', href: '/owner/income/overall' },
];

interface IncomeData {
    title: string;
    amount: number;
    target: number;
    achievement: number;
    period: string;
    variant: 'today' | 'overall' | 'expected';
    projected?: number;
}

interface MonthlyEntry {
    month: string;
    amount: number;
}

interface TopStudent {
    student_name: string;
    total: number;
}

interface OverallIncomeProps {
    income: IncomeData;
    totalCollected: number;
    totalDocFees: number;
    totalBilled: number;
    totalBalance: number;
    monthlyData: MonthlyEntry[];
    topStudents: TopStudent[];
    fullyPaidCount: number;
    partialCount: number;
    unpaidCount: number;
    year: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(value);

export default function OverallIncome({
    income,
    totalCollected,
    totalDocFees,
    totalBilled,
    totalBalance,
    monthlyData,
    topStudents,
    fullyPaidCount,
    partialCount,
    unpaidCount,
    year,
}: OverallIncomeProps) {
    const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);
    const totalStudents = fullyPaidCount + partialCount + unpaidCount;
    const collectionRate = totalBilled > 0 ? ((totalCollected + totalDocFees) / totalBilled) * 100 : 0;

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Overall Income" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Overall Income</h1>
                    <p className="text-muted-foreground text-sm">All-time collection summary</p>
                </div>

                {/* Main card + quick stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <IncomeCard {...income} />
                    </div>

                    <div className="grid gap-4 md:col-span-2 grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Tuition Collected</CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(totalCollected)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Document Fees</CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(totalDocFees)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Billed</CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(totalBilled)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Outstanding Balance</CardDescription>
                                <CardTitle className="text-2xl text-red-500">{formatCurrency(totalBalance)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Payment Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Payment Status Breakdown
                        </CardTitle>
                        <CardDescription>Student fee payment status across all accounts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 rounded-lg border p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Fully Paid</p>
                                    <p className="text-xl font-bold text-green-600">{fullyPaidCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Partial</p>
                                    <p className="text-xl font-bold text-amber-600">{partialCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Unpaid</p>
                                    <p className="text-xl font-bold text-red-600">{unpaidCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Collection Rate</span>
                                <span>{collectionRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={Math.min(collectionRate, 100)} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" /> Monthly Collections ({year})
                        </CardTitle>
                        <CardDescription>Tuition payments received per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 h-40">
                            {monthlyData.map((entry) => (
                                <div key={entry.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                    <div className="relative w-full flex flex-col justify-end h-32">
                                        {entry.amount > 0 ? (
                                            <div
                                                className="w-full rounded-sm bg-green-500 transition-all"
                                                style={{ height: `${(entry.amount / maxMonthly) * 100}%` }}
                                                title={`${entry.month}: ${formatCurrency(entry.amount)}`}
                                            />
                                        ) : (
                                            <div className="w-full rounded-sm bg-muted" style={{ height: '4px' }} />
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                                        {entry.month}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Top Payers */}
                {topStudents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Paying Students</CardTitle>
                            <CardDescription>Students with highest total payments</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Total Paid</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topStudents.map((s, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="text-muted-foreground text-sm w-10">{idx + 1}</TableCell>
                                            <TableCell className="font-medium">{s.student_name}</TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                {formatCurrency(s.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </OwnerLayout>
    );
}
