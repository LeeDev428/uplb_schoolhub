import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Requirements',
        href: '/registrar/requirements',
    },
];

export default function Requirements() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Requirements" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Requirements Management
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage student requirements and document submissions
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Requirements management system coming soon...
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
