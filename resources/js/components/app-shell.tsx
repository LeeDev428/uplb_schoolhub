import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { SharedData } from '@/types';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const props = usePage<SharedData & { appSettings?: { sidebar_color?: string; sidebar_font_size?: string } }>().props;
    const isOpen = props.sidebarOpen;
    const sidebarColor = (props.appSettings as any)?.sidebar_color;
    const sidebarFontSize = (props.appSettings as any)?.sidebar_font_size;

    useEffect(() => {
        if (sidebarColor) {
            document.documentElement.style.setProperty('--sidebar', sidebarColor);
        }
        if (sidebarFontSize) {
            document.documentElement.style.setProperty('--sidebar-font-size', sidebarFontSize + 'px');
        }
    }, [sidebarColor, sidebarFontSize]);

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
