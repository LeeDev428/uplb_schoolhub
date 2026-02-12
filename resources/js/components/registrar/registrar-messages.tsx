import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';
import { 
    showSuccess as flashSuccess, 
    showError as flashError, 
    showWarning as flashWarning, 
    showInfo as flashInfo,
    showLoading,
    dismissToast
} from '@/components/flash-messages';

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

// Export re-exported helper functions from flash-messages
export const showSuccess = flashSuccess;
export const showError = flashError;
export const showWarning = flashWarning;
export const showInfo = flashInfo;
export { showLoading, dismissToast };
