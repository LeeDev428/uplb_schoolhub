import { Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Calendar,
    FileText,
    GraduationCap,
    LayoutGrid,
    TrendingUp,
    Building2,
    BookOpen,
    Users,
    Grid3x3,
    Megaphone,
    Settings,
    UserSquare2,
    Scale,
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

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
    has_k12?: boolean;
    has_college?: boolean;
}

export function OwnerSidebar() {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    const hasK12 = appSettings?.has_k12 !== false;
    const hasCollege = appSettings?.has_college !== false;

    // Build academic structure sub-items based on enabled academic modes
    const academicStructureItems: NavItem[] = [
        { title: 'Departments', href: '/owner/departments' },
        ...(hasCollege ? [{ title: 'Programs', href: '/owner/programs' }] : []),
        { title: 'Year Levels', href: '/owner/year-levels' },
        { title: 'Sections', href: '/owner/sections' },
    ];

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
            title: 'Academic Structure',
            icon: Building2,
            items: academicStructureItems,
        },
        {
            title: 'Subjects',
            href: '/owner/subjects',
            icon: BookOpen,
        },
        {
            title: 'Schedules',
            href: '/owner/schedules',
            icon: Calendar,
        },
        {
            title: 'Calendar View',
            href: '/owner/calendar',
            icon: Calendar,
        },
        {
            title: 'User Management',
            href: '/owner/users',
            icon: Users,
        },
        {
            title: 'Students',
            href: '/owner/students',
            icon: UserSquare2,
        },
        {
            title: 'Announcements',
            href: '/owner/announcements',
            icon: Megaphone,
        },
        {
            title: 'Export Reports',
            href: '/owner/reports',
            icon: FileText,
        },
        {
            title: 'Audit Logs',
            href: '/owner/audit-logs',
            icon: Scale,
        },
        {
            title: 'App Settings',
            href: '/owner/app-settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/owner/dashboard" prefetch>
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
                                        Owner Portal
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
