import { Link, usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
}

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    const primaryColor = appSettings?.primary_color || '#2563eb';

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-9 w-9 items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt={appName} className="h-9 w-9 rounded object-contain bg-white" />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded" style={{ backgroundColor: primaryColor }}>
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
