import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export function RegistrarMessages() {
    const { flash } = usePage<{ flash?: FlashMessages }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            expand={false}
            duration={4000}
        />
    );
}

// Helper functions for manual toast messages
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showWarning = (message: string) => toast.warning(message);
export const showInfo = (message: string) => toast.info(message);
export const showLoading = (message: string) => toast.loading(message);
export const dismissToast = (toastId: string | number) => toast.dismiss(toastId);
