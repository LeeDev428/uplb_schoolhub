import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import CanteenLayout from '@/layouts/canteen/canteen-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/canteen/settings/profile' },
    { title: 'Appearance', href: '/canteen/settings/appearance' },
];

export default function CanteenAppearance() {
    return (
        <CanteenLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix="canteen" roleName="Canteen">
                <AppearanceForm />
            </RoleSettingsLayout>
        </CanteenLayout>
    );
}
