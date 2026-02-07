import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar-layout';
import { PageHeader } from '@/components/page-header';

export default function RegistrarSchedule() {
    return (
        <RegistrarLayout>
            <Head title="Schedule" />
            
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Class Schedule"
                    description="Manage class schedules and timetables"
                />
                
                <div className="rounded-lg border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        Schedule management interface - Coming soon
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
