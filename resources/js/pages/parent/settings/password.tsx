import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import ParentLayout from '@/layouts/parent/parent-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/parent/settings/profile' },
    { title: 'Password', href: '/parent/settings/password' },
];

export default function ParentPassword() {
    return (
        <ParentLayout breadcrumbs={breadcrumbs}>
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix="parent" roleName="Parent">
                <PasswordForm />
            </RoleSettingsLayout>
        </ParentLayout>
    );
}
