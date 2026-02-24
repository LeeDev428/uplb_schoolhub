import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    FileBarChart,
    LayoutDashboard,
    Megaphone,
    RotateCcw,
    Settings,
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

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
}

export function SuperAccountingSidebar() {
    const { announcementCount, appSettings } = usePage<{ announcementCount: number; appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/super-accounting/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Announcements',
            href: '/super-accounting/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
        },
        {
            title: 'Refund Requests',
            href: '/super-accounting/refunds',
            icon: RotateCcw,
        },
        {
            title: 'Reports',
            href: '/super-accounting/reports',
            icon: FileBarChart,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/super-accounting/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/super-accounting/dashboard" prefetch>
                                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={appName} className="size-full object-cover" />
                                    ) : (
                                        <LayoutDashboard className="size-4" />
                                    )}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{appName}</span>
                                    <span className="truncate text-xs text-muted-foreground">Super Accounting</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} label="Main" />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
