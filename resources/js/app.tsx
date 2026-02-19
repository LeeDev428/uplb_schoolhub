import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { ThemeProvider, applyTheme } from './components/theme-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        // Extract appSettings from the initial shared props
        const sharedProps = props.initialPage?.props as Record<string, unknown> | undefined;
        const initialSettings = sharedProps?.appSettings as {
            app_name?: string; logo_url?: string | null; favicon_url?: string | null;
            primary_color?: string; secondary_color?: string;
        } | undefined;

        // Re-apply theme on every Inertia navigation (no usePage() needed)
        router.on('success', (event) => {
            const settings = (event.detail.page.props as Record<string, unknown>)?.appSettings as typeof initialSettings;
            applyTheme(settings);
        });

        root.render(
            <StrictMode>
                <ThemeProvider appSettings={initialSettings}>
                    <App {...props} />
                </ThemeProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
