import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

interface AppSettings {
    app_name: string;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    secondary_color: string;
}

interface PageProps {
    appSettings?: AppSettings;
}

/**
 * Convert HEX color to HSL values for CSS custom properties.
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
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

/**
 * Convert HEX color to OKLCH for CSS (approximate).
 */
function hexToOklch(hex: string): string | null {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;

    // Simplified conversion - for proper results we'd use color-convert library
    // This approximation works reasonably for most colors
    const l = hsl.l / 100;
    const c = (hsl.s / 100) * 0.4 * (1 - Math.abs(2 * l - 1));
    const h = hsl.h;

    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { appSettings } = usePage<PageProps>().props;

    useEffect(() => {
        if (!appSettings) return;

        // Update document title
        if (appSettings.app_name) {
            // The title is handled by Inertia's Head component, but we can set a default
            document.title = document.title.replace(/Laravel|SchoolHub/gi, appSettings.app_name);
        }

        // Update favicon if provided
        if (appSettings.favicon_url) {
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
                existingFavicon.setAttribute('href', appSettings.favicon_url);
            } else {
                const favicon = document.createElement('link');
                favicon.rel = 'icon';
                favicon.href = appSettings.favicon_url;
                document.head.appendChild(favicon);
            }
        }

        // Apply primary color as CSS custom property
        if (appSettings.primary_color) {
            const primaryOklch = hexToOklch(appSettings.primary_color);
            const primaryHsl = hexToHsl(appSettings.primary_color);
            
            if (primaryOklch && primaryHsl) {
                const root = document.documentElement;
                
                // Set primary color - light mode uses darker version for good contrast
                root.style.setProperty('--primary', primaryOklch);
                
                // Calculate foreground (white or black based on luminance)
                const foregroundL = primaryHsl.l > 50 ? 0.145 : 0.985;
                root.style.setProperty('--primary-foreground', `oklch(${foregroundL} 0 0)`);
                
                // Set sidebar primary to match
                root.style.setProperty('--sidebar-primary', primaryOklch);
                root.style.setProperty('--sidebar-primary-foreground', `oklch(${foregroundL} 0 0)`);
                
                // Set ring color to slightly transparent version
                const ringL = Math.min(primaryHsl.l / 100 + 0.2, 1);
                root.style.setProperty('--ring', `oklch(${ringL} ${(primaryHsl.s / 100 * 0.3).toFixed(3)} ${primaryHsl.h})`);
            }
        }

        // Apply secondary color
        if (appSettings.secondary_color) {
            const secondaryOklch = hexToOklch(appSettings.secondary_color);
            const secondaryHsl = hexToHsl(appSettings.secondary_color);
            
            if (secondaryOklch && secondaryHsl) {
                const root = document.documentElement;
                
                // Muted foreground uses secondary color
                const mutedL = secondaryHsl.l / 100;
                root.style.setProperty('--muted-foreground', `oklch(${mutedL} 0.01 ${secondaryHsl.h})`);
            }
        }
    }, [appSettings]);

    return <>{children}</>;
}

export default ThemeProvider;
