import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/registrar/settings/profile' },
    { title: 'Password', href: '/registrar/settings/password' },
];

export default function RegistrarPassword() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix="registrar" roleName="Registrar">
                <PasswordForm />
            </RoleSettingsLayout>
        </RegistrarLayout>
    );
}
