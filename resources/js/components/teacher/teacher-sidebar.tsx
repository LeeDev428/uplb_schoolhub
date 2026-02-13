import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    ClipboardList,
    GraduationCap,
    LayoutGrid,
    Users,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/teacher/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Classes',
        href: '/teacher/classes',
        icon: Users,
    },
    {
        title: 'Students',
        href: '/teacher/students',
        icon: GraduationCap,
    },
    {
        title: 'Subjects',
        href: '/teacher/subjects',
        icon: BookOpen,
    },
    {
        title: 'Schedules',
        href: '/teacher/schedules',
        icon: Calendar,
    },
    {
        title: 'Grades',
        href: '/teacher/grades',
        icon: ClipboardList,
    },
    {
        title: 'Attendance',
        href: '/teacher/attendance',
        icon: Calendar,
    },
];

export function TeacherSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/teacher/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 text-white">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Teacher Portal</span>
                                    <span className="truncate text-xs text-muted-foreground">School Management</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
                    <div className="mb-1 flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-400" />
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">TEACHER ACCESS</span>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Classes & grades management</p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
