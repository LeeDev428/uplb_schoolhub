import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import AccountingLayout from '@/layouts/accounting-layout';

export default function AccountingSettings() {
    return (
        <AccountingLayout>
            <Head title="Settings" />
            
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Settings"
                    description="Configure accounting preferences"
                />
                
                <div className="rounded-lg border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        Settings interface - Coming soon
                    </p>
                </div>
            </div>
        </AccountingLayout>
    );
}
