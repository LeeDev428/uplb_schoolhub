import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { ClinicSidebar } from '@/components/clinic/clinic-sidebar';
import type { AppLayoutProps } from '@/types';

export default function ClinicLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <ClinicSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
