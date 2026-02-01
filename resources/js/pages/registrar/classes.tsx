import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Classes',
        href: '/registrar/classes',
    },
];

export default function Classes() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Class Management
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage class schedules, sections, and assignments
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Class management system coming soon...
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
