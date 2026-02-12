import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import AccountingLayout from '@/layouts/accounting-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/accounting/settings/profile' },
    { title: 'Appearance', href: '/accounting/settings/appearance' },
];

export default function AccountingAppearance() {
    return (
        <AccountingLayout>
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix="accounting" roleName="Accounting">
                <AppearanceForm />
            </RoleSettingsLayout>
        </AccountingLayout>
    );
}
