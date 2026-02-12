import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import OwnerLayout from '@/layouts/owner/owner-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/owner/settings/profile' },
    { title: 'Profile', href: '/owner/settings/profile' },
];

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function OwnerProfile({ mustVerifyEmail, status }: Props) {
    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix="owner" roleName="Owner">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </OwnerLayout>
    );
}
