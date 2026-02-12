import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import OwnerLayout from '@/layouts/owner/owner-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/owner/settings/profile' },
    { title: 'Password', href: '/owner/settings/password' },
];

export default function OwnerPassword() {
    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix="owner" roleName="Owner">
                <PasswordForm />
            </RoleSettingsLayout>
        </OwnerLayout>
    );
}
