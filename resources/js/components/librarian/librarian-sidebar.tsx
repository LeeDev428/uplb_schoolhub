import { Link } from '@inertiajs/react';
import {
    BookOpen,
    GraduationCap,
    LayoutGrid,
    Library,
    ArrowLeftRight,
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
        href: '/librarian/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Books',
        href: '/librarian/books',
        icon: BookOpen,
    },
    {
        title: 'Transactions',
        href: '/librarian/transactions',
        icon: ArrowLeftRight,
    },
];

export function LibrarianSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/librarian/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                                    <Library className="h-5 w-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Librarian Portal</span>
                                    <span className="truncate text-xs text-muted-foreground">Library Management</span>
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
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                    <div className="mb-1 flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">LIBRARIAN ACCESS</span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Book & transaction management</p>
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
