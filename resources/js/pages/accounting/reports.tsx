import { Head } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';

export default function AccountingReports() {
    return (
        <AccountingLayout>
            <Head title="Reports" />
            
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Financial Reports"
                    description="Generate payment and collection reports"
                />
                
                <div className="rounded-lg border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        Reports and analytics - Coming soon
                    </p>
                </div>
            </div>
        </AccountingLayout>
    );
}
