import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/registrar/reports',
    },
];

export default function Reports() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Reports & Analytics
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Generate and view enrollment reports and analytics
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Reports and analytics system coming soon...
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
