import { Head, router, useForm } from '@inertiajs/react';
import { Clock, CheckCircle2, XCircle, Search, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AccountingLayout from '@/layouts/accounting-layout';

type Student = {
    id: number;
    full_name: string;
    lrn: string;
};

type StudentFee = {
    id: number;
    school_year: string;
    total_amount: number;
    total_paid: number;
    balance: number;
};

type StudentWithFees = {
    id: number;
    full_name: string;
    lrn: string;
    program: string;
    year_level: string;
    fees: StudentFee[];
};

type ProcessedBy = {
    id: number;
    name: string;
};

type Refund = {
    id: number;
    type: 'refund' | 'void';
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    accounting_notes: string | null;
    processed_at: string | null;
    created_at: string;
    student: Student;
    student_fee: StudentFee | null;
    processed_by: ProcessedBy | null;
};

type PaginatedRefunds = {
    data: Refund[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
};

type Stats = {
    pending: number;
    approved: number;
    rejected: number;
    total_approved_amount: number;
};

type Filters = {
    search: string;
    status: string;
    type: string;
};

type Props = {
    refunds: PaginatedRefunds;
    stats: Stats;
    filters: Filters;
};

export default function AccountingRefundsIndex({ refunds, stats, filters }: Props) {
    const [actionRefund, setActionRefund] = useState<Refund | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

    // Create refund request state
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [studentResults, setStudentResults] = useState<StudentWithFees[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
    const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
    const [searching, setSearching] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const createForm = useForm({
        student_id: 0,
        student_fee_id: 0,
        type: 'refund' as 'refund' | 'void',
        amount: '',
        reason: '',
    });

    const notesForm = useForm({ accounting_notes: '' });

    const formatCurrency = (val: number) =>
        `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const statusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800 border border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:         return <Badge className="bg-amber-100 text-amber-800 border border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        }
    };

    const handleStudentSearch = (value: string) => {
        setStudentSearch(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (value.length < 2) {
            setStudentResults([]);
            return;
        }
        debounceTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await fetch(`/accounting/refunds/search-students?search=${encodeURIComponent(value)}`);
                const data = await response.json();
                setStudentResults(data);
            } catch {
                setStudentResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const selectStudent = (student: StudentWithFees) => {
        setSelectedStudent(student);
        setSelectedFee(null);
        createForm.setData('student_id', student.id);
        createForm.setData('student_fee_id', 0);
        setStudentResults([]);
        setStudentSearch('');
    };

    const selectFee = (fee: StudentFee) => {
        setSelectedFee(fee);
        createForm.setData('student_fee_id', fee.id);
        // Default amount to total_paid for refund
        if (createForm.data.type === 'refund') {
            createForm.setData('amount', fee.total_paid.toString());
        }
    };

    const resetCreateForm = () => {
        setShowCreateDialog(false);
        setSelectedStudent(null);
        setSelectedFee(null);
        setStudentSearch('');
        setStudentResults([]);
        createForm.reset();
    };

    const submitCreateForm = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/accounting/refunds', {
            onSuccess: () => resetCreateForm(),
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/accounting/refunds', { ...filters, [key]: value, page: 1 }, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    };

    const openAction = (refund: Refund, type: 'approve' | 'reject') => {
        setActionRefund(refund);
        setActionType(type);
        notesForm.reset();
    };

    const submitAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!actionRefund || !actionType) return;
        notesForm.post(`/accounting/refunds/${actionRefund.id}/${actionType}`, {
            onSuccess: () => {
                toast.success('Changes saved successfully');
                setActionRefund(null);
                setActionType(null);
            },
        });
    };

    return (
        <AccountingLayout>
            <Head title="Refund / Void Requests" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Refund / Void Requests</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Review and process student refund and void requests.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Request
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <Clock className="h-8 w-8 text-amber-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                    <p className="text-xs text-muted-foreground">Pending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.approved}</p>
                                    <p className="text-xs text-muted-foreground">Approved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <XCircle className="h-8 w-8 text-red-500" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.rejected}</p>
                                    <p className="text-xs text-muted-foreground">Rejected</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div>
                                <p className="text-xl font-bold text-green-700">{formatCurrency(stats.total_approved_amount)}</p>
                                <p className="text-xs text-muted-foreground">Total Approved Amount</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="text-xs mb-1 block">Search Student</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Name or LRN..."
                                        defaultValue={filters.search}
                                        onChange={e => handleFilter('search', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-40">
                                <Label className="text-xs mb-1 block">Status</Label>
                                <Select value={filters.status || 'all'} onValueChange={v => handleFilter('status', v === 'all' ? '' : v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-36">
                                <Label className="text-xs mb-1 block">Type</Label>
                                <Select value={filters.type || 'all'} onValueChange={v => handleFilter('type', v === 'all' ? '' : v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="refund">Refund</SelectItem>
                                        <SelectItem value="void">Void</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Requests
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                {refunds.from}–{refunds.to} of {refunds.total}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>LRN</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Processed By</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {refunds.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            No refund/void requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    refunds.data.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell className="text-sm whitespace-nowrap">{r.created_at}</TableCell>
                                            <TableCell className="font-medium text-sm">{r.student.full_name}</TableCell>
                                            <TableCell className="text-sm font-mono">{r.student.lrn}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {r.type === 'void' ? <RefreshCw className="h-3 w-3 mr-1" /> : null}
                                                    {r.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{r.student_fee?.school_year || '—'}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(r.amount)}</TableCell>
                                            <TableCell className="text-sm max-w-[180px] truncate" title={r.reason}>{r.reason}</TableCell>
                                            <TableCell>{statusBadge(r.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {r.processed_by ? r.processed_by.name : (r.status === 'pending' ? '—' : '—')}
                                                {r.accounting_notes && (
                                                    <p className="text-xs italic">{r.accounting_notes}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                                                            onClick={() => openAction(r, 'approve')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-7 text-xs"
                                                            onClick={() => openAction(r, 'reject')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {refunds.last_page > 1 && (
                            <div className="p-4 flex justify-center gap-2">
                                {Array.from({ length: refunds.last_page }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={page === refunds.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get('/accounting/refunds', { ...filters, page }, { preserveState: true, preserveScroll: true, replace: true })}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Approve / Reject Dialog */}
            <Dialog open={!!actionRefund} onOpenChange={open => !open && setActionRefund(null)}>
                <DialogContent className="max-w-md">
                    <form onSubmit={submitAction}>
                        <DialogHeader>
                            <DialogTitle>
                                {actionType === 'approve' ? 'Approve' : 'Reject'} Request
                            </DialogTitle>
                            <DialogDescription>
                                {actionRefund && (
                                    <>
                                        <strong>{actionRefund.student.full_name}</strong> — {actionRefund.type} of {formatCurrency(actionRefund.amount)}
                                        <br />
                                        <span className="text-xs">Reason: {actionRefund.reason}</span>
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Label className="mb-1 block">
                                {actionType === 'approve' ? 'Notes (optional)' : 'Rejection Reason *'}
                            </Label>
                            <Textarea
                                value={notesForm.data.accounting_notes}
                                onChange={e => notesForm.setData('accounting_notes', e.target.value)}
                                placeholder={actionType === 'approve' ? 'Add any notes for the student...' : 'Explain why this request is rejected...'}
                                rows={3}
                                required={actionType === 'reject'}
                            />
                            {notesForm.errors.accounting_notes && (
                                <p className="text-sm text-destructive mt-1">{notesForm.errors.accounting_notes}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setActionRefund(null)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={notesForm.processing}
                                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                                variant={actionType === 'reject' ? 'destructive' : 'default'}
                            >
                                {notesForm.processing ? 'Processing...' : actionType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Refund Request Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={open => !open && resetCreateForm()}>
                <DialogContent className="max-w-lg">
                    <form onSubmit={submitCreateForm}>
                        <DialogHeader>
                            <DialogTitle>Create Refund / Void Request</DialogTitle>
                            <DialogDescription>
                                Create a refund or void request for a walk-in student.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Student Search */}
                            {!selectedStudent ? (
                                <div className="space-y-2">
                                    <Label>Search Student</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-9"
                                            placeholder="Search by name or LRN..."
                                            value={studentSearch}
                                            onChange={e => handleStudentSearch(e.target.value)}
                                        />
                                        {searching && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                    {studentResults.length > 0 && (
                                        <div className="border rounded-md max-h-48 overflow-y-auto">
                                            {studentResults.map(student => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center border-b last:border-b-0"
                                                    onClick={() => selectStudent(student)}
                                                >
                                                    <div>
                                                        <p className="font-medium text-sm">{student.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{student.lrn}</p>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{student.program} - {student.year_level}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                                        <div>
                                            <p className="font-medium">{selectedStudent.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedStudent.lrn} • {selectedStudent.program} - {selectedStudent.year_level}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedStudent(null); setSelectedFee(null); }}>
                                            Change
                                        </Button>
                                    </div>

                                    {/* Fee Selection */}
                                    <div className="space-y-2">
                                        <Label>Select Fee Record</Label>
                                        {selectedStudent.fees.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No fee records found for this student.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedStudent.fees.map(fee => (
                                                    <button
                                                        key={fee.id}
                                                        type="button"
                                                        className={`w-full text-left p-3 rounded-md border transition-colors ${
                                                            selectedFee?.id === fee.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                                                        }`}
                                                        onClick={() => selectFee(fee)}
                                                    >
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-sm">{fee.school_year}</span>
                                                            <span className="text-sm">Paid: {formatCurrency(fee.total_paid)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                            <span>Total: {formatCurrency(fee.total_amount)}</span>
                                                            <span>Balance: {formatCurrency(fee.balance)}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {selectedFee && (
                                        <>
                                            {/* Type */}
                                            <div className="space-y-2">
                                                <Label>Request Type</Label>
                                                <Select
                                                    value={createForm.data.type}
                                                    onValueChange={v => createForm.setData('type', v as 'refund' | 'void')}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="refund">Refund</SelectItem>
                                                        <SelectItem value="void">Void</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Amount */}
                                            <div className="space-y-2">
                                                <Label>Amount</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    max={selectedFee.total_paid}
                                                    value={createForm.data.amount}
                                                    onChange={e => createForm.setData('amount', e.target.value)}
                                                    placeholder="Enter amount"
                                                />
                                                {createForm.data.type === 'refund' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Maximum refundable: {formatCurrency(selectedFee.total_paid)}
                                                    </p>
                                                )}
                                                {createForm.errors.amount && (
                                                    <p className="text-sm text-destructive">{createForm.errors.amount}</p>
                                                )}
                                            </div>

                                            {/* Reason */}
                                            <div className="space-y-2">
                                                <Label>Reason</Label>
                                                <Textarea
                                                    value={createForm.data.reason}
                                                    onChange={e => createForm.setData('reason', e.target.value)}
                                                    placeholder="Explain the reason for this request..."
                                                    rows={3}
                                                    required
                                                />
                                                {createForm.errors.reason && (
                                                    <p className="text-sm text-destructive">{createForm.errors.reason}</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={resetCreateForm}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing || !selectedFee || !createForm.data.amount || !createForm.data.reason}
                            >
                                {createForm.processing ? 'Creating...' : 'Create Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AccountingLayout>
    );
}
