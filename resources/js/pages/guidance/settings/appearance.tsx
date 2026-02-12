import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/guidance/settings/profile' },
    { title: 'Appearance', href: '/guidance/settings/appearance' },
];

export default function GuidanceAppearance() {
    return (
        <GuidanceLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix="guidance" roleName="Guidance">
                <AppearanceForm />
            </RoleSettingsLayout>
        </GuidanceLayout>
    );
}
