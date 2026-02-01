import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Documents',
        href: '/registrar/documents/create',
    },
];

export default function CreateDocuments() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Documents" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Create Documents
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Generate official student documents and certificates
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Document creation system coming soon...
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
