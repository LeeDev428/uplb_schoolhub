import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, CreditCard, FileText } from 'lucide-react';

export default function ParentDashboard() {
    return (
        <>
            <Head title="Parent Dashboard" />
            <div className="min-h-screen bg-gray-50">
                <header className="border-b bg-white shadow-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <h1 className="text-2xl font-bold text-purple-700">Parent Portal</h1>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-6 p-6">
                    <div>
                        <h2 className="text-xl font-semibold">Welcome, Parent!</h2>
                        <p className="mt-1 text-sm text-gray-600">View your child&apos;s academic information</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Grades</CardTitle>
                                <BookOpen className="h-5 w-5 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">View your child&apos;s grades and academic performance.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Track your child&apos;s attendance records.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Fees</CardTitle>
                                <CreditCard className="h-5 w-5 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">View fee balances and payment history.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Requirements</CardTitle>
                                <FileText className="h-5 w-5 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Check requirement submission status.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">No announcements at this time.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
