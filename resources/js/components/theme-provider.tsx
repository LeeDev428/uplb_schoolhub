import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export interface AppSettings {
    app_name?: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string;
    secondary_color?: string;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    hex = hex.replace(/^#/, '');

    let r: number, g: number, b: number;
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255;
        g = parseInt(hex[1] + hex[1], 16) / 255;
        b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16) / 255;
        g = parseInt(hex.slice(2, 4), 16) / 255;
        b = parseInt(hex.slice(4, 6), 16) / 255;
    } else {
        return null;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hexToOklch(hex: string): string | null {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;
    const l = hsl.l / 100;
    const c = (hsl.s / 100) * 0.4 * (1 - Math.abs(2 * l - 1));
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hsl.h.toFixed(1)})`;
}

/**
 * Applies branding/theme from AppSettings to CSS custom properties and document meta.
 * Safe to call both inside and outside Inertia context.
 */
export function applyTheme(appSettings: AppSettings | undefined) {
    if (!appSettings) return;

    if (appSettings.favicon_url) {
        let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = appSettings.favicon_url;
    }

    if (appSettings.primary_color) {
        const oklch = hexToOklch(appSettings.primary_color);
        const hsl = hexToHsl(appSettings.primary_color);
        if (oklch && hsl) {
            const root = document.documentElement;
            root.style.setProperty('--primary', oklch);
            const fgL = hsl.l > 50 ? 0.145 : 0.985;
            root.style.setProperty('--primary-foreground', `oklch(${fgL} 0 0)`);
            root.style.setProperty('--sidebar-primary', oklch);
            root.style.setProperty('--sidebar-primary-foreground', `oklch(${fgL} 0 0)`);
            const ringL = Math.min(hsl.l / 100 + 0.2, 1);
            root.style.setProperty('--ring', `oklch(${ringL} ${(hsl.s / 100 * 0.3).toFixed(3)} ${hsl.h})`);
        }
    }

    if (appSettings.secondary_color) {
        const hsl = hexToHsl(appSettings.secondary_color);
        if (hsl) {
            document.documentElement.style.setProperty(
                '--muted-foreground',
                `oklch(${(hsl.l / 100).toFixed(3)} 0.01 ${hsl.h})`
            );
        }
    }
}

/**
 * ThemeProvider — place OUTSIDE <App> in app.tsx.
 * Receives appSettings extracted from initial Inertia page props.
 */
export function ThemeProvider({
    children,
    appSettings,
}: {
    children: React.ReactNode;
    appSettings?: AppSettings;
}) {
    useEffect(() => {
        applyTheme(appSettings);
    }, [appSettings]);

    return <>{children}</>;
}

/**
 * ThemeSync — place INSIDE a layout (inside <App>).
 * Uses usePage() to stay in sync with shared appSettings on every navigation.
 */
export function ThemeSync() {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;
    useEffect(() => {
        applyTheme(appSettings);
    }, [appSettings]);
    return null;
}

export default ThemeProvider;