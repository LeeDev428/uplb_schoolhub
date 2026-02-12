import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/registrar/settings/profile' },
    { title: 'Appearance', href: '/registrar/settings/appearance' },
];

export default function RegistrarAppearance() {
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix="registrar" roleName="Registrar">
                <AppearanceForm />
            </RoleSettingsLayout>
        </RegistrarLayout>
    );
}
