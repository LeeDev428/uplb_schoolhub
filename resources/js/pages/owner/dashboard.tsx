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

export default function OwnerDashboard() {
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
                        amount={421250}
                        target={500000}
                        achievement={84.3}
                        period="Live"
                        variant="today"
                    />
                    <IncomeCard
                        title="Overall Income"
                        amount={22023500}
                        target={22500000}
                        achievement={97.9}
                        period="Jan 1 - Mar 31, 2024"
                        variant="overall"
                    />
                    <IncomeCard
                        title="Expected Income"
                        amount={24600000}
                        target={90000000 / 12}
                        achievement={102.5}
                        period="Apr 1 - Jun 30, 2024"
                        variant="expected"
                        projected={102.5}
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
