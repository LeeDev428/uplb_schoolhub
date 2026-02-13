import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    GraduationCap,
    LayoutGrid,
    FileCheck,
    User,
    Settings,
    FileQuestion,
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
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/student/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Requirements',
        href: '/student/requirements',
        icon: FileCheck,
    },
    {
        title: 'Subjects',
        href: '/student/subjects',
        icon: BookOpen,
    },
    {
        title: 'Quizzes',
        href: '/student/quizzes',
        icon: FileQuestion,
    },
    {
        title: 'Schedules',
        href: '/student/schedules',
        icon: Calendar,
    },
    {
        title: 'Profile',
        href: '/student/profile',
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/student/settings',
        icon: Settings,
    },
];

export function StudentSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/student/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-700 text-white">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        SchoolHub
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Student Portal
                                    </span>
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
                <NavUser />
                <NavFooter items={footerNavItems} />
            </SidebarFooter>
        </Sidebar>
    );
}
