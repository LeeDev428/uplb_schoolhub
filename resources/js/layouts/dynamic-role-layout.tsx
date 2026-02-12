import { usePage } from '@inertiajs/react';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import CanteenLayout from '@/layouts/canteen/canteen-layout';
import ClinicLayout from '@/layouts/clinic/clinic-layout';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import LibrarianLayout from '@/layouts/librarian/librarian-layout';
import OwnerLayout from '@/layouts/owner/owner-layout';
import ParentLayout from '@/layouts/parent/parent-layout';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import StudentLayout from '@/layouts/student/student-layout';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import type { AppLayoutProps, SharedData } from '@/types';

type LayoutComponent = ComponentType<AppLayoutProps> | ComponentType<{ children: ReactNode }>;

const layoutMap: Record<string, LayoutComponent> = {
    owner: OwnerLayout,
    registrar: RegistrarLayout,
    accounting: AccountingLayout,
    student: StudentLayout,
    teacher: TeacherLayout,
    parent: ParentLayout,
    guidance: GuidanceLayout,
    librarian: LibrarianLayout,
    clinic: ClinicLayout,
    canteen: CanteenLayout,
};

const roleDisplayNames: Record<string, string> = {
    owner: 'Owner',
    registrar: 'Registrar',
    accounting: 'Accounting',
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
    guidance: 'Guidance',
    librarian: 'Librarian',
    clinic: 'Clinic',
    canteen: 'Canteen',
};

interface DynamicRoleLayoutProps extends PropsWithChildren {
    settingsPage: string;
}

export default function DynamicRoleLayout({ children, settingsPage }: DynamicRoleLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role || 'owner';
    
    const Layout = layoutMap[role] || OwnerLayout;
    const roleName = roleDisplayNames[role] || 'User';
    
    const breadcrumbs = [
        { title: 'Settings', href: `/${role}/settings/profile` },
        { title: settingsPage, href: `/${role}/settings/${settingsPage.toLowerCase().replace(' ', '-')}` },
    ];

    // Accounting layout doesn't accept breadcrumbs prop
    if (role === 'accounting') {
        return (
            <Layout>
                {children}
            </Layout>
        );
    }

    return (
        <Layout breadcrumbs={breadcrumbs}>
            {children}
        </Layout>
    );
}

export function useRoleInfo() {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role || 'owner';
    return {
        role,
        roleName: roleDisplayNames[role] || 'User',
    };
}
