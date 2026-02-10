import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, CreditCard, FileText } from 'lucide-react';
import ParentLayout from '@/layouts/parent/parent-layout';

export default function ParentDashboard() {
    return (
        <>
            <Head title="Parent Dashboard" />
            <div className="space-y-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold">Welcome, Parent!</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        View your child&apos;s academic information
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Grades</CardTitle>
                            <BookOpen className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View your child&apos;s grades and academic performance.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Track your child&apos;s attendance records.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fees</CardTitle>
                            <CreditCard className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                View fee balances and payment history.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Requirements</CardTitle>
                            <FileText className="h-5 w-5 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Check requirement submission status.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No announcements at this time.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ParentDashboard.layout = (page: React.ReactNode) => <ParentLayout>{page}</ParentLayout>;
