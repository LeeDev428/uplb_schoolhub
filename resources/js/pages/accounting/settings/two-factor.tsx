import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import AccountingLayout from '@/layouts/accounting-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/accounting/settings/profile' },
    { title: 'Two-Factor Auth', href: '/accounting/settings/two-factor' },
];

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function AccountingTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    return (
        <AccountingLayout>
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix="accounting" roleName="Accounting">
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </AccountingLayout>
    );
}
