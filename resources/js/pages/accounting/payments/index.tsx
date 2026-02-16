import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { index as paymentsIndex, store as storePayment, update as updatePayment, destroy as destroyPayment } from '@/routes/accounting/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, FileText, DollarSign, Receipt, Calendar, Clipboard } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    full_name: string;
}

interface StudentFee {
    id: number;
    school_year: string;
    total_amount: string;
    total_paid: string;
    balance: string;
}

interface User {
    id: number;
    name: string;
}

interface StudentPayment {
    id: number;
    student_id: number;
    student_fee_id: number;
    payment_date: string;
    or_number: string;
    amount: string;
    payment_for: string;
    notes?: string;
    created_at: string;
    student: Student;
    recorded_by: User;
}

interface PaginatedPayments {
    data: StudentPayment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    payments: PaginatedPayments;
    filters: {
        search?: string;
        from?: string;
        to?: string;
        payment_for?: string;
    };
    total: number;
    students: Student[];
    studentFees: Record<number, StudentFee[]>;
}

export default function AccountingPayments({ payments, filters, total, students = [], studentFees = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [paymentFor, setPaymentFor] = useState(filters.payment_for || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        student_id: '',
        student_fee_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        or_number: '',
        amount: '',
        payment_for: 'general',
        notes: '',
    });

    const handleSearch = () => {
        router.get(paymentsIndex.url(), {
            search,
            from: from || undefined,
            to: to || undefined,
            payment_for: paymentFor !== 'all' ? paymentFor : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCreatePayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(storePayment.url(), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setSelectedStudentId('');
                reset();
            },
        });
    };

    const handleEditPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPayment) {
            put(updatePayment.url({ payment: selectedPayment.id }), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedPayment(null);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this payment record? This will update the student\'s balance.')) {
            router.delete(destroyPayment.url({ payment: id }));
        }
    };

    const openEditModal = (payment: StudentPayment) => {
        setSelectedPayment(payment);
        setData({
            student_id: payment.student_id.toString(),
            student_fee_id: payment.student_fee_id.toString(),
            payment_date: payment.payment_date,
            or_number: payment.or_number,
            amount: payment.amount,
            payment_for: payment.payment_for || 'general',
            notes: payment.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const formatCurrency = (amount: string | number) => {
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPaymentForLabel = (value: string) => {
        const labels: Record<string, string> = {
            registration: 'Registration Fee',
            tuition: 'Tuition Fee',
            misc: 'Miscellaneous Fee',
            books: 'Books Fee',
            other: 'Other Fees',
        };
        return labels[value] || 'General Payment';
    };

    const getAvailableFees = (studentId: string) => {
        return studentFees[parseInt(studentId)] || [];
    };

    const getSelectedFeeInfo = () => {
        if (data.student_fee_id) {
            const fees = getAvailableFees(data.student_id);
            const selectedFee = fees.find(f => f.id.toString() === data.student_fee_id);
            return selectedFee;
        }
        return null;
    };

    const feeInfo = getSelectedFeeInfo();

    return (
        <AccountingLayout>
            <Head title="Payment Records" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Payment Records"
                    description="Record and track student payments with OR numbers"
                    action={
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <form onSubmit={handleCreatePayment}>
                                    <DialogHeader>
                                        <DialogTitle>Record Payment</DialogTitle>
                                        <DialogDescription>
                                            Record a new payment transaction for a student
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="student_id">Student *</Label>
                                            <Select
                                                value={data.student_id}
                                                onValueChange={(value) => {
                                                    setData('student_id', value);
                                                    setData('student_fee_id', '');
                                                    setSelectedStudentId(value);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id.toString()}>
                                                            {student.full_name} - {student.lrn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.student_id && (
                                                <p className="text-sm text-red-500">{errors.student_id}</p>
                                            )}
                                        </div>

                                        {data.student_id && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="student_fee_id">Fee Record *</Label>
                                                <Select
                                                    value={data.student_fee_id}
                                                    onValueChange={(value) => setData('student_fee_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select fee record" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getAvailableFees(data.student_id).map((fee) => (
                                                            <SelectItem key={fee.id} value={fee.id.toString()}>
                                                                {fee.school_year} - Balance: {formatCurrency(fee.balance)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.student_fee_id && (
                                                    <p className="text-sm text-red-500">{errors.student_fee_id}</p>
                                                )}
                                            </div>
                                        )}

                                        {feeInfo && (
                                            <div className="rounded-lg border bg-muted p-4">
                                                <h4 className="font-semibold mb-2">Fee Information</h4>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Total Amount:</span>
                                                        <p className="font-medium">{formatCurrency(feeInfo.total_amount)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Total Paid:</span>
                                                        <p className="font-medium text-green-600">{formatCurrency(feeInfo.total_paid)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Balance:</span>
                                                        <p className="font-medium text-red-600">{formatCurrency(feeInfo.balance)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_date">Payment Date *</Label>
                                                <Input
                                                    id="payment_date"
                                                    type="date"
                                                    value={data.payment_date}
                                                    onChange={(e) => setData('payment_date', e.target.value)}
                                                />
                                                {errors.payment_date && (
                                                    <p className="text-sm text-red-500">{errors.payment_date}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="or_number">OR Number</Label>
                                                <Input
                                                    id="or_number"
                                                    placeholder="e.g., 18667"
                                                    value={data.or_number}
                                                    onChange={(e) => setData('or_number', e.target.value)}
                                                />
                                                {errors.or_number && (
                                                    <p className="text-sm text-red-500">{errors.or_number}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="amount">Amount *</Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="0.00"
                                                    value={data.amount}
                                                    onChange={(e) => setData('amount', e.target.value)}
                                                />
                                                {errors.amount && (
                                                    <p className="text-sm text-red-500">{errors.amount}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_for">Payment For</Label>
                                                <Select
                                                    value={data.payment_for}
                                                    onValueChange={(value) => setData('payment_for', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select payment type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general">General Payment</SelectItem>
                                                        <SelectItem value="registration">Registration Fee</SelectItem>
                                                        <SelectItem value="tuition">Tuition Fee</SelectItem>
                                                        <SelectItem value="misc">Miscellaneous Fee</SelectItem>
                                                        <SelectItem value="books">Books Fee</SelectItem>
                                                        <SelectItem value="other">Other Fees</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Additional notes or remarks..."
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsCreateModalOpen(false);
                                                setSelectedStudentId('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Record Payment
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {/* Summary Card */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                            <DollarSign className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Collected (Filtered)</p>
                            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="OR number, student name, LRN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="from">Date From</Label>
                            <Input
                                id="from"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="to">Date To</Label>
                            <Input
                                id="to"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentFor">Payment Type</Label>
                            <Select value={paymentFor} onValueChange={setPaymentFor}>
                                <SelectTrigger id="paymentFor">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="registration">Registration</SelectItem>
                                    <SelectItem value="tuition">Tuition</SelectItem>
                                    <SelectItem value="misc">Miscellaneous</SelectItem>
                                    <SelectItem value="books">Books</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSearch} className="flex-1 sm:flex-initial">
                            <Search className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setFrom('');
                                setTo('');
                                setPaymentFor('all');
                                router.get(paymentsIndex.url());
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="breakdown" className="space-y-4">
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
                            Promissory Note
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Transaction Details
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Payment Breakdown */}
                    <TabsContent value="breakdown">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Records</CardTitle>
                                <CardDescription>All student payment transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>OR Number</TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>LRN</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Payment For</TableHead>
                                            <TableHead>Recorded By</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-24 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                                        <p className="text-muted-foreground">No payment records found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            payments.data.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                                    <TableCell className="font-medium">
                                                        {payment.or_number || '-'}
                                                    </TableCell>
                                                    <TableCell>{payment.student.full_name}</TableCell>
                                                    <TableCell>{payment.student.lrn}</TableCell>
                                                    <TableCell className="text-right font-semibold text-green-600">
                                                        {formatCurrency(payment.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {getPaymentForLabel(payment.payment_for)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {payment.recorded_by.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditModal(payment)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(payment.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {payments.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t px-4 py-4 mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {payments.data.length} of {payments.total} records
                                        </div>
                                        <div className="flex gap-2">
                                            {Array.from({ length: payments.last_page }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === payments.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => router.get(paymentsIndex.url({ query: { page } }))}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: School Year Details */}
                    <TabsContent value="school-year">
                        <Card>
                            <CardHeader>
                                <CardTitle>School Year Summary</CardTitle>
                                <CardDescription>Payment statistics by school year</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center py-8 text-muted-foreground">School year details will be displayed here</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Promissory Note */}
                    <TabsContent value="promissory">
                        <Card>
                            <CardHeader>
                                <CardTitle>Promissory Notes</CardTitle>
                                <CardDescription>Student promissory note requests</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center py-8 text-muted-foreground">Promissory notes will be displayed here</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 4: Transaction Details */}
                    <TabsContent value="transactions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>Detailed transaction logs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center py-8 text-muted-foreground">Transaction details will be displayed here</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-2xl">
                        <form onSubmit={handleEditPayment}>
                            <DialogHeader>
                                <DialogTitle>Edit Payment</DialogTitle>
                                <DialogDescription>
                                    Update payment record for {selectedPayment?.student.full_name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_payment_date">Payment Date *</Label>
                                        <Input
                                            id="edit_payment_date"
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_or_number">OR Number</Label>
                                        <Input
                                            id="edit_or_number"
                                            value={data.or_number}
                                            onChange={(e) => setData('or_number', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_amount">Amount *</Label>
                                        <Input
                                            id="edit_amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_payment_for">Payment For</Label>
                                        <Select
                                            value={data.payment_for}
                                            onValueChange={(value) => setData('payment_for', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">General Payment</SelectItem>
                                                <SelectItem value="registration">Registration Fee</SelectItem>
                                                <SelectItem value="tuition">Tuition Fee</SelectItem>
                                                <SelectItem value="misc">Miscellaneous Fee</SelectItem>
                                                <SelectItem value="books">Books Fee</SelectItem>
                                                <SelectItem value="other">Other Fees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit_notes">Notes</Label>
                                    <Textarea
                                        id="edit_notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Payment
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AccountingLayout>
    );
}
