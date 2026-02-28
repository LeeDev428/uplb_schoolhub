import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AccountingSidebar } from '@/components/accounting/accounting-sidebar';
import { FlashMessages } from '@/components/flash-messages';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AccountingSidebar />
            <SidebarInset>{children}</SidebarInset>
            <FlashMessages />
        </SidebarProvider>
    );
}
