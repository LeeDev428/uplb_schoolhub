import { Head } from '@inertiajs/react';
import { TrendingUp, Calendar, Building2, Users } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IncomeCard } from '@/components/owner/income-card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Income', href: '/owner/income/expected' },
    { title: 'Expected Income', href: '/owner/income/expected' },
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

interface MonthEntry {
    month: string;
    amount: number;
}

interface DeptEntry {
    department: string;
    count: number;
    balance: number;
}

interface ExpectedIncomeProps {
    income: IncomeData;
    totalBilled: number;
    totalCollected: number;
    totalBalance: number;
    totalDocExpected: number;
    avgMonthlyIncome: number;
    monthsToFullPay: number | null;
    last3Months: MonthEntry[];
    byDepartment: DeptEntry[];
    studentCount: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(value);

export default function ExpectedIncome({
    income,
    totalBilled,
    totalCollected,
    totalBalance,
    totalDocExpected,
    avgMonthlyIncome,
    monthsToFullPay,
    last3Months,
    byDepartment,
    studentCount,
}: ExpectedIncomeProps) {
    const collectionProgress = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
    const remainingProgress = totalBilled > 0 ? (totalBalance / totalBilled) * 100 : 0;

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Expected Income" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Expected Income</h1>
                    <p className="text-muted-foreground text-sm">Projected collection based on outstanding balances</p>
                </div>

                {/* Main card + summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <IncomeCard {...income} />
                    </div>

                    <div className="grid gap-4 md:col-span-2 grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Billed</CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(totalBilled)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Collected So Far</CardDescription>
                                <CardTitle className="text-2xl text-green-600">{formatCurrency(totalCollected)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Outstanding Balance</CardDescription>
                                <CardTitle className="text-2xl text-red-500">{formatCurrency(totalBalance)}</CardTitle>
                                <p className="text-xs text-muted-foreground">{studentCount} student{studentCount !== 1 ? 's' : ''} with balance</p>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Pending Doc Fees</CardDescription>
                                <CardTitle className="text-2xl text-amber-500">{formatCurrency(totalDocExpected)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Collection Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Collection Progress
                        </CardTitle>
                        <CardDescription>Visualized against total billed amount</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600 font-medium">Collected</span>
                                <span className="font-semibold">{collectionProgress.toFixed(1)}%</span>
                            </div>
                            <Progress value={Math.min(collectionProgress, 100)} className="h-3" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-red-500 font-medium">Remaining Balance</span>
                                <span className="font-semibold">{remainingProgress.toFixed(1)}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                <div
                                    className="h-full rounded-full bg-red-400 transition-all"
                                    style={{ width: `${Math.min(remainingProgress, 100)}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Projection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Projection
                        </CardTitle>
                        <CardDescription>Based on average monthly collection trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Avg. Monthly Income</p>
                                <p className="text-2xl font-bold">{formatCurrency(avgMonthlyIncome)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Based on last 3 months</p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">Est. Months to Full Collection</p>
                                <p className="text-2xl font-bold">
                                    {monthsToFullPay !== null ? monthsToFullPay : '—'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {monthsToFullPay !== null ? `~${monthsToFullPay} month${monthsToFullPay !== 1 ? 's' : ''} at current pace` : 'No data available'}
                                </p>
                            </div>
                        </div>

                        {/* Last 3 months trend */}
                        {last3Months.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium">Monthly Trend</p>
                                <div className="flex gap-2">
                                    {last3Months.map((entry) => (
                                        <div key={entry.month} className="flex-1 rounded-lg bg-muted p-3 text-center">
                                            <p className="text-xs text-muted-foreground">{entry.month}</p>
                                            <p className="text-sm font-semibold">{formatCurrency(entry.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Separator />

                {/* Balance by Department */}
                {byDepartment.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Outstanding Balance by Department
                            </CardTitle>
                            <CardDescription>Departments with the highest outstanding balances</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Department</TableHead>
                                        <TableHead className="text-center">
                                            <span className="flex items-center justify-center gap-1">
                                                <Users className="h-3 w-3" /> Students
                                            </span>
                                        </TableHead>
                                        <TableHead className="text-right">Outstanding</TableHead>
                                        <TableHead className="text-right">%</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {byDepartment.map((dept, idx) => {
                                        const pct = totalBalance > 0 ? (dept.balance / totalBalance) * 100 : 0;
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{dept.department}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{dept.count}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-red-500">
                                                    {formatCurrency(dept.balance)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground text-sm">
                                                    {pct.toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </OwnerLayout>
    );
}
