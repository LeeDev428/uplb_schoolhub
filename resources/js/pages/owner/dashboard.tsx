import { Head } from '@inertiajs/react';
import { IncomeCard } from '@/components/owner/income-card';
import { RevenueChart } from '@/components/owner/revenue-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Financial Dashboard',
        href: '/owner/dashboard',
    },
];

interface DashboardProps {
    todayIncome: number;
    todayTarget: number;
    todayAchievement: number;
    overallIncome: number;
    overallTarget: number;
    overallAchievement: number;
    expectedIncome: number;
    expectedTarget: number;
    expectedAchievement: number;
    departmentStats: Array<{
        id: number;
        name: string;
        code: string;
        enrollments: number;
        revenue: number;
        expected: number;
        collection_rate: number;
    }>;
    revenueTrend: Array<{
        date: string;
        label: string;
        amount: number;
    }>;
    totalStudents: number;
    totalPayments: number;
    schoolYear: string;
}

export default function OwnerDashboard({
    todayIncome,
    todayTarget,
    todayAchievement,
    overallIncome,
    overallTarget,
    overallAchievement,
    expectedIncome,
    expectedTarget,
    expectedAchievement,
    departmentStats,
    revenueTrend,
    totalStudents,
    totalPayments,
    schoolYear,
}: DashboardProps) {
    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Financial Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Real-time financial overview and analytics
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Select defaultValue="month">
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="quarter">
                                    This Quarter
                                </SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button>Apply</Button>
                    </div>
                </div>

                {/* Income Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <IncomeCard
                        title="Today's Income"
                        amount={todayIncome}
                        target={todayTarget}
                        achievement={todayAchievement}
                        period="Live"
                        variant="today"
                    />
                    <IncomeCard
                        title="Overall Income"
                        amount={overallIncome}
                        target={overallTarget}
                        achievement={overallAchievement}
                        period={schoolYear}
                        variant="overall"
                    />
                    <IncomeCard
                        title="Expected Income"
                        amount={expectedIncome}
                        target={expectedTarget}
                        achievement={expectedAchievement}
                        period="Remaining Balance"
                        variant="expected"
                        projected={expectedAchievement}
                    />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="today">
                            Today's Income
                        </TabsTrigger>
                        <TabsTrigger value="overall">
                            Overall Income
                        </TabsTrigger>
                        <TabsTrigger value="expected">
                            Expected Income
                        </TabsTrigger>
                        <TabsTrigger value="departments">
                            Department Analysis
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="today">
                        <Card>
                            <CardHeader>
                                <CardTitle>Today's Income Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Detailed breakdown of today's income...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="overall">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overall Income Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Comprehensive income analysis...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="expected">
                        <Card>
                            <CardHeader>
                                <CardTitle>Expected Income Projections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Income projections and forecasts...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="departments">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Department Revenue Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </OwnerLayout>
    );
}
