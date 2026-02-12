import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import ParentLayout from '@/layouts/parent/parent-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/parent/settings/profile' },
    { title: 'Profile', href: '/parent/settings/profile' },
];

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function ParentProfile({ mustVerifyEmail, status }: Props) {
    return (
        <ParentLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix="parent" roleName="Parent">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </ParentLayout>
    );
}
