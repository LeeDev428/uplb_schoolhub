import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import CanteenLayout from '@/layouts/canteen/canteen-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/canteen/settings/profile' },
    { title: 'Profile', href: '/canteen/settings/profile' },
];

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function CanteenProfile({ mustVerifyEmail, status }: Props) {
    return (
        <CanteenLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix="canteen" roleName="Canteen">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </CanteenLayout>
    );
}
