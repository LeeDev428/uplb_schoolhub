import { Head } from '@inertiajs/react';
import { TwoFactorForm } from '@/components/settings';
import StudentLayout from '@/layouts/student/student-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/student/settings/profile' },
    { title: 'Two-Factor Auth', href: '/student/settings/two-factor' },
];

interface Props {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function StudentTwoFactor({ requiresConfirmation, twoFactorEnabled }: Props) {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <RoleSettingsLayout rolePrefix="student" roleName="Student">
                <TwoFactorForm
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                />
            </RoleSettingsLayout>
        </StudentLayout>
    );
}
