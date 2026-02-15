import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}

interface FeeItem {
    id: number;
    name: string;
    category: string;
    amount: number;
    is_optional: boolean;
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
    items: FeeItem[];
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
    amount: number;
    school_year: string;
    status: string;
}

interface Summary {
    total_fees: number;
    total_discount: number;
    total_paid: number;
    total_balance: number;
}

interface Props {
    student: Student;
    fees: Fee[];
    payments: Payment[];
    promissoryNotes: PromissoryNote[];
    grants: Grant[];
    summary: Summary;
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

export default function PaymentProcess({ student, fees, payments, promissoryNotes, grants, summary }: Props) {
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('all');

    const paymentForm = useForm({
        student_id: student.id.toString(),
        student_fee_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        or_number: '',
        amount: '',
        payment_for: '',
        notes: '',
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
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Record Payment
                            </Button>
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
                                            <SelectContent>
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
                                            <Label>Payment For</Label>
                                            <Select
                                                value={paymentForm.data.payment_for}
                                                onValueChange={(val) => paymentForm.setData('payment_for', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="registration">Registration</SelectItem>
                                                    <SelectItem value="tuition">Tuition</SelectItem>
                                                    <SelectItem value="misc">Miscellaneous</SelectItem>
                                                    <SelectItem value="books">Books</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">{student.full_name}</h3>
                                <p className="text-muted-foreground">LRN: {student.lrn}</p>
                                <div className="flex gap-4 mt-1 text-sm">
                                    {student.program && <span>{student.program}</span>}
                                    {student.year_level && <span>• {student.year_level}</span>}
                                    {student.section && <span>• {student.section}</span>}
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
                <Tabs defaultValue="breakdown" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="breakdown" className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Payment Breakdown
                        </TabsTrigger>
                        <TabsTrigger value="school-year" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            School Year Details
                        </TabsTrigger>
                        <TabsTrigger value="promissory" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Promissory Notes
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Transaction Details
                        </TabsTrigger>
                    </TabsList>

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
                                                        <h4 className="font-semibold">{fee.school_year}</h4>
                                                        {getStatusBadge(fee.status)}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">Balance</p>
                                                        <p className="font-semibold text-red-600">{formatCurrency(fee.balance)}</p>
                                                    </div>
                                                </div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Item</TableHead>
                                                            <TableHead>Category</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {fee.items.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>
                                                                    {item.name}
                                                                    {item.is_optional && (
                                                                        <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>{item.category}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {fee.items.length === 0 && (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                                    No itemized breakdown available
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
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
                                                        -{formatCurrency(grant.amount)}
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
                                <CardTitle>Promissory Notes</CardTitle>
                                <CardDescription>
                                    View and manage promissory note requests from this student
                                </CardDescription>
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
