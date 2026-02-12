import { Head } from '@inertiajs/react';
import { ProfileForm } from '@/components/settings';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import RoleSettingsLayout from '@/layouts/settings/role-settings-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/teacher/settings/profile' },
    { title: 'Profile', href: '/teacher/settings/profile' },
];

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

export default function TeacherProfile({ mustVerifyEmail, status }: Props) {
    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            <RoleSettingsLayout rolePrefix="teacher" roleName="Teacher">
                <ProfileForm mustVerifyEmail={mustVerifyEmail} status={status} />
            </RoleSettingsLayout>
        </TeacherLayout>
    );
}
