import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import ParentLayout from '@/layouts/parent/parent-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/parent/settings/profile' },
    { title: 'Appearance', href: '/parent/settings/appearance' },
];

export default function ParentAppearance() {
    return (
        <ParentLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix="parent" roleName="Parent">
                <AppearanceForm />
            </RoleSettingsLayout>
        </ParentLayout>
    );
}
