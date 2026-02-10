import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Users, ClipboardList } from 'lucide-react';

export default function ClinicDashboard() {
    return (
        <>
            <Head title="Clinic Dashboard" />
            <div className="min-h-screen bg-gray-50">
                <header className="border-b bg-white shadow-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <h1 className="text-2xl font-bold text-red-700">Clinic Portal</h1>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-6 p-6">
                    <div>
                        <h2 className="text-xl font-semibold">Welcome to Clinic Portal!</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage student health records</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Health Records</CardTitle>
                                <ClipboardList className="h-5 w-5 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Manage student health records.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Appointments</CardTitle>
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Schedule and manage appointments.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Medical Supplies</CardTitle>
                                <Heart className="h-5 w-5 text-pink-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">Track medical supplies inventory.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
                                <Users className="h-5 w-5 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">View student health profiles.</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Visits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">No recent clinic visits.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
