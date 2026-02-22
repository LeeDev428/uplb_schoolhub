import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ParentLayout from '@/layouts/parent/parent-layout';
import {
    CreditCard, CheckCircle, AlertCircle, Clock, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    amount: number;
    payment_method: string | null;
    payment_mode: string | null;
    reference_number: string | null;
    created_at: string;
}

interface PromissoryNote {
    id: number;
    amount: number;
    status: string;
    reason: string | null;
    created_at: string;
}

interface ChildFees {
    id: number;
    full_name: string;
    student_id: string | number;
    enrollment_status: string;
    department: string | null;
    year_level: string | null;
    section: string | null;
    payment: {
        total_fees: number;
        total_discount: number;
        total_paid: number;
        balance: number;
        effective_balance: number;
        is_fully_paid: boolean;
        has_promissory: boolean;
        due_date: string | null;
    };
    payments: Payment[];
    online_payments: Payment[];
    promissory_notes: PromissoryNote[];
}

interface Props {
    children: ChildFees[];
}

const PROMI_STATUS: Record<string, string> = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

function formatPeso(n: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n);
}

function ChildFeesCard({ child }: { child: ChildFees }) {
    const [showPayments, setShowPayments] = useState(false);
    const p = child.payment;
    const paidPct = p.total_fees > 0 ? Math.min(100, Math.round((p.total_paid / p.total_fees) * 100)) : 0;
    const allPayments = [...child.payments, ...child.online_payments].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg">{child.full_name}</CardTitle>
                        <CardDescription>
                            {child.year_level && `${child.year_level} · `}
                            {child.section && `Section: ${child.section} · `}
                            ID: {child.student_id}
                        </CardDescription>
                    </div>
                    {p.is_fully_paid ? (
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Fully Paid
                        </Badge>
                    ) : (
                        <Badge className="bg-amber-100 text-amber-800 flex-shrink-0">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Balance Due
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Fee Summary */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Total Fees',   value: p.total_fees,    color: 'text-foreground' },
                        { label: 'Total Paid',   value: p.total_paid,    color: 'text-green-600' },
                        { label: 'Discount',     value: p.total_discount,color: 'text-blue-600' },
                        { label: 'Balance',      value: p.effective_balance, color: p.effective_balance > 0 ? 'text-red-600' : 'text-green-600' },
                    ].map(item => (
                        <div key={item.label} className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className={`text-lg font-bold ${item.color}`}>{formatPeso(item.value)}</p>
                        </div>
                    ))}
                </div>

                {/* Payment Progress */}
                <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Payment Progress</span>
                        <span>{paidPct}%</span>
                    </div>
                    <Progress value={paidPct} className="h-2.5" />
                </div>

                {/* Promissory Notes */}
                {child.promissory_notes.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Promissory Notes
                        </p>
                        <div className="space-y-1.5">
                            {child.promissory_notes.map(pn => (
                                <div key={pn.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-medium">{formatPeso(pn.amount)}</p>
                                        {pn.reason && <p className="text-xs text-muted-foreground truncate">{pn.reason}</p>}
                                    </div>
                                    <span className={`ml-3 rounded-full px-2 py-0.5 text-xs font-medium capitalize flex-shrink-0 ${PROMI_STATUS[pn.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {pn.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Due Date Alert */}
                {p.due_date && !p.is_fully_paid && (
                    <Alert className="py-2">
                        <Clock className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            Payment due: <strong>{new Date(p.due_date).toLocaleDateString()}</strong>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Payment History Toggle */}
                {allPayments.length > 0 && (
                    <div>
                        <button
                            onClick={() => setShowPayments(v => !v)}
                            className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                Payment History ({allPayments.length})
                            </span>
                            {showPayments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {showPayments && (
                            <div className="mt-2 space-y-1.5">
                                {allPayments.map((pay, idx) => (
                                    <div key={`${pay.id}-${idx}`} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                                        <div>
                                            <p className="font-medium text-green-700">{formatPeso(pay.amount)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {pay.payment_method ?? pay.payment_mode ?? 'Cash'}
                                                {pay.reference_number ? ` · Ref: ${pay.reference_number}` : ''}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(pay.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ParentFees({ children }: Props) {
    const totalBalance = children.reduce((s, c) => s + c.payment.effective_balance, 0);
    const allPaid = children.every(c => c.payment.is_fully_paid);

    return (
        <>
            <Head title="Fees & Payments" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Fees &amp; Payments</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Fee balance and payment history for your children</p>
                    </div>
                    {children.length > 0 && (
                        <div className="rounded-xl border px-4 py-3 text-right self-start sm:self-auto">
                            <p className="text-xs text-muted-foreground">Total Outstanding</p>
                            <p className={`text-xl font-bold ${allPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {allPaid ? 'All Settled' : formatPeso(totalBalance)}
                            </p>
                        </div>
                    )}
                </div>

                {children.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No children linked to your parent account.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {children.map(child => (
                            <ChildFeesCard key={child.id} child={child} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

ParentFees.layout = (page: React.ReactNode) => <ParentLayout>{page}</ParentLayout>;
