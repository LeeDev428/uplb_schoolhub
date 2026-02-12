import { Head } from '@inertiajs/react';
import { AppearanceForm } from '@/components/settings';
import DynamicRoleLayout, { useRoleInfo } from '@/layouts/dynamic-role-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';

export default function RoleAppearance() {
    const { role, roleName } = useRoleInfo();

    return (
        <DynamicRoleLayout settingsPage="Appearance">
            <Head title="Appearance Settings" />
            <RoleSettingsLayout rolePrefix={role} roleName={roleName}>
                <AppearanceForm />
            </RoleSettingsLayout>
        </DynamicRoleLayout>
    );
}
