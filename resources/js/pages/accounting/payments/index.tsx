import { Head } from '@inertiajs/react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';

export default function AccountingPayments() {
    return (
        <AccountingLayout>
            <Head title="Payments" />
            
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Payment Records"
                    description="Record and manage student payments"
                />
                
                <div className="rounded-lg border bg-card p-8 text-center">
                    <p className="text-muted-foreground">
                        Payment recording interface - Coming soon
                    </p>
                </div>
            </div>
        </AccountingLayout>
    );
}
