import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LibrarianLayout from '@/layouts/librarian/librarian-layout';
import { BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Transaction {
    id: number;
    transaction_type: string;
    borrow_date: string;
    due_date: string;
    status: string;
    book?: { title: string; author: string } | null;
    student?: { first_name: string; last_name: string; lrn: string } | null;
}

interface Props {
    stats: {
        totalBooks: number;
        availableBooks: number;
        activeBorrows: number;
        overdueBooks: number;
    };
    recentTransactions: Transaction[];
}

const STATUS_COLORS: Record<string, string> = {
    borrowed: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    lost: 'bg-gray-100 text-gray-700',
};

export default function LibrarianDashboard({ stats, recentTransactions }: Props) {
    const statCards = [
        { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'text-blue-600' },
        { label: 'Available', value: stats.availableBooks, icon: CheckCircle, color: 'text-green-600' },
        { label: 'Active Borrows', value: stats.activeBorrows, icon: Clock, color: 'text-yellow-600' },
        { label: 'Overdue', value: stats.overdueBooks, icon: AlertTriangle, color: 'text-red-600' },
    ];

    return (
        <LibrarianLayout>
            <Head title="Librarian Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Library Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Overview of library books and transactions</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {statCards.map((stat) => (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length === 0 ? (
                            <p className="py-8 text-center text-gray-500">No transactions yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left font-semibold">Book</th>
                                            <th className="p-3 text-left font-semibold">Student</th>
                                            <th className="p-3 text-center font-semibold">Type</th>
                                            <th className="p-3 text-center font-semibold">Borrow Date</th>
                                            <th className="p-3 text-center font-semibold">Due Date</th>
                                            <th className="p-3 text-center font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((tx) => (
                                            <tr key={tx.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{tx.book?.title || '-'}</td>
                                                <td className="p-3 text-sm">
                                                    {tx.student
                                                        ? `${tx.student.last_name}, ${tx.student.first_name}`
                                                        : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">
                                                        {tx.transaction_type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm">
                                                    {new Date(tx.borrow_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-3 text-center text-sm">
                                                    {new Date(tx.due_date).toLocaleDateString()}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${STATUS_COLORS[tx.status] || ''}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </LibrarianLayout>
    );
}
