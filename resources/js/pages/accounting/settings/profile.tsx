import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import AccountingLayout from '@/layouts/accounting-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/accounting/settings/profile' },
    { title: 'Profile', href: '/accounting/settings/profile' },
];

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function AccountingProfile({ mustVerifyEmail, status }: Props) {
    return (
        <AccountingLayout>
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix="accounting" roleName="Accounting">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </AccountingLayout>
    );
}
