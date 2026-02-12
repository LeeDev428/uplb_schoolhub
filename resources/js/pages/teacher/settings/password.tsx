import { Head } from '@inertiajs/react';
import { PasswordForm } from '@/components/settings';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/teacher/settings/profile' },
    { title: 'Password', href: '/teacher/settings/password' },
];

export default function TeacherPassword() {
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Password Settings" />
            <RoleSettingsLayout rolePrefix="teacher" roleName="Teacher">
                <PasswordForm />
            </RoleSettingsLayout>
        </TeacherLayout>
    );
}
