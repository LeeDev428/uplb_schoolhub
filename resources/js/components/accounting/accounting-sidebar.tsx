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
    LayoutGrid,
    Megaphone,
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

export function AccountingSidebar() {
    const { announcementCount } = usePage<{ announcementCount: number }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Account Dashboard',
            href: '/accounting/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Announcements',
            href: '/accounting/announcements',
            icon: Megaphone,
            badge: announcementCount || undefined,
        },
        {
            title: 'Student Accounts',
            href: '/accounting/student-accounts',
            icon: Users,
        },
        {
            title: 'Document Request',
            href: '/accounting/document-requests',
            icon: FileText,
        },
        {
            title: 'Payment Processing',
            href: '/accounting/payments',
            icon: CreditCard,
        },
        {
            title: 'Student Grants',
            href: '/accounting/grants',
            icon: Gift,
        },
        {
            title: 'Exam Approval',
            href: '/accounting/exam-approval',
            icon: FileCheck,
        },
        {
            title: 'Student Clearance',
            href: '/accounting/clearance',
            icon: ClipboardCheck,
        },
        {
            title: 'Reports',
            href: '/accounting/reports',
            icon: BookOpen,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Fee Management',
            href: '/accounting/fee-management',
            icon: Calculator,
        },
        {
            title: 'Online Transactions',
            href: '/accounting/online-transactions',
            icon: Globe,
        },
        {
            title: 'Settings',
            href: '/accounting/settings',
            icon: Settings,
        },
    ];

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
                <NavMain items={mainNavItems} label="Main Navigation" />
                <NavMain items={adminNavItems} label="Administration" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
