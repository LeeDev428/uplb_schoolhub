import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import { ClipboardList, AlertTriangle, Clock, CheckCircle, ChevronRight, Users } from 'lucide-react';

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
    counselorName: string;
    stats: {
        totalRecords: number;
        openCases: number;
        inProgress: number;
        resolved: number;
    };
    severityBreakdown: Record<string, number>;
    typeBreakdown: Record<string, number>;
    recentRecords: GuidanceRecordSummary[];
}

const SEVERITY_COLORS: Record<string, string> = {
    low:      'bg-green-100 text-green-700 border-green-200',
    medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    high:     'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_COLORS: Record<string, string> = {
    open:          'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    resolved:      'bg-green-100 text-green-700',
    closed:        'bg-gray-100 text-gray-700',
};

const QUICK_LINKS = [
    { href: '/guidance/records',  label: 'All Records', desc: 'View and manage all counseling records', icon: ClipboardList, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { href: '/guidance/students', label: 'Students',    desc: 'Browse student profiles and records',    icon: Users,         color: 'text-purple-600', bg: 'bg-purple-50' },
];

export default function GuidanceDashboard({ counselorName, stats, severityBreakdown, typeBreakdown, recentRecords }: Props) {
    return (
        <GuidanceLayout>
            <Head title="Guidance Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {counselorName}!</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Guidance counseling overview and student records</p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                            <ClipboardList className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.totalRecords}</div>
                            <p className="text-xs text-muted-foreground mt-1">All counseling records</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.openCases}</div>
                            <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.inProgress}</div>
                            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.resolved}</div>
                            <p className="text-xs text-muted-foreground mt-1">Successfully closed</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Access</CardTitle>
                                <CardDescription>Navigate to your portal sections</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {QUICK_LINKS.map(link => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm hover:border-primary/30 group"
                                        >
                                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${link.bg}`}>
                                                <link.icon className={`h-5 w-5 ${link.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm group-hover:text-primary">{link.label}</p>
                                                <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Records */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Records</CardTitle>
                                    <Link href="/guidance/records" className="text-xs text-primary hover:underline">View all</Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentRecords.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground text-sm">No records yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-muted-foreground">
                                                    <th className="pb-3 text-left font-medium">Student</th>
                                                    <th className="pb-3 text-left font-medium">Title</th>
                                                    <th className="pb-3 text-center font-medium">Severity</th>
                                                    <th className="pb-3 text-center font-medium">Status</th>
                                                    <th className="pb-3 text-center font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentRecords.map((record) => (
                                                    <tr key={record.id} className="border-b hover:bg-muted/40 transition-colors">
                                                        <td className="py-3 pr-3">
                                                            {record.student
                                                                ? <span className="font-medium">{record.student.last_name}, {record.student.first_name}</span>
                                                                : <span className="text-muted-foreground">—</span>}
                                                        </td>
                                                        <td className="py-3 pr-3 max-w-[160px] truncate">{record.title}</td>
                                                        <td className="py-3 text-center">
                                                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize font-medium ${SEVERITY_COLORS[record.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                {record.severity}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize font-medium ${STATUS_COLORS[record.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-center text-muted-foreground">
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

                    {/* Right Column — Breakdowns */}
                    <div className="space-y-6">
                        {/* Severity Breakdown */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    By Severity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(severityBreakdown).length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-2">No data yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                                            const count = severityBreakdown[sev] ?? 0;
                                            if (!count) return null;
                                            return (
                                                <div key={sev} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize font-medium ${SEVERITY_COLORS[sev]}`}>
                                                        {sev}
                                                    </span>
                                                    <span className="font-bold">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Type Breakdown */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-blue-500" />
                                    By Type
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(typeBreakdown).length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-2">No data yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {Object.entries(typeBreakdown).map(([type, count]) => (
                                            <div key={type} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                                <span className="bg-gray-100 text-gray-700 inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize">
                                                    {type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="font-bold">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GuidanceLayout>
    );
}
