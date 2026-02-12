import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import DynamicRoleLayout, { useRoleInfo } from '@/layouts/dynamic-role-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function RoleTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    const { role, roleName } = useRoleInfo();

    return (
        <DynamicRoleLayout settingsPage="Two-Factor Auth">
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix={role} roleName={roleName}>
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </DynamicRoleLayout>
    );
}
