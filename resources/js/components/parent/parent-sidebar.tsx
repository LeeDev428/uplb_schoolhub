import { Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BookOpen,
    Calendar,
    FileText,
    LayoutGrid,
    Megaphone,
    Users,
} from 'lucide-react';
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

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    sidebar_color?: string;
    sidebar_font_size?: string;
}

export function ParentSidebar() {
    const { announcementCount, appSettings } = usePage<{ announcementCount: number; appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    const sidebarColor = appSettings?.sidebar_color || undefined;
    const sidebarFontSize = appSettings?.sidebar_font_size ? `${appSettings.sidebar_font_size}px` : undefined;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/parent/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Announcements',
            href: '/parent/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
        },
        {
            title: 'Subjects',
            href: '/parent/subjects',
            icon: BookOpen,
        },
        {
            title: 'Schedules',
            href: '/parent/schedules',
            icon: Calendar,
        },
        {
            title: 'Fees & Payments',
            href: '/parent/fees',
            icon: BadgeDollarSign,
        },
        {
            title: 'Requirements',
            href: '/parent/requirements',
            icon: FileText,
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
                            <Link href="/parent/dashboard" prefetch>
                                {logoUrl ? (
                                    <img src={logoUrl} alt={appName} className="h-8 w-8 rounded-lg object-contain bg-white" />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Users className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{appName}</span>
                                    <span className="truncate text-xs text-muted-foreground">Parent Portal</span>
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
            </SidebarFooter>
        </Sidebar>
    );
}
