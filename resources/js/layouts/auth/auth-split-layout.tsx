import { Link, usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    const primaryColor = appSettings?.primary_color || '#2563eb';

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    {logoUrl ? (
                        <img src={logoUrl} alt={appName} className="mr-2 h-8 w-8 rounded object-contain bg-white" />
                    ) : (
                        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded" style={{ backgroundColor: primaryColor }}>
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                    )}
                    {appName}
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt={appName} className="h-10 w-10 rounded object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded" style={{ backgroundColor: primaryColor }}>
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                        )}
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
