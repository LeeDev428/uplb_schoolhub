import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    GraduationCap,
    LayoutGrid,
    FileCheck,
    Megaphone,
    User,
    Settings,
    FileQuestion,
    FileSignature,
    FileText,
    CreditCard,
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

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/student/settings',
        icon: Settings,
    },
];

export function StudentSidebar() {
    const { announcementCount } = usePage<{ announcementCount: number }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/student/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Announcements',
            href: '/student/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
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
            title: 'Document Requests',
            href: '/student/document-requests',
            icon: FileText,
        },
        {
            title: 'Online Payments',
            href: '/student/online-payments',
            icon: CreditCard,
        },
        {
            title: 'Promissory Notes',
            href: '/student/promissory-notes',
            icon: FileSignature,
        },
        {
            title: 'Profile',
            href: '/student/profile',
            icon: User,
        },
    ];

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
