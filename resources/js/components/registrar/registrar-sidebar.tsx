import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    BookText,
    Calendar,
    ClipboardCheck,
    FileText,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    Megaphone,
    MessageCircle,
    Settings,
    UserCog,
    UserMinus,
    Users,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
    sidebar_color?: string;
    sidebar_font_size?: string;
}

export function RegistrarSidebar() {
    const { announcementCount, pendingDocumentCount, pendingDropRequestCount, appSettings } = usePage<{ announcementCount: number; pendingDocumentCount?: number; pendingDropRequestCount?: number; appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    const sidebarColor = appSettings?.sidebar_color || undefined;
    const sidebarFontSize = appSettings?.sidebar_font_size ? `${appSettings.sidebar_font_size}px` : undefined;

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
            title: 'Document Requests',
            href: '/registrar/document-approvals',
            badge: pendingDocumentCount || undefined,
            icon: ClipboardCheck,
        },
        {
            title: 'Reports',
            href: '/registrar/reports',
            icon: FileText,
        },
        {
            title: 'Student Status',
            href: '/registrar/student-status',
            icon: UserCog,
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
            title: 'Drop Requests',
            href: '/registrar/drop-requests',
            badge: pendingDropRequestCount || undefined,
            icon: UserMinus,
        },
        {
            title: 'Exam Approval',
            href: '/registrar/exam-approval',
            icon: ClipboardCheck,
        },
        {
            title: 'Subjects',
            href: '/registrar/subjects',
            icon: BookOpen,
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
            title: 'Deadlines',
            href: '/registrar/deadlines',
            icon: Calendar,
        },
        {
            title: 'Chat',
            href: '/registrar/chat',
            icon: MessageCircle,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" style={{
            ...(sidebarColor ? { '--sidebar': sidebarColor } as React.CSSProperties : {}),
            ...(sidebarFontSize ? { fontSize: sidebarFontSize } : {}),
        }}>
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
