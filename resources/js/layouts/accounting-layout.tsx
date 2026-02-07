import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AccountingSidebar } from '@/components/accounting/accounting-sidebar';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AccountingSidebar />
            <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
    );
}
