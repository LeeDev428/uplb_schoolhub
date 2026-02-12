import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import DynamicRoleLayout, { useRoleInfo } from '@/layouts/dynamic-role-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';

export default function RolePassword() {
    const { role, roleName } = useRoleInfo();

    return (
        <DynamicRoleLayout settingsPage="Password">
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix={role} roleName={roleName}>
                <PasswordForm />
            </RoleSettingsLayout>
        </DynamicRoleLayout>
    );
}
