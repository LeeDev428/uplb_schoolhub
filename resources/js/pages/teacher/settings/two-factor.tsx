import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/teacher/settings/profile' },
    { title: 'Two-Factor Auth', href: '/teacher/settings/two-factor' },
];

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function TeacherTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix="teacher" roleName="Teacher">
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </TeacherLayout>
    );
}
