import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    FileText,
    Heart,
    LayoutGrid,
    Megaphone,
    Package,
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

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
}

export function ClinicSidebar() {
    const { announcementCount, appSettings } = usePage<{ announcementCount: number; appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/clinic/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Announcements',
            href: '/clinic/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
        },
        {
            title: 'Health Records',
            href: '/clinic/records',
            icon: FileText,
        },
        {
            title: 'Appointments',
            href: '/clinic/appointments',
            icon: Calendar,
        },
        {
            title: 'Students',
            href: '/clinic/students',
            icon: Users,
        },
        {
            title: 'Medical Supplies',
            href: '/clinic/supplies',
            icon: Package,
        },
        {
            title: 'Checkups',
            href: '/clinic/checkups',
            icon: Activity,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/clinic/dashboard" prefetch>
                                {logoUrl ? (
                                    <img src={logoUrl} alt={appName} className="h-8 w-8 rounded-lg object-contain bg-white" />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Heart className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{appName}</span>
                                    <span className="truncate text-xs text-muted-foreground">Clinic Portal</span>
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
