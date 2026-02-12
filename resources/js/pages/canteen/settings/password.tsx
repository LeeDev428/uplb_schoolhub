import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import CanteenLayout from '@/layouts/canteen/canteen-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/canteen/settings/profile' },
    { title: 'Password', href: '/canteen/settings/password' },
];

export default function CanteenPassword() {
    return (
        <CanteenLayout breadcrumbs={breadcrumbs}>
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix="canteen" roleName="Canteen">
                <PasswordForm />
            </RoleSettingsLayout>
        </CanteenLayout>
    );
}
