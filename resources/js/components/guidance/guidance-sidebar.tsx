import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    GraduationCap,
    LayoutGrid,
    Shield,
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/guidance/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Records',
        href: '/guidance/records',
        icon: ClipboardList,
    },
];

export function GuidanceSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/guidance/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Guidance Portal</span>
                                    <span className="truncate text-xs text-muted-foreground">Counselor Dashboard</span>
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
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-900 dark:bg-teal-950">
                    <div className="mb-1 flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                        <span className="text-xs font-medium text-teal-700 dark:text-teal-300">GUIDANCE ACCESS</span>
                    </div>
                    <p className="text-xs text-teal-600 dark:text-teal-400">Student counseling records</p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
