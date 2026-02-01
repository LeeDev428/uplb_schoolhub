import { Head } from '@inertiajs/react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deadlines',
        href: '/registrar/deadlines',
    },
];

export default function Deadlines() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Deadlines" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Academic Deadlines
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage important academic dates and deadlines
                    </p>
                </div>

                <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Deadline management system coming soon...
                    </p>
                </div>
            </div>
        </RegistrarLayout>
    );
}
