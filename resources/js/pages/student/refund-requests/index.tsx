import { Head, useForm } from '@inertiajs/react';
import { Clock, CheckCircle2, XCircle, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import StudentLayout from '@/layouts/student/student-layout';
import { useState } from 'react';

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
};

export default function RefundRequestsIndex({ requests, studentFees }: Props) {
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
                setIsOpen(false);
                form.reset();
            },
        });
    };

    const formatCurrency = (val: number) =>
        `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const statusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 border border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800 border border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:         return <Badge className="bg-amber-100 text-amber-800 border border-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        }
    };

    return (
        <StudentLayout>
            <Head title="Refund / Void Requests" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Refund / Void Requests</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Request a refund or void for your payments. Accounting will review your request.
                        </p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={studentFees.length === 0}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Submit Refund / Void Request</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below. Accounting will review and process your request.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Request Type *</Label>
                                        <Select
                                            value={form.data.type}
                                            onValueChange={(v) => form.setData('type', v as 'refund' | 'void')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="refund">Refund — Money returned to me</SelectItem>
                                                <SelectItem value="void">Void — Cancel / reverse a payment</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.type && <p className="text-sm text-destructive">{form.errors.type}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>School Year / Fee Record *</Label>
                                        <Select
                                            value={form.data.student_fee_id}
                                            onValueChange={(v) => {
                                                form.setData('student_fee_id', v);
                                                const fee = studentFees.find(f => f.id.toString() === v);
                                                if (fee) form.setData('amount', fee.total_paid.toString());
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select fee record" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {studentFees.map(fee => (
                                                    <SelectItem key={fee.id} value={fee.id.toString()}>
                                                        {fee.school_year} — Paid: {formatCurrency(fee.total_paid)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedFee && (
                                            <p className="text-xs text-muted-foreground">
                                                Max refundable: {formatCurrency(selectedFee.total_paid)}
                                            </p>
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
                                        {form.errors.amount && <p className="text-sm text-destructive">{form.errors.amount}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Reason *</Label>
                                        <Textarea
                                            value={form.data.reason}
                                            onChange={e => form.setData('reason', e.target.value)}
                                            placeholder="Explain why you are requesting this refund/void..."
                                            rows={3}
                                        />
                                        {form.errors.reason && <p className="text-sm text-destructive">{form.errors.reason}</p>}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Submitting...' : 'Submit Request'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {studentFees.length === 0 && (
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="pt-4">
                            <p className="text-sm text-amber-800">
                                You have no payment records yet. Refund requests are only available after a payment has been made.
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
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No refund/void requests yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell className="text-sm">{r.created_at}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {r.type === 'void' ? <RefreshCw className="h-3 w-3 mr-1" /> : null}
                                                    {r.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{r.school_year || '—'}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(r.amount)}</TableCell>
                                            <TableCell className="text-sm max-w-[200px] truncate">{r.reason}</TableCell>
                                            <TableCell>{statusBadge(r.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {r.accounting_notes || (r.status === 'pending' ? 'Awaiting review' : '—')}
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
