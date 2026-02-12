import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import AccountingLayout from '@/layouts/accounting-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/accounting/settings/profile' },
    { title: 'Password', href: '/accounting/settings/password' },
];

export default function AccountingPassword() {
    return (
        <AccountingLayout>
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix="accounting" roleName="Accounting">
                <PasswordForm />
            </RoleSettingsLayout>
        </AccountingLayout>
    );
}
