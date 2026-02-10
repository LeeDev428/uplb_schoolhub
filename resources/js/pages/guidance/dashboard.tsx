import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import { ClipboardList, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface GuidanceRecordSummary {
    id: number;
    title: string;
    record_type: string;
    severity: string;
    status: string;
    created_at: string;
    student?: { first_name: string; last_name: string; lrn: string } | null;
    counselor?: { name: string } | null;
}

interface Props {
    stats: {
        totalRecords: number;
        openCases: number;
        inProgress: number;
        resolved: number;
    };
    recentRecords: GuidanceRecordSummary[];
}

const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
};

export default function GuidanceDashboard({ stats, recentRecords }: Props) {
    const statCards = [
        { label: 'Total Records', value: stats.totalRecords, icon: ClipboardList, color: 'text-blue-600' },
        { label: 'Open Cases', value: stats.openCases, icon: AlertTriangle, color: 'text-red-600' },
        { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-600' },
        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-600' },
    ];

    return (
        <GuidanceLayout>
            <Head title="Guidance Dashboard" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Guidance Counselor Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">Overview of student counseling records</p>
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
                        <CardTitle>Recent Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentRecords.length === 0 ? (
                            <p className="py-8 text-center text-gray-500">No records yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-3 text-left font-semibold">Title</th>
                                            <th className="p-3 text-left font-semibold">Student</th>
                                            <th className="p-3 text-center font-semibold">Type</th>
                                            <th className="p-3 text-center font-semibold">Severity</th>
                                            <th className="p-3 text-center font-semibold">Status</th>
                                            <th className="p-3 text-center font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentRecords.map((record) => (
                                            <tr key={record.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{record.title}</td>
                                                <td className="p-3 text-sm">
                                                    {record.student
                                                        ? `${record.student.last_name}, ${record.student.first_name}`
                                                        : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">
                                                        {record.record_type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${SEVERITY_COLORS[record.severity] || ''}`}>
                                                        {record.severity}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${STATUS_COLORS[record.status] || ''}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm text-gray-500">
                                                    {new Date(record.created_at).toLocaleDateString()}
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
        </GuidanceLayout>
    );
}
