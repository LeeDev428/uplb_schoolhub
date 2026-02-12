import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import OwnerLayout from '@/layouts/owner/owner-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/owner/settings/profile' },
    { title: 'Two-Factor Auth', href: '/owner/settings/two-factor' },
];

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function OwnerTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix="owner" roleName="Owner">
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </OwnerLayout>
    );
}
