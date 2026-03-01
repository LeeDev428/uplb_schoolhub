import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Info,
    Plus,
    RefreshCw,
    UserMinus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import StudentLayout from '@/layouts/student/student-layout';

type RefundRequest = {
    id: number;
    type: 'refund' | 'void';
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    accounting_notes: string | null;
    processed_by: string | null;
    processed_at: string | null;
    school_year: string | null;
    created_at: string;
};

type StudentFee = {
    id: number;
    school_year: string;
    total_paid: number;
    balance: number;
};

type Props = {
    requests: RefundRequest[];
    studentFees: StudentFee[];
    canRequestRefund?: boolean;
    dropStatus?: 'none' | 'pending' | 'approved' | 'rejected';
};

const fmt = (val: number) =>
    `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'approved':
            return (
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                </Badge>
            );
        case 'rejected':
            return (
                <Badge className="bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> Rejected
                </Badge>
            );
        default:
            return (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>
            );
    }
};

export default function RefundRequestsIndex({ requests, studentFees, canRequestRefund = true, dropStatus = 'none' }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        student_fee_id: '',
        type: 'refund' as 'refund' | 'void',
        amount: '',
        reason: '',
    });

    const selectedFee = studentFees.find(f => f.id.toString() === form.data.student_fee_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/student/refund-requests', {
            onSuccess: () => {
                toast.success('Changes saved successfully');
                setIsOpen(false);
                form.reset();
            },
        });
    };

    const pending  = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    // Determine why refunds are blocked
    const getRefundBlockReason = () => {
        if (dropStatus === 'none') {
            return {
                title: 'Drop Request Required',
                message: 'You must first submit and have a drop request approved before you can request a refund.',
                action: '/student/drop-request',
                actionLabel: 'Submit Drop Request',
            };
        }
        if (dropStatus === 'pending') {
            return {
                title: 'Drop Request Pending',
                message: 'Your drop request is still being reviewed. You can request a refund once it is approved.',
                action: '/student/drop-request',
                actionLabel: 'View Drop Request Status',
            };
        }
        if (dropStatus === 'rejected') {
            return {
                title: 'Drop Request Rejected',
                message: 'Your previous drop request was rejected. You may submit a new drop request if needed.',
                action: '/student/drop-request',
                actionLabel: 'View Drop Requests',
            };
        }
        return null;
    };

    const blockReason = !canRequestRefund ? getRefundBlockReason() : null;

    return (
        <StudentLayout>
            <Head title="Refund / Void Requests" />

            <div className="space-y-6 p-6">
                {/* Drop Request Required Banner */}
                {blockReason && (
                    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                <UserMinus className="h-5 w-5" />
                                {blockReason.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                {blockReason.message}
                            </p>
                            <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30">
                                <Link href={blockReason.action}>
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    {blockReason.actionLabel}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Refund / Void Requests</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Submit a refund or void request for payments you have made.
                        </p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!canRequestRefund || studentFees.length === 0}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Submit Refund / Void Request</DialogTitle>
                                    <DialogDescription>
                                        Accounting will review your request. Processing may take 3–5 business days.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Request Type *</Label>
                                        <Select
                                            value={form.data.type}
                                            onValueChange={v => form.setData('type', v as 'refund' | 'void')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="refund">Refund — Money returned to me</SelectItem>
                                                <SelectItem value="void">Void — Cancel / reverse a payment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.type && (
                                            <p className="text-sm text-destructive">{form.errors.type}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Fee Record / School Year *</Label>
                                        <Select
                                            value={form.data.student_fee_id}
                                            onValueChange={v => {
                                                form.setData('student_fee_id', v);
                                                const fee = studentFees.find(f => f.id.toString() === v);
                                                if (fee) form.setData('amount', fee.total_paid.toFixed(2));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fee record" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studentFees.map(fee => (
                                                    <SelectItem key={fee.id} value={fee.id.toString()}>
                                                        {fee.school_year} — Paid: {fmt(fee.total_paid)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedFee && (
                                            <p className="text-xs text-muted-foreground">
                                                Max refundable: <strong>{fmt(selectedFee.total_paid)}</strong>
                                            </p>
                                        )}
                                        {form.errors.student_fee_id && (
                                            <p className="text-sm text-destructive">{form.errors.student_fee_id}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Amount *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={selectedFee?.total_paid}
                                            value={form.data.amount}
                                            onChange={e => form.setData('amount', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        {form.errors.amount && (
                                            <p className="text-sm text-destructive">{form.errors.amount}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Reason *</Label>
                                        <Textarea
                                            value={form.data.reason}
                                            onChange={e => form.setData('reason', e.target.value)}
                                            placeholder="Explain why you are requesting this refund/void..."
                                            rows={3}
                                        />
                                        {form.errors.reason && (
                                            <p className="text-sm text-destructive">{form.errors.reason}</p>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Submitting…' : 'Submit Request'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Drop / Withdrawal Warning */}
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-semibold text-red-800 text-sm">
                                    Important Notice — Dropping / Withdrawal
                                </p>
                                <p className="text-sm text-red-700">
                                    Submitting a <strong>Refund</strong> request means you are requesting to be
                                    <strong> dropped or withdrawn</strong> from your enrollment. Your enrollment
                                    status may be updated once accounting processes and approves the request.
                                    Please coordinate with the Registrar’s Office first.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                {requests.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4 flex items-center gap-3">
                                <Clock className="h-7 w-7 text-amber-500" />
                                <div>
                                    <p className="text-xl font-bold">{pending}</p>
                                    <p className="text-xs text-muted-foreground">Pending</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 flex items-center gap-3">
                                <CheckCircle2 className="h-7 w-7 text-green-500" />
                                <div>
                                    <p className="text-xl font-bold">{approved}</p>
                                    <p className="text-xs text-muted-foreground">Approved</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 flex items-center gap-3">
                                <XCircle className="h-7 w-7 text-red-500" />
                                <div>
                                    <p className="text-xl font-bold">{rejected}</p>
                                    <p className="text-xs text-muted-foreground">Rejected</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* No payment notice */}
                {studentFees.length === 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-4 flex gap-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-blue-800">
                                You have no payment records yet. Refund requests are only available after a payment has been recorded.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Requests</CardTitle>
                        <CardDescription>All your submitted refund and void requests</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date Submitted</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Accounting Notes</TableHead>
                                    <TableHead>Processed By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                            No requests submitted yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell className="text-sm whitespace-nowrap">{r.created_at}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize gap-1">
                                                    {r.type === 'void' && <RefreshCw className="h-3 w-3" />}
                                                    {r.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{r.school_year || '—'}</TableCell>
                                            <TableCell className="text-right font-medium">{fmt(r.amount)}</TableCell>
                                            <TableCell className="text-sm max-w-[180px] truncate" title={r.reason}>{r.reason}</TableCell>
                                            <TableCell><StatusBadge status={r.status} /></TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                                                {r.accounting_notes || (r.status === 'pending' ? 'Awaiting review…' : '—')}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {r.processed_at ? r.processed_by : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
