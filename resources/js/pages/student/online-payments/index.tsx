import { Head, useForm } from '@inertiajs/react';
import { CreditCard, Upload, CheckCircle2, XCircle, Clock, AlertTriangle, DollarSign, Receipt, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import StudentLayout from '@/layouts/student/student-layout';
import { useState, useRef } from 'react';

interface FeeItem {
    id: number;
    name: string;
    amount: number;
    category: string;
}

interface FeeSummary {
    total_fees: number;
    total_discount: number;
    total_paid: number;
    balance: number;
}

interface OnlinePayment {
    id: number;
    reference_number: string;
    amount: number;
    payment_method: string;
    status: 'pending' | 'verified' | 'failed' | 'refunded';
    submitted_at: string;
    verified_at: string | null;
    notes: string | null;
}

interface Props {
    feeItems: FeeItem[];
    summary: FeeSummary;
    recentPayments: OnlinePayment[];
    paymentMethods: { value: string; label: string }[];
}

const statusConfig = {
    pending: {
        label: 'Pending Verification',
        icon: Clock,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
    },
    verified: {
        label: 'Verified',
        icon: CheckCircle2,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
    },
    failed: {
        label: 'Failed',
        icon: XCircle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
    },
    refunded: {
        label: 'Refunded',
        icon: AlertTriangle,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
    },
};

function formatCurrency(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OnlinePayment({ feeItems, summary, recentPayments, paymentMethods }: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        amount: '',
        payment_method: 'gcash',
        reference_number: '',
        receipt_image: null as File | null,
        notes: '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('receipt_image', file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const clearFile = () => {
        form.setData('receipt_image', null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/student/online-payments', {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                clearFile();
            },
        });
    };

    // Group fee items by category
    const groupedFeeItems = feeItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, FeeItem[]>);

    return (
        <StudentLayout>
            <Head title="Online Payment" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Online Payment</h1>
                        <p className="text-muted-foreground">
                            Submit your payment details for verification
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_fees)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Discounts</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">-{formatCurrency(summary.total_discount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total_paid)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.balance)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Fee Breakdown & Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Fee Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Fee Breakdown</CardTitle>
                                <CardDescription>Your assigned fees based on your classification</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(groupedFeeItems).length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No fees assigned yet.
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {Object.entries(groupedFeeItems).map(([category, items]) => (
                                            <div key={category}>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">{category}</h4>
                                                <Table>
                                                    <TableBody>
                                                        {items.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(item.amount)}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ))}
                                        <div className="flex justify-between py-3 border-t font-semibold">
                                            <span>Total</span>
                                            <span>{formatCurrency(summary.total_fees)}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Submission Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Submit Payment
                                </CardTitle>
                                <CardDescription>
                                    Fill in your payment details. Your payment will be verified by accounting.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Payment Amount *</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                min="1"
                                                max={summary.balance}
                                                value={form.data.amount}
                                                onChange={(e) => form.setData('amount', e.target.value)}
                                                placeholder="0.00"
                                                required
                                            />
                                            {form.errors.amount && (
                                                <p className="text-sm text-red-500">{form.errors.amount}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_method">Payment Method *</Label>
                                            <select
                                                id="payment_method"
                                                value={form.data.payment_method}
                                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                required
                                            >
                                                {paymentMethods.map((method) => (
                                                    <option key={method.value} value={method.value}>
                                                        {method.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.errors.payment_method && (
                                                <p className="text-sm text-red-500">{form.errors.payment_method}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="reference_number">Reference Number *</Label>
                                        <Input
                                            id="reference_number"
                                            value={form.data.reference_number}
                                            onChange={(e) => form.setData('reference_number', e.target.value)}
                                            placeholder="Enter transaction reference number"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This is the reference number from your payment provider (e.g., GCash transaction ID)
                                        </p>
                                        {form.errors.reference_number && (
                                            <p className="text-sm text-red-500">{form.errors.reference_number}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Receipt/Screenshot *</Label>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                            {previewUrl ? (
                                                <div className="space-y-4">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Receipt preview"
                                                        className="max-h-48 mx-auto rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={clearFile}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Upload your payment receipt or screenshot
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        Choose File
                                                    </Button>
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                        {form.errors.receipt_image && (
                                            <p className="text-sm text-red-500">{form.errors.receipt_image}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            value={form.data.notes}
                                            onChange={(e) => form.setData('notes', e.target.value)}
                                            placeholder="Any additional notes..."
                                            rows={2}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={form.processing || !form.data.amount || !form.data.reference_number}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {form.processing ? 'Submitting...' : 'Submit Payment'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Recent Payments */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Submissions</CardTitle>
                                <CardDescription>Your recent payment submissions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentPayments.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No payment submissions yet.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {recentPayments.map((payment) => {
                                            const status = statusConfig[payment.status];
                                            const StatusIcon = status.icon;
                                            return (
                                                <div key={payment.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                        <Badge className={`${status.bgColor} ${status.textColor} border-0`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p>Ref: {payment.reference_number}</p>
                                                        <p>Method: {payment.payment_method.toUpperCase()}</p>
                                                        <p>Submitted: {formatDate(payment.submitted_at)}</p>
                                                        {payment.verified_at && (
                                                            <p className="text-green-600">Verified: {formatDate(payment.verified_at)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                    <li>Complete your payment through any supported method</li>
                                    <li>Take a screenshot of your payment confirmation</li>
                                    <li>Fill in the form with accurate details</li>
                                    <li>Upload your receipt/screenshot</li>
                                    <li>Submit and wait for verification</li>
                                </ol>
                                <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                                    <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                                    Your payment will be reflected after verification by accounting staff.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
