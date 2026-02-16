import { Head } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { ImportButton } from '@/components/import-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDollarSign, TrendingUp, Users, Wallet } from 'lucide-react';

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

interface Props {
    stats: Stats;
    recentPayments: Payment[];
    pendingPayments: PendingPayment[];
}

export default function AccountingDashboard({ stats, recentPayments, pendingPayments }: Props) {
    return (
        <AccountingLayout>
            <Head title="Accounting Dashboard" />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Accounting Dashboard"
                        description="Monitor student payments and fee collections"
                    />
                    <ImportButton
                        importUrl="/accounting/dashboard/import"
                        templateUrl="/accounting/dashboard/template"
                        title="Import Payment Data"
                        description="Upload an Excel or CSV file to import payment records."
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.fully_paid} fully paid
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Collectibles</CardTitle>
                            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{parseFloat(stats.total_collectibles).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Outstanding balance
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Collected Today</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱{parseFloat(stats.total_collected_today).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Today's collections
                            </p>
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
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        No payments recorded yet
                                    </p>
                                ) : (
                                    recentPayments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {payment.student.first_name} {payment.student.last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.or_number ? `OR# ${payment.or_number}` : 'No OR'} • {new Date(payment.payment_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">₱{parseFloat(payment.amount).toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.recorded_by?.name || 'System'}
                                                </p>
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
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        All students are fully paid!
                                    </p>
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
                                                <p className="text-xs text-muted-foreground">
                                                    of ₱{parseFloat(pending.total_amount).toLocaleString()}
                                                </p>
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
