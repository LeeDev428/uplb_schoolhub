import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { DashboardCard } from '@/components/registrar/dashboard-card';
import { RecentActivity } from '@/components/registrar/recent-activity';
import { RequirementsStatus } from '@/components/registrar/requirements-status-chart';
import { Users, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface Stats {
    activeStudents: number;
    officiallyEnrolled: number;
    registrarPending: number;
    accountingPending: number;
    notEnrolled: number;
    graduated: number;
}

interface Cards {
    totalStudents: {
        count: number;
        complete: number;
        pending: number;
    };
    pendingRequirements: number;
    completeSubmissions: number;
    documentRequests: number;
}

interface Activity {
    student: string;
    activity: string;
    time: string;
    registrar: string;
    status: string;
}

interface RequirementsStatusData {
    complete: number;
    pending: number;
    overdue: number;
}

interface Props {
    stats: Stats;
    cards: Cards;
    recentActivity: Activity[];
    requirementsStatus: RequirementsStatusData;
}

export default function Dashboard({ stats, cards, recentActivity, requirementsStatus }: Props) {
    return (
        <RegistrarLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{stats.activeStudents}</div>
                                <div className="text-sm text-gray-600">Active Students</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{stats.officiallyEnrolled}</div>
                                <div className="text-sm text-gray-600">Officially Enrolled</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.registrarPending}</div>
                                <div className="text-sm text-gray-600">Registrar Pending</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.accountingPending}</div>
                                <div className="text-sm text-gray-600">Accounting Pending</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-600">{stats.notEnrolled}</div>
                                <div className="text-sm text-gray-600">Not Enrolled</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{stats.graduated}</div>
                                <div className="text-sm text-gray-600">Graduated</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-slate-700 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Total Students</h3>
                                <Users className="h-8 w-8" />
                            </div>
                            <div className="text-4xl font-bold mb-2">{cards.totalStudents.count}</div>
                            <p className="text-sm opacity-90">{cards.totalStudents.complete} complete, {cards.totalStudents.pending} pending</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Pending Requirements</h3>
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <div className="text-4xl font-bold mb-2">{cards.pendingRequirements}</div>
                            <p className="text-sm opacity-90">Require attention</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Complete Submissions</h3>
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div className="text-4xl font-bold mb-2">{cards.completeSubmissions}</div>
                            <p className="text-sm opacity-90">Ready for enrollment</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Document Requests</h3>
                                <FileText className="h-8 w-8" />
                            </div>
                            <div className="text-4xl font-bold mb-2">{cards.documentRequests}</div>
                            <p className="text-sm opacity-90">Awaiting processing</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity and Requirements Status */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <RecentActivity activities={recentActivity} />
                    </div>
                    <div>
                        <RequirementsStatus status={requirementsStatus} />
                    </div>
                </div>
            </div>
        </RegistrarLayout>
    );
}
