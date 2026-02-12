import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import OwnerLayout from '@/layouts/owner/owner-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/owner/settings/profile' },
    { title: 'Appearance', href: '/owner/settings/appearance' },
];

export default function OwnerAppearance() {
    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix="owner" roleName="Owner">
                <AppearanceForm />
            </RoleSettingsLayout>
        </OwnerLayout>
    );
}
