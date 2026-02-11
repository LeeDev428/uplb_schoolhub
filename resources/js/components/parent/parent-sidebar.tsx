import { Link } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BookOpen,
    Calendar,
    FileText,
    LayoutGrid,
    TrendingUp,
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
        href: '/parent/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Children',
        href: '/parent/children',
        icon: Users,
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
        title: 'Grades',
        href: '/parent/grades',
        icon: TrendingUp,
    },
    {
        title: 'Attendance',
        href: '/parent/attendance',
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

export function ParentSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/parent/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Parent Portal</span>
                                    <span className="truncate text-xs text-muted-foreground">School Management</span>
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
