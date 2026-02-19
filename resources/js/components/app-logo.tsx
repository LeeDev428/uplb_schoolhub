import { usePage } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    primary_color?: string;
}

export default function AppLogo() {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;

    return (
        <>
            {logoUrl ? (
                <img src={logoUrl} alt={appName} className="size-8 rounded-md object-contain bg-white" />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <GraduationCap className="size-5" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
