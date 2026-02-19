import { Link, usePage } from '@inertiajs/react';
import {
    ChefHat,
    DollarSign,
    LayoutGrid,
    Megaphone,
    Package,
    ShoppingCart,
    UtensilsCrossed,
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

export function CanteenSidebar() {
    const { announcementCount, appSettings } = usePage<{ announcementCount: number; appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/canteen/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Announcements',
            href: '/canteen/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
        },
        {
            title: 'Menu',
            href: '/canteen/menu',
            icon: UtensilsCrossed,
        },
        {
            title: 'Orders',
            href: '/canteen/orders',
            icon: ShoppingCart,
        },
        {
            title: 'Sales',
            href: '/canteen/sales',
            icon: DollarSign,
        },
        {
            title: 'Inventory',
            href: '/canteen/inventory',
            icon: Package,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/canteen/dashboard" prefetch>
                                {logoUrl ? (
                                    <img src={logoUrl} alt={appName} className="h-8 w-8 rounded-lg object-contain bg-white" />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <ChefHat className="h-5 w-5" />
                                    </div>
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{appName}</span>
                                    <span className="truncate text-xs text-muted-foreground">Canteen Portal</span>
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
