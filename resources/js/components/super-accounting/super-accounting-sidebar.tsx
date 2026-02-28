import { Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    BookOpen,
    Calculator,
    ClipboardCheck,
    CreditCard,
    FileCheck,
    FileText,
    Gift,
    Globe,
    LayoutDashboard,
    LayoutGrid,
    Megaphone,
    Receipt,
    RotateCcw,
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
            title: 'Account Dashboard',
            href: '/super-accounting/account-dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Main Dashboard',
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
            title: 'Student Accounts',
            href: '/super-accounting/student-accounts',
            icon: Users,
        },
        {
            title: 'Document Request',
            href: '/super-accounting/document-approvals',
            icon: FileCheck,
        },
        {
            title: 'Payment Processing',
            href: '/super-accounting/payments',
            icon: CreditCard,
        },
        {
            title: 'Student Grants',
            href: '/super-accounting/grants',
            icon: Gift,
        },
        {
            title: 'Exam Approval',
            href: '/super-accounting/exam-approval',
            icon: FileCheck,
        },
        {
            title: 'Student Clearance',
            href: '/super-accounting/clearance',
            icon: ClipboardCheck,
        },
        {
            title: 'Refunds',
            href: '/super-accounting/refunds',
            icon: RotateCcw,
        },
        {
            title: 'Reports',
            href: '/super-accounting/reports',
            icon: BookOpen,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Fee Management',
            href: '/super-accounting/fee-management',
            icon: Calculator,
        },
        {
            title: 'Online Transactions',
            href: '/super-accounting/online-transactions',
            icon: Globe,
        },
        {
            title: 'Settings',
            href: '/super-accounting/settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/super-accounting/dashboard">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={appName} className="size-8 rounded-lg object-contain bg-white" />
                                ) : (
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <BadgeDollarSign className="size-4" />
                                    </div>
                                )}
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{appName}</span>
                                    <span className="truncate text-xs">Super Accounting Portal</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} label="Main Navigation" />
                <NavMain items={adminNavItems} label="Administration" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
