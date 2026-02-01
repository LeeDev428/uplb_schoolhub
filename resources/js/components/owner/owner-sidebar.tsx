import { Link } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Calendar,
    FileText,
    GraduationCap,
    LayoutGrid,
    TrendingUp,
    Building2,
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
        href: '/owner/dashboard',
        icon: LayoutGrid,
    },
    {
        title: "Today's Income",
        href: '/owner/income/today',
        icon: BadgeDollarSign,
    },
    {
        title: 'Overall Income',
        href: '/owner/income/overall',
        icon: TrendingUp,
    },
    {
        title: 'Expected Income',
        href: '/owner/income/expected',
        icon: TrendingUp,
    },
    {
        title: 'Departments',
        href: '/owner/departments',
        icon: Building2,
    },
    {
        title: 'Calendar View',
        href: '/owner/calendar',
        icon: Calendar,
    },
    {
        title: 'Export Reports',
        href: '/owner/reports',
        icon: FileText,
    },
];

export function OwnerSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/owner/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-white">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Owner Portal
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        School Management
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
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                    <div className="mb-1 flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                            OWNER ACCESS
                        </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">
                        Full system privileges
                    </p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
