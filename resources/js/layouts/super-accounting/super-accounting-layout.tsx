import type { PropsWithChildren } from 'react';
import { FlashMessages } from '@/components/flash-messages';
import { SuperAccountingSidebar } from '@/components/super-accounting/super-accounting-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function SuperAccountingLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <SuperAccountingSidebar />
            <SidebarInset>{children}</SidebarInset>
            <FlashMessages />
        </SidebarProvider>
    );
}
