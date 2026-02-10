import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, Users, ClipboardList } from 'lucide-react';
import ClinicLayout from '@/layouts/clinic/clinic-layout';

export default function ClinicDashboard() {
    return (
        <>
            <Head title="Clinic Dashboard" />
            <div className="space-y-6 p-6">
                <div>
                    <h2 className="text-2xl font-bold">Welcome to Clinic Portal!</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Manage student health records</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Health Records</CardTitle>
                            <ClipboardList className="h-5 w-5 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Manage student health records.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Schedule and manage appointments.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Medical Supplies</CardTitle>
                            <Heart className="h-5 w-5 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Track medical supplies inventory.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Students</CardTitle>
                            <Users className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">View student health profiles.</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No recent clinic visits.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ClinicDashboard.layout = (page: React.ReactNode) => <ClinicLayout>{page}</ClinicLayout>;
