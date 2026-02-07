import { Head } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';

export default function AccountingFees() {
    return (
        <AccountingLayout>
            <Head title="Student Fees" />
            
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Student Fees"
                    description="Manage student fee records and assessment"
                />
                
                <div className="rounded-lg border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        Student fees management interface - Coming soon
                    </p>
                </div>
            </div>
        </AccountingLayout>
    );
}
