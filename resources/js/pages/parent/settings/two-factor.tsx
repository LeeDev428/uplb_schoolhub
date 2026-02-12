import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import ParentLayout from '@/layouts/parent/parent-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/parent/settings/profile' },
    { title: 'Two-Factor Auth', href: '/parent/settings/two-factor' },
];

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function ParentTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    return (
        <ParentLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix="parent" roleName="Parent">
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </ParentLayout>
    );
}
