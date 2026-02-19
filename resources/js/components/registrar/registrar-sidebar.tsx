import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    BookOpen,
    BookText,
    Calendar,
    ClipboardCheck,
    FileText,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    Megaphone,
    Settings,
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
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Archived',
    //     href: '/registrar/archived',
    //     icon: Archive,
    // },
    // {
    //     title: 'Settings',
    //     href: '/registrar/settings',
    //     icon: Settings,
    // },
];

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
}

export function RegistrarSidebar() {
    const { announcementCount, appSettings } = usePage<{ announcementCount: number; appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/registrar/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Announcements',
            href: '/registrar/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
        },
        {
            title: 'Students',
            href: '/registrar/students',
            icon: Users,
        },
        {
            title: 'Subjects',
            href: '/registrar/subjects',
            icon: BookOpen,
        },
        {
            title: 'Requirements',
            href: '/registrar/requirements',
            icon: ListChecks,
        },
        {
            title: 'Create Documents',
            href: '/registrar/documents/create',
            icon: FileText,
        },
        // {
        //     title: 'Document Requests',
        //     href: '/registrar/documents/requests',
        //     icon: BookText,
        // },
        {
            title: 'Document Requests',
            href: '/registrar/document-approvals',
            icon: ClipboardCheck,
        },
        {
            title: 'Deadlines',
            href: '/registrar/deadlines',
            icon: Calendar,
        },
        {
            title: 'Classes',
            href: '/registrar/classes',
            icon: GraduationCap,
        },
        {
            title: 'Schedule',
            href: '/registrar/schedule',
            icon: Calendar,
        },
        {
            title: 'Reports',
            href: '/registrar/reports',
            icon: FileText,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/registrar/dashboard" prefetch>
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
                                        Registrar Portal
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
