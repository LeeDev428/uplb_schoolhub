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
    Lock,
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

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
}

export function StudentSidebar() {
    const { announcementCount, auth, appSettings } = usePage<{ 
        announcementCount: number;
        auth: { user: { student?: { enrollment_status?: string } } };
        appSettings?: AppSettings;
    }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    
    const isEnrolled = auth.user.student?.enrollment_status === 'enrolled';

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
            locked: !isEnrolled,
        },
        {
            title: 'Quizzes',
            href: '/student/quizzes',
            icon: FileQuestion,
            locked: !isEnrolled,
        },
        {
            title: 'Schedules',
            href: '/student/schedules',
            icon: Calendar,
            locked: !isEnrolled,
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
                                {logoUrl ? (
                                    <img src={logoUrl} alt={appName} className="h-8 w-8 rounded-lg object-contain bg-white" />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{appName}</span>
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
