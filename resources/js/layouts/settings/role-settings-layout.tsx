import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn} from '@/lib/utils';
import type { NavItem } from '@/types';

interface RoleSettingsLayoutProps extends PropsWithChildren {
    rolePrefix: string;
    roleName: string;
}

export default function RoleSettingsLayout({ children, rolePrefix, roleName }: RoleSettingsLayoutProps) {
    const { isCurrentUrl } = useCurrentUrl();

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: `/${rolePrefix}/settings/profile`,
            icon: null,
        },
        {
            title: 'Password',
            href: `/${rolePrefix}/settings/password`,
            icon: null,
        },
        {
            title: 'Two-Factor Auth',
            href: `/${rolePrefix}/settings/two-factor`,
            icon: null,
        },
        {
            title: 'Appearance',
            href: `/${rolePrefix}/settings/appearance`,
            icon: null,
        },
    ];

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description={`Manage your ${roleName} profile and account settings`}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentUrl(item.href as string),
                                })}
                            >
                                <Link href={item.href as string}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 lg:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
