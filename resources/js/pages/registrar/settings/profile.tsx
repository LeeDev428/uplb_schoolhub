import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/registrar/settings/profile' },
    { title: 'Profile', href: '/registrar/settings/profile' },
];

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function RegistrarProfile({ mustVerifyEmail, status }: Props) {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix="registrar" roleName="Registrar">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </RegistrarLayout>
    );
}
