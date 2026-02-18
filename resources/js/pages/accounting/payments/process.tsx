import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    DollarSign, 
    Calendar, 
    FileText, 
    Receipt, 
    Plus,
    Check,
    X,
    Clock,
    AlertTriangle,
    GraduationCap,
    User,
    RefreshCw,
    CreditCard,
    Printer,
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    student_photo_url: string | null;
}

interface FeeItemDetail {
    id: number;
    name: string;
    amount: number;
}

interface FeeCategory {
    category_id: number;
    category_name: string;
    items: FeeItemDetail[];
}

interface Fee {
    id: number;
    school_year: string;
    total_amount: number;
    grant_discount: number;
    total_paid: number;
    balance: number;
    status: 'paid' | 'overdue' | 'pending';
    is_overdue: boolean;
    due_date: string | null;
    categories: FeeCategory[];
}

interface Payment {
    id: number;
    payment_date: string;
    or_number: string;
    amount: number;
    payment_for: string;
    notes: string | null;
    recorded_by: string;
    created_at: string;
}

interface PromissoryNote {
    id: number;
    student_fee_id: number;
    submitted_date: string;
    due_date: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'declined' | 'fulfilled';
    school_year: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_notes: string | null;
}

interface Grant {
    id: number;
    name: string;
    discount_amount: number;
    school_year: string;
    status: string;
}

interface Summary {
    total_fees: number;
    total_discount: number;
    total_paid: number;
    total_balance: number;
    previous_balance: number;
    current_fees_balance: number;
}

interface Cashier {
    id: number;
    name: string;
}

interface Props {
    student: Student;
    fees: Fee[];
    payments: Payment[];
    promissoryNotes: PromissoryNote[];
    grants: Grant[];
    summary: Summary;
    cashiers?: Cashier[];
}

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
    });
}

export default function PaymentProcess({ student, fees, payments, promissoryNotes, grants, summary, cashiers = [] }: Props) {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isPromissoryDialogOpen, setIsPromissoryDialogOpen] = useState(false);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('all');
    const [printReceipt, setPrintReceipt] = useState(true);
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [selectedCashier, setSelectedCashier] = useState<string>('');

    // Payment allocation calculation
    const paymentAllocation = useMemo(() => {
        const amount = parseFloat(amountReceived) || 0;
        const previousBalance = summary.previous_balance || 0;
        const currentFeesBalance = summary.current_fees_balance || summary.total_balance;
        
        let previousBalancePaid = 0;
        let currentFeesPaid = 0;
        let remainingAmount = amount;
        
        // First, pay off previous balance
        if (previousBalance > 0 && remainingAmount > 0) {
            previousBalancePaid = Math.min(previousBalance, remainingAmount);
            remainingAmount -= previousBalancePaid;
        }
        
        // Then, pay current fees
        if (currentFeesBalance > 0 && remainingAmount > 0) {
            currentFeesPaid = Math.min(currentFeesBalance, remainingAmount);
            remainingAmount -= currentFeesPaid;
        }
        
        return {
            previousBalancePaid,
            currentFeesPaid,
            remainingPreviousBalance: Math.max(0, previousBalance - previousBalancePaid),
            remainingCurrentFeesBalance: Math.max(0, currentFeesBalance - currentFeesPaid),
            change: Math.max(0, remainingAmount),
        };
    }, [amountReceived, summary]);

    const paymentForm = useForm({
        student_id: student.id.toString(),
        student_fee_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        or_number: '',
        amount: '',
        payment_mode: 'CASH',
        reference_number: '',
        bank_name: '',
        payment_for: 'general',
        notes: '',
        cashier_id: '',
        print_receipt: true,
    });

    const promissoryForm = useForm({
        student_id: student.id,
        student_fee_id: '',
        amount: '',
        due_date: '',
        reason: '',
    });

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post('/accounting/payments', {
            onSuccess: () => {
                setIsPaymentDialogOpen(false);
                paymentForm.reset();
            },
        });
    };

    const handleMakePayment = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(amountReceived) || 0;
        if (amount <= 0) return;
        
        // Find the fee with balance to apply payment to
        const feeWithBalance = fees.find(f => f.balance > 0);
        if (!feeWithBalance) return;
        
        paymentForm.setData({
            ...paymentForm.data,
            student_fee_id: feeWithBalance.id.toString(),
            amount: amountReceived,
            cashier_id: selectedCashier,
            print_receipt: printReceipt,
        });
        
        router.post('/accounting/payments', {
            student_id: student.id.toString(),
            student_fee_id: feeWithBalance.id.toString(),
            payment_date: paymentForm.data.payment_date,
            or_number: paymentForm.data.or_number,
            amount: amountReceived,
            payment_mode: 'CASH',
            payment_for: 'general',
            notes: paymentForm.data.notes,
            cashier_id: selectedCashier,
            print_receipt: printReceipt,
        }, {
            onSuccess: () => {
                setAmountReceived('');
                paymentForm.reset();
            },
        });
    };

    const handlePromissorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        promissoryForm.post('/accounting/promissory-notes', {
            onSuccess: () => {
                setIsPromissoryDialogOpen(false);
                promissoryForm.reset();
            },
        });
    };

    const handleRefresh = () => {
        router.reload({ only: ['promissoryNotes'] });
    };

    const handleApprovePromissory = (noteId: number) => {
        router.post(`/accounting/promissory-notes/${noteId}/approve`);
    };

    const handleDeclinePromissory = (noteId: number) => {
        router.post(`/accounting/promissory-notes/${noteId}/decline`);
    };

    const getStatusBadge = (status: string) => {
        const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
            paid: { label: 'Fully Paid', variant: 'default', color: 'bg-green-100 text-green-700' },
            pending: { label: 'Pending', variant: 'secondary', color: 'bg-yellow-100 text-yellow-700' },
            overdue: { label: 'Overdue', variant: 'destructive', color: 'bg-red-100 text-red-700' },
            approved: { label: 'Approved', variant: 'default', color: 'bg-green-100 text-green-700' },
            declined: { label: 'Declined', variant: 'destructive', color: 'bg-red-100 text-red-700' },
            fulfilled: { label: 'Fulfilled', variant: 'default', color: 'bg-blue-100 text-blue-700' },
            active: { label: 'Active', variant: 'default', color: 'bg-green-100 text-green-700' },
            inactive: { label: 'Inactive', variant: 'secondary', color: 'bg-gray-100 text-gray-700' },
            graduated: { label: 'Graduated', variant: 'default', color: 'bg-blue-100 text-blue-700' },
            withdrawn: { label: 'Withdrawn', variant: 'destructive', color: 'bg-red-100 text-red-700' },
        };
        const config = configs[status] || configs.pending;
        return <Badge className={config.color}>{config.label}</Badge>;
    };

    const filteredFees = selectedSchoolYear === 'all' 
        ? fees 
        : fees.filter(f => f.school_year === selectedSchoolYear);

    const schoolYears = [...new Set(fees.map(f => f.school_year))];

    return (
        <AccountingLayout>
            <Head title={`Payment Processing - ${student.full_name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/accounting/student-accounts">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Payment Processing</h1>
                            <p className="text-muted-foreground">
                                Process payments and manage account for {student.full_name}
                            </p>
                        </div>
                    </div>
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogTrigger asChild>
                            {/* <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button> */}
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handlePaymentSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Record Payment</DialogTitle>
                                    <DialogDescription>
                                        Record a new payment for {student.full_name}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Fee / School Year</Label>
                                        <Select
                                            value={paymentForm.data.student_fee_id}
                                            onValueChange={(val) => paymentForm.setData('student_fee_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fee" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {fees.filter(f => f.balance > 0).map((fee) => (
                                                    <SelectItem key={fee.id} value={fee.id.toString()}>
                                                        {fee.school_year} - Balance: {formatCurrency(fee.balance)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Payment Date</Label>
                                            <Input
                                                type="date"
                                                value={paymentForm.data.payment_date}
                                                onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>OR Number</Label>
                                            <Input
                                                value={paymentForm.data.or_number}
                                                onChange={(e) => paymentForm.setData('or_number', e.target.value)}
                                                placeholder="Official Receipt #"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Amount</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={paymentForm.data.amount}
                                                onChange={(e) => paymentForm.setData('amount', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Payment Mode</Label>
                                            <Select
                                                value={paymentForm.data.payment_mode}
                                                onValueChange={(val) => paymentForm.setData('payment_mode', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select mode" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="GCASH">GCash</SelectItem>
                                                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {(paymentForm.data.payment_mode === 'GCASH' || paymentForm.data.payment_mode === 'BANK') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Reference Number</Label>
                                                <Input
                                                    value={paymentForm.data.reference_number}
                                                    onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                                                    placeholder="Transaction/Reference #"
                                                />
                                            </div>
                                            {paymentForm.data.payment_mode === 'BANK' && (
                                                <div className="grid gap-2">
                                                    <Label>Bank Name</Label>
                                                    <Input
                                                        value={paymentForm.data.bank_name}
                                                        onChange={(e) => paymentForm.setData('bank_name', e.target.value)}
                                                        placeholder="Name of bank"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label>Payment For</Label>
                                        <Select
                                            value={paymentForm.data.payment_for}
                                            onValueChange={(val) => paymentForm.setData('payment_for', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectItem value="general">General Payment</SelectItem>
                                                <SelectItem value="registration">Registration</SelectItem>
                                                <SelectItem value="tuition">Tuition</SelectItem>
                                                <SelectItem value="misc">Miscellaneous</SelectItem>
                                                <SelectItem value="books">Books</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Notes (Optional)</Label>
                                        <Textarea
                                            value={paymentForm.data.notes}
                                            onChange={(e) => paymentForm.setData('notes', e.target.value)}
                                            placeholder="Additional notes..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={paymentForm.processing}>
                                        Record Payment
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Student Info Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-16 w-16">
                                <AvatarImage 
                                    src={student.student_photo_url || undefined} 
                                    alt={student.full_name} 
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                    {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-semibold">{student.full_name}</h3>
                                    {grants.length > 0 && (
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                            {(() => {
                                                const totalDiscount = summary.total_discount;
                                                const totalFees = summary.total_fees;
                                                if (totalFees > 0 && totalDiscount > 0) {
                                                    const discountPercent = Math.round((totalDiscount / totalFees) * 100);
                                                    return `${discountPercent}% Discount`;
                                                }
                                                return 'Grant Applied';
                                            })()}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground">LRN: {student.lrn}</p>
                                <div className="flex gap-4 mt-1 text-sm">
                                    {student.program && <span>{student.program}</span>}
                                    {student.year_level && <span>• {student.year_level}</span>}
                                    {student.section && <span>• {student.section}</span>}
                                </div>
                                {/* Grant Info */}
                                {grants.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm text-green-600 font-medium">
                                            Grant: {grants.map(g => `${g.name} (${formatCurrency(g.discount_amount)})`).join(', ')}
                                        </span>
                                    </div>
                                )}
                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-muted-foreground">Payment Progress</span>
                                        <span className="text-xs font-medium">
                                            {(() => {
                                                // Simple calculation: what percentage of net amount has been paid
                                                const netAmount = summary.total_fees - summary.total_discount;
                                                if (netAmount <= 0 || summary.total_paid >= netAmount) return '100% Paid';
                                                if (summary.total_paid <= 0) return '0% Paid';
                                                const percent = Math.floor((summary.total_paid / netAmount) * 100);
                                                return `${percent}% Paid`;
                                            })()}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={(() => {
                                            const netAmount = summary.total_fees - summary.total_discount;
                                            if (netAmount <= 0) return 100;
                                            if (summary.total_paid <= 0) return 0;
                                            const percent = (summary.total_paid / netAmount) * 100;
                                            return Math.min(Math.max(percent, 0), 100);
                                        })()}
                                        className="h-2"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Fees</p>
                                    <p className="text-lg font-semibold">{formatCurrency(summary.total_fees)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Discounts</p>
                                    <p className="text-lg font-semibold text-green-600">-{formatCurrency(summary.total_discount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Paid</p>
                                    <p className="text-lg font-semibold text-blue-600">{formatCurrency(summary.total_paid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="text-lg font-semibold text-red-600">{formatCurrency(summary.total_balance)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="make-payment" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="make-payment" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Make Payment
                        </TabsTrigger>
                        <TabsTrigger value="breakdown" className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Fee Breakdown
                        </TabsTrigger>
                        <TabsTrigger value="school-year" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            School Year
                        </TabsTrigger>
                        <TabsTrigger value="promissory" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Promissory
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Transactions
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 0: Make Payment */}
                    <TabsContent value="make-payment" className="space-y-4">
                        <form onSubmit={handleMakePayment}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Payment Form */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Payment Details Card */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Details</CardTitle>
                                            <CardDescription>Enter payment information</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="or_number">OR Number *</Label>
                                                    <Input
                                                        id="or_number"
                                                        value={paymentForm.data.or_number}
                                                        onChange={(e) => paymentForm.setData('or_number', e.target.value)}
                                                        placeholder="Official Receipt #"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="payment_date">Payment Date *</Label>
                                                    <Input
                                                        id="payment_date"
                                                        type="date"
                                                        value={paymentForm.data.payment_date}
                                                        onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Payment Method</Label>
                                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium">Cash</span>
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="amount_received">Amount Received *</Label>
                                                    <Input
                                                        id="amount_received"
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={amountReceived}
                                                        onChange={(e) => setAmountReceived(e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                        className="text-lg font-semibold"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Payment Breakdown Card */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Previous Balance</span>
                                                    <span className="font-medium">{formatCurrency(summary.previous_balance || 0)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Current Fees Balance</span>
                                                    <span className="font-medium">{formatCurrency(summary.current_fees_balance || summary.total_balance)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 bg-blue-50 px-3 rounded-md">
                                                    <span className="font-medium text-blue-700">Amount Received</span>
                                                    <span className="font-bold text-blue-700">{formatCurrency(parseFloat(amountReceived) || 0)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Payment Allocation Card */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Allocation</CardTitle>
                                            <CardDescription>How the payment will be applied</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Previous Balance Paid</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(paymentAllocation.previousBalancePaid)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Current Fees Paid</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(paymentAllocation.currentFeesPaid)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Remaining Previous Balance</span>
                                                    <span className="font-medium text-red-600">{formatCurrency(paymentAllocation.remainingPreviousBalance)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Remaining Current Fees Balance</span>
                                                    <span className="font-medium text-red-600">{formatCurrency(paymentAllocation.remainingCurrentFeesBalance)}</span>
                                                </div>
                                                {paymentAllocation.change > 0 && (
                                                    <div className="flex justify-between py-2 bg-yellow-50 px-3 rounded-md">
                                                        <span className="font-medium text-yellow-700">Change</span>
                                                        <span className="font-bold text-yellow-700">{formatCurrency(paymentAllocation.change)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column - Fee Summary & Actions */}
                                <div className="space-y-4">
                                    {/* Fee Summary Card */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Fee Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Total Fees</span>
                                                    <span className="font-medium">{formatCurrency(summary.total_fees)}</span>
                                                </div>
                                                {summary.total_discount > 0 && (
                                                    <div className="flex justify-between py-2 border-b">
                                                        <span className="text-muted-foreground">Discount</span>
                                                        <span className="font-medium text-green-600">-{formatCurrency(summary.total_discount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-muted-foreground">Total Paid</span>
                                                    <span className="font-medium text-blue-600">{formatCurrency(summary.total_paid)}</span>
                                                </div>
                                                <div className="flex justify-between py-3 bg-red-50 px-3 rounded-md">
                                                    <span className="font-semibold text-red-700">Balance Due</span>
                                                    <span className="font-bold text-red-700">{formatCurrency(summary.total_balance)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Cashier & Options */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Processing Options</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {cashiers.length > 0 && (
                                                <div className="grid gap-2">
                                                    <Label>Cashier</Label>
                                                    <Select
                                                        value={selectedCashier}
                                                        onValueChange={setSelectedCashier}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select cashier" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {cashiers.map((cashier) => (
                                                                <SelectItem key={cashier.id} value={cashier.id.toString()}>
                                                                    {cashier.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 py-2">
                                                <Checkbox
                                                    id="print_receipt"
                                                    checked={printReceipt}
                                                    onCheckedChange={(checked) => setPrintReceipt(checked as boolean)}
                                                />
                                                <Label htmlFor="print_receipt" className="flex items-center gap-2 cursor-pointer">
                                                    <Printer className="h-4 w-4" />
                                                    Print Receipt
                                                </Label>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">Notes (Optional)</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={paymentForm.data.notes}
                                                    onChange={(e) => paymentForm.setData('notes', e.target.value)}
                                                    placeholder="Additional notes..."
                                                    rows={2}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Action Button */}
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 text-lg"
                                        disabled={!amountReceived || parseFloat(amountReceived) <= 0 || !paymentForm.data.or_number}
                                    >
                                        <Receipt className="h-5 w-5 mr-2" />
                                        Record Payment
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Tab 1: Payment Breakdown */}
                    <TabsContent value="breakdown" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Fee Breakdown by Category</CardTitle>
                                <CardDescription>
                                    View detailed breakdown of all fees across school years
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {fees.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No fees found.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {fees.map((fee) => (
                                            <div key={fee.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <GraduationCap className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <h4 className="font-semibold">School Year</h4>
                                                            <p className="text-sm text-muted-foreground">{fee.school_year}</p>
                                                        </div>
                                                        {getStatusBadge(fee.status)}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">Balance</p>
                                                        <p className="font-semibold text-red-600">{formatCurrency(fee.balance)}</p>
                                                    </div>
                                                </div>

                                                {/* Display by Category */}
                                                {fee.categories && fee.categories.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {fee.categories.map((category) => (
                                                            <div key={category.category_id} className="border rounded-md p-3 bg-muted/30">
                                                                <h5 className="font-semibold mb-2 flex items-center gap-2">
                                                                    <span className="text-primary">{category.category_name}</span>
                                                                </h5>
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Fee Item</TableHead>
                                                                            <TableHead className="text-right">Amount</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {category.items.map((item) => (
                                                                            <TableRow key={item.id}>
                                                                                <TableCell>{item.name}</TableCell>
                                                                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-center py-8 text-muted-foreground">No fee items assigned</p>
                                                )}

                                                <div className="flex justify-end gap-6 mt-4 pt-4 border-t text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Total: </span>
                                                        <span className="font-medium">{formatCurrency(fee.total_amount)}</span>
                                                    </div>
                                                    {fee.grant_discount > 0 && (
                                                        <div>
                                                            <span className="text-muted-foreground">Discount: </span>
                                                            <span className="font-medium text-green-600">-{formatCurrency(fee.grant_discount)}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-muted-foreground">Paid: </span>
                                                        <span className="font-medium text-blue-600">{formatCurrency(fee.total_paid)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Grants/Scholarships */}
                        {grants.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Grants & Scholarships</CardTitle>
                                    <CardDescription>Applied discounts and scholarships</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Grant Name</TableHead>
                                                <TableHead>School Year</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Discount Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {grants.map((grant) => (
                                                <TableRow key={grant.id}>
                                                    <TableCell className="font-medium">{grant.name}</TableCell>
                                                    <TableCell>{grant.school_year}</TableCell>
                                                    <TableCell>{getStatusBadge(grant.status)}</TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        -{formatCurrency(grant.discount_amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab 2: School Year Details */}
                    <TabsContent value="school-year" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>School Year Summary</CardTitle>
                                        <CardDescription>
                                            Fee status and payments per school year
                                        </CardDescription>
                                    </div>
                                    <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Filter by school year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All School Years</SelectItem>
                                            {schoolYears.map((sy) => (
                                                <SelectItem key={sy} value={sy}>{sy}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredFees.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">No school year data found.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>School Year</TableHead>
                                                <TableHead className="text-right">Total Fees</TableHead>
                                                <TableHead className="text-right">Discount</TableHead>
                                                <TableHead className="text-right">Paid</TableHead>
                                                <TableHead className="text-right">Balance</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Due Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredFees.map((fee) => (
                                                <TableRow key={fee.id} className={fee.is_overdue ? 'bg-red-50' : ''}>
                                                    <TableCell className="font-medium">{fee.school_year}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(fee.total_amount)}</TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        {fee.grant_discount > 0 ? `-${formatCurrency(fee.grant_discount)}` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-blue-600">{formatCurrency(fee.total_paid)}</TableCell>
                                                    <TableCell className="text-right font-medium text-red-600">
                                                        {formatCurrency(fee.balance)}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(fee.status)}</TableCell>
                                                    <TableCell>
                                                        {fee.due_date ? formatDate(fee.due_date) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Promissory Notes */}
                    <TabsContent value="promissory" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Promissory Notes</CardTitle>
                                        <CardDescription>
                                            View and manage promissory note requests from this student
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Dialog open={isPromissoryDialogOpen} onOpenChange={setIsPromissoryDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-green-600 hover:bg-green-700">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    New Promissory Note
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <form onSubmit={handlePromissorySubmit}>
                                                    <DialogHeader>
                                                        <DialogTitle>Create Promissory Note</DialogTitle>
                                                        <DialogDescription>
                                                            Create a new promissory note for {student.full_name}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label>Fee / School Year</Label>
                                                            <Select
                                                                value={promissoryForm.data.student_fee_id}
                                                                onValueChange={(val) => promissoryForm.setData('student_fee_id', val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select fee" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {fees.filter(f => f.balance > 0).map((fee) => (
                                                                        <SelectItem key={fee.id} value={fee.id.toString()}>
                                                                            {fee.school_year} - Balance: {formatCurrency(fee.balance)}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {promissoryForm.errors.student_fee_id && (
                                                                <p className="text-sm text-red-500">{promissoryForm.errors.student_fee_id}</p>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="grid gap-2">
                                                                <Label>Amount</Label>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    value={promissoryForm.data.amount}
                                                                    onChange={(e) => promissoryForm.setData('amount', e.target.value)}
                                                                    placeholder="0.00"
                                                                />
                                                                {promissoryForm.errors.amount && (
                                                                    <p className="text-sm text-red-500">{promissoryForm.errors.amount}</p>
                                                                )}
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <Label>Due Date</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={promissoryForm.data.due_date}
                                                                    onChange={(e) => promissoryForm.setData('due_date', e.target.value)}
                                                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                                />
                                                                {promissoryForm.errors.due_date && (
                                                                    <p className="text-sm text-red-500">{promissoryForm.errors.due_date}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label>Reason</Label>
                                                            <Textarea
                                                                value={promissoryForm.data.reason}
                                                                onChange={(e) => promissoryForm.setData('reason', e.target.value)}
                                                                placeholder="Reason for promissory note..."
                                                                rows={3}
                                                            />
                                                            {promissoryForm.errors.reason && (
                                                                <p className="text-sm text-red-500">{promissoryForm.errors.reason}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="button" variant="outline" onClick={() => setIsPromissoryDialogOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={promissoryForm.processing}>
                                                            Create Note
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" className="bg-cyan-500 hover:bg-cyan-600 text-white" onClick={handleRefresh}>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {promissoryNotes.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No promissory notes found for this student.
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>School Year</TableHead>
                                                <TableHead>Submitted</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {promissoryNotes.map((note) => (
                                                <TableRow key={note.id}>
                                                    <TableCell className="font-medium">{note.school_year}</TableCell>
                                                    <TableCell>{formatDate(note.submitted_date)}</TableCell>
                                                    <TableCell>{formatDate(note.due_date)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(note.amount)}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{note.reason}</TableCell>
                                                    <TableCell>{getStatusBadge(note.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {note.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="h-8"
                                                                    onClick={() => handleApprovePromissory(note.id)}
                                                                >
                                                                    <Check className="h-3 w-3 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-8"
                                                                    onClick={() => handleDeclinePromissory(note.id)}
                                                                >
                                                                    <X className="h-3 w-3 mr-1" />
                                                                    Decline
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {note.status !== 'pending' && note.reviewed_by && (
                                                            <span className="text-xs text-muted-foreground">
                                                                by {note.reviewed_by}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 4: Transaction Details */}
                    <TabsContent value="transactions" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>
                                    Complete payment transaction history
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {payments.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No payment transactions found.
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>OR Number</TableHead>
                                                <TableHead>Payment For</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Notes</TableHead>
                                                <TableHead>Recorded By</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                                    <TableCell className="font-mono">
                                                        {payment.or_number || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {payment.payment_for || 'General'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-green-600">
                                                        +{formatCurrency(payment.amount)}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate text-muted-foreground">
                                                        {payment.notes || '-'}
                                                    </TableCell>
                                                    <TableCell>{payment.recorded_by}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {/* Summary at bottom */}
                                {payments.length > 0 && (
                                    <div className="flex justify-end pt-4 border-t mt-4">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Total Payments</p>
                                            <p className="text-xl font-semibold text-green-600">
                                                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AccountingLayout>
    );
}
