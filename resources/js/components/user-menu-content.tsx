import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import type { User } from '@/types';

type Props = {
    user: User;
};

// Get role-specific settings URL
function getSettingsUrl(role: string): string {
    const roleSettingsMap: Record<string, string> = {
        owner: '/owner/settings/profile',
        registrar: '/registrar/settings/profile',
        student: '/student/settings/profile',
        teacher: '/teacher/settings/profile',
        parent: '/parent/settings/profile',
        accounting: '/accounting/settings/profile',
        guidance: '/guidance/settings/profile',
        librarian: '/librarian/settings/profile',
        clinic: '/clinic/settings/profile',
        canteen: '/canteen/settings/profile',
    };
    return roleSettingsMap[role] || '/settings/profile';
}

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const settingsUrl = getSettingsUrl(user.role || '');

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowLogoutDialog(true);
    };

    const handleLogoutConfirm = () => {
        setIsLoggingOut(true);
        router.flushAll();
        cleanup();
        router.post(logout());
    };

    const handleDialogChange = (open: boolean) => {
        if (!isLoggingOut) {
            setShowLogoutDialog(open);
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={settingsUrl}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogoutClick}
                onSelect={(e) => e.preventDefault()}
                data-test="logout-button"
            >
                <LogOut className="mr-2" />
                Log out
            </DropdownMenuItem>

            <ConfirmDialog
                open={showLogoutDialog}
                onOpenChange={handleDialogChange}
                onConfirm={handleLogoutConfirm}
                title="Confirm Logout"
                description="Are you sure you want to log out of your account?"
                confirmLabel="Log out"
                cancelLabel="Cancel"
                variant="warning"
                loading={isLoggingOut}
            />
        </>
    );
}
