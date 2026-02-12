import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { OwnerSidebar } from '@/components/owner/owner-sidebar';
import { FlashMessages } from '@/components/flash-messages';
import type { AppLayoutProps } from '@/types';

export default function OwnerLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <OwnerSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <FlashMessages />
        </AppShell>
    );
}
