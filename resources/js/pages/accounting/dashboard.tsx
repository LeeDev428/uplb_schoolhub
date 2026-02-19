import { Head, router } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
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
import { Badge } from '@/components/ui/badge';
import { BadgeDollarSign, TrendingUp, Users, Wallet, CalendarDays } from 'lucide-react';

interface Stats {
    total_students: number;
    fully_paid: number;
    partial_paid: number;
    unpaid: number;
    total_collectibles: string;
    total_collected_today: string;
}

interface Payment {
    id: number;
    payment_date: string;
    or_number: string | null;
    amount: string;
    student: {
        first_name: string;
        last_name: string;
        lrn: string;
    };
    recorded_by: {
        name: string;
    } | null;
}

interface PendingPayment {
    id: number;
    balance: string;
    total_amount: string;
    student: {
        first_name: string;
        last_name: string;
        lrn: string;
        program: string;
        year_level: string;
    };
}

interface DailyIncome {
    day: number;
    date: string;
    day_label: string;
    total: number;
    count: number;
    avg_time: string | null;
}

interface Props {
    stats: Stats;
    recentPayments: Payment[];
    pendingPayments: PendingPayment[];
    dailyIncome: DailyIncome[];
    selectedMonth: number;
    selectedYear: number;
    months: { value: number; label: string }[];
    years: number[];
}

const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AccountingDashboard({
    stats,
    recentPayments,
    pendingPayments,
    dailyIncome = [],
    selectedMonth,
    selectedYear,
    months = [],
    years = [],
}: Props) {
    const handleFilterChange = (month: number, year: number) => {
        router.get('/accounting/dashboard', { month, year }, { preserveState: true, preserveScroll: true });
    };

    const monthTotal = dailyIncome.reduce((sum, d) => sum + d.total, 0);
    const activeDays = dailyIncome.filter(d => d.count > 0).length;

    return (
        <AccountingLayout>
            <Head title="Accounting Dashboard" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Accounting Dashboard"
                    description="Monitor student payments and fee collections"
                />

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <p className="text-xs text-muted-foreground">{stats.fully_paid} fully paid</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Collectibles</CardTitle>
                            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{parseFloat(stats.total_collectibles).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Outstanding balance</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Collected Today</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{parseFloat(stats.total_collected_today).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Today's collections</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.unpaid + stats.partial_paid}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.unpaid} unpaid, {stats.partial_paid} partial
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Income View */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Monthly Income
                                </CardTitle>
                                <CardDescription>
                                    Daily income breakdown — {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedMonth.toString()}
                                    onValueChange={(v) => handleFilterChange(parseInt(v), selectedYear)}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((m) => (
                                            <SelectItem key={m.value} value={m.value.toString()}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedYear.toString()}
                                    onValueChange={(v) => handleFilterChange(selectedMonth, parseInt(v))}
                                >
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Month Summary */}
                        <div className="flex gap-6 mt-2 text-sm">
                            <span className="text-muted-foreground">
                                Month Total: <span className="font-semibold text-green-600">{formatCurrency(monthTotal)}</span>
                            </span>
                            <span className="text-muted-foreground">
                                Active Days: <span className="font-semibold">{activeDays}</span>
                            </span>
                            <span className="text-muted-foreground">
                                Avg/Day: <span className="font-semibold">{activeDays > 0 ? formatCurrency(monthTotal / activeDays) : '₱0.00'}</span>
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Day</TableHead>
                                    <TableHead className="text-center">Transactions</TableHead>
                                    <TableHead>First Payment Time</TableHead>
                                    <TableHead className="text-right">Total Income</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dailyIncome.map((day) => (
                                    <TableRow
                                        key={day.day}
                                        className={day.count > 0 ? 'bg-green-50/50 hover:bg-green-50' : ''}
                                    >
                                        <TableCell className="font-medium">
                                            {new Date(day.date + 'T12:00:00').toLocaleDateString('en-PH', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{day.day_label}</TableCell>
                                        <TableCell className="text-center">
                                            {day.count > 0 ? (
                                                <Badge variant="secondary">{day.count}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {day.avg_time ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {day.count > 0 ? (
                                                <span className="text-green-600">{formatCurrency(day.total)}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Recent Payments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Payments</CardTitle>
                            <CardDescription>Latest payment transactions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentPayments.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-4">No payments recorded yet</p>
                                ) : (
                                    recentPayments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {payment.student.first_name} {payment.student.last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.or_number ? `OR# ${payment.or_number}` : 'No OR'} •{' '}
                                                    {new Date(payment.payment_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">₱{parseFloat(payment.amount).toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">{payment.recorded_by?.name || 'System'}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Payments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Pending Balances</CardTitle>
                            <CardDescription>Students with highest outstanding payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingPayments.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-4">All students are fully paid!</p>
                                ) : (
                                    pendingPayments.map((pending) => (
                                        <div key={pending.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {pending.student.first_name} {pending.student.last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {pending.student.program} • {pending.student.year_level}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-red-600">₱{parseFloat(pending.balance).toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">of ₱{parseFloat(pending.total_amount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AccountingLayout>
    );
}
