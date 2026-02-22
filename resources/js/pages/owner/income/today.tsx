import { Head } from '@inertiajs/react';
import {
    Clock,
    CreditCard,
    Banknote,
    Smartphone,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IncomeCard } from '@/components/owner/income-card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Income', href: '/owner/income/today' },
    { title: "Today's Income", href: '/owner/income/today' },
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

interface HourlyEntry {
    hour: number;
    label: string;
    amount: number;
    count: number;
}

interface RecentTransaction {
    id: number;
    student_name: string;
    amount: number;
    method: string;
    or_number: string;
    time: string;
}

interface TodayIncomeProps {
    income: IncomeData;
    fees: number;
    documents: number;
    yesterday: number;
    byMethod: { cash: number; gcash: number; bank: number };
    hourlyData: HourlyEntry[];
    recent: RecentTransaction[];
    count: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0,
    }).format(value);

const methodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
        case 'GCASH': return <Smartphone className="h-3 w-3" />;
        case 'BANK': return <CreditCard className="h-3 w-3" />;
        default: return <Banknote className="h-3 w-3" />;
    }
};

const methodBadgeVariant = (method: string): 'default' | 'secondary' | 'outline' => {
    switch (method?.toUpperCase()) {
        case 'GCASH': return 'default';
        case 'BANK': return 'secondary';
        default: return 'outline';
    }
};

export default function TodayIncome({
    income,
    fees,
    documents,
    yesterday,
    byMethod,
    hourlyData,
    recent,
    count,
}: TodayIncomeProps) {
    const maxHourly = Math.max(...hourlyData.map((h) => h.amount), 1);
    const changeVsYesterday = yesterday > 0
        ? (((income.amount - yesterday) / yesterday) * 100).toFixed(1)
        : null;

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Today's Income" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Today's Income</h1>
                    <p className="text-muted-foreground text-sm">{income.period}</p>
                </div>

                {/* Main card + Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <IncomeCard {...income} />
                    </div>

                    <div className="grid gap-4 md:col-span-2 grid-cols-2">
                        {/* Tuition/Fees */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1">
                                    <Receipt className="h-3.5 w-3.5" /> Tuition Fees
                                </CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(fees)}</CardTitle>
                            </CardHeader>
                        </Card>

                        {/* Document fees */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1">
                                    <Receipt className="h-3.5 w-3.5" /> Document Fees
                                </CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(documents)}</CardTitle>
                            </CardHeader>
                        </Card>

                        {/* vs Yesterday */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>vs Yesterday</CardDescription>
                                <CardTitle className="text-2xl">{formatCurrency(yesterday)}</CardTitle>
                                {changeVsYesterday && (
                                    <p className={`text-xs font-medium ${parseFloat(changeVsYesterday) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {parseFloat(changeVsYesterday) >= 0 ? '+' : ''}{changeVsYesterday}%
                                    </p>
                                )}
                            </CardHeader>
                        </Card>

                        {/* Transaction Count */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" /> Transactions
                                </CardDescription>
                                <CardTitle className="text-2xl">{count}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Payment Method Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Breakdown by payment channel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Cash', amount: byMethod.cash, icon: <Banknote className="h-5 w-5 text-amber-500" /> },
                                { label: 'GCash', amount: byMethod.gcash, icon: <Smartphone className="h-5 w-5 text-blue-500" /> },
                                { label: 'Bank Transfer', amount: byMethod.bank, icon: <CreditCard className="h-5 w-5 text-green-500" /> },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-3 rounded-lg border p-4">
                                    {item.icon}
                                    <div>
                                        <p className="text-sm text-muted-foreground">{item.label}</p>
                                        <p className="text-lg font-semibold">{formatCurrency(item.amount)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Hourly Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Hourly Collection
                        </CardTitle>
                        <CardDescription>Collections per hour for today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
                            {hourlyData.map((entry) => (
                                <div key={entry.hour} className="flex flex-col items-center gap-1 min-w-[2.5rem]">
                                    <div className="relative flex flex-col justify-end w-6 h-24">
                                        {entry.amount > 0 && (
                                            <div
                                                className="w-full rounded-sm bg-blue-500 transition-all"
                                                style={{ height: `${(entry.amount / maxHourly) * 100}%` }}
                                                title={`${entry.label}: ${formatCurrency(entry.amount)}`}
                                            />
                                        )}
                                        {entry.amount === 0 && (
                                            <div className="w-full rounded-sm bg-muted" style={{ height: '4px' }} />
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground rotate-45 origin-left whitespace-nowrap">
                                        {entry.hour % 2 === 0 ? entry.label.split(':')[0] : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest {recent.length} payment{recent.length !== 1 ? 's' : ''} today</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recent.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-6 text-center">No transactions yet today.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>OR #</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium">{tx.student_name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{tx.or_number}</TableCell>
                                            <TableCell>
                                                <Badge variant={methodBadgeVariant(tx.method)} className="gap-1 text-xs">
                                                    {methodIcon(tx.method)}
                                                    {tx.method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{tx.time}</TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                {formatCurrency(tx.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </OwnerLayout>
    );
}
