import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import DynamicRoleLayout, { useRoleInfo } from '@/layouts/dynamic-role-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function RoleProfile({ mustVerifyEmail, status }: Props) {
    const { role, roleName } = useRoleInfo();

    return (
        <DynamicRoleLayout settingsPage="Profile">
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix={role} roleName={roleName}>
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </DynamicRoleLayout>
    );
}
