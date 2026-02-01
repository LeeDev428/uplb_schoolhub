import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Document Requests',
        href: '/registrar/documents/requests',
    },
];

export default function DocumentRequests() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Document Requests" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Document Requests
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Process and manage student document requests
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Document requests management coming soon...
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
