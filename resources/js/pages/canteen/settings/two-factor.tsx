import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import CanteenLayout from '@/layouts/canteen/canteen-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/canteen/settings/profile' },
    { title: 'Two-Factor Auth', href: '/canteen/settings/two-factor' },
];

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function CanteenTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    return (
        <CanteenLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix="canteen" roleName="Canteen">
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </CanteenLayout>
    );
}
