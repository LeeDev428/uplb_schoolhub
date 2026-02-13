import { Link } from '@inertiajs/react';
import {
    BadgeDollarSign,
    ClipboardCheck,
    FileText,
    LayoutGrid,
    Receipt,
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/accounting/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Student Clearance',
        href: '/accounting/clearance',
        icon: ClipboardCheck,
    },
    {
        title: 'Student Fees',
        href: '/accounting/fees',
        icon: BadgeDollarSign,
    },
    {
        title: 'Payments',
        href: '/accounting/payments',
        icon: Receipt,
    },
    {
        title: 'Reports',
        href: '/accounting/reports',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/accounting/settings',
        icon: Settings,
    },
];

export function AccountingSidebar() {
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/accounting/dashboard">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <BadgeDollarSign className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">SchoolHub</span>
                                    <span className="truncate text-xs">Accounting Portal</span>
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
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
