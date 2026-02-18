import { Head, useForm, router } from '@inertiajs/react';
import { Clock, CheckCircle2, XCircle, Plus, FileText, AlertTriangle, Trash2 } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StudentLayout from '@/layouts/student/student-layout';
import { useState } from 'react';

type PromissoryNote = {
    id: number;
    student_fee_id: number | null;
    submitted_date: string;
    due_date: string;
    amount: number | null;
    reason: string;
    status: 'pending' | 'approved' | 'declined';
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_notes: string | null;
    school_year: string | null;
};

type StudentFee = {
    id: number;
    school_year: string;
    total_amount: number;
    balance: number;
};

type Stats = {
    total: number;
    pending: number;
    approved: number;
    declined: number;
};

type Props = {
    notes: PromissoryNote[];
    studentFees: StudentFee[];
    stats: Stats;
};

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        variant: 'secondary' as const,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle2,
        variant: 'default' as const,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
    },
    declined: {
        label: 'Declined',
        icon: XCircle,
        variant: 'destructive' as const,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
    },
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

export default function PromissoryNotes({ notes, studentFees, stats }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState<string>('');

    const form = useForm({
        student_fee_id: '',
        amount: '',
        due_date: '',
        reason: '',
    });

    const selectedFee = studentFees.find(f => f.id.toString() === selectedFeeId);

    const handleFeeChange = (value: string) => {
        setSelectedFeeId(value === 'general' ? '' : value);
        form.setData('student_fee_id', value === 'general' ? '' : value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/student/promissory-notes', {
            onSuccess: () => {
                setIsDialogOpen(false);
                form.reset();
                setSelectedFeeId('');
            },
        });
    };

    const handleCancel = (noteId: number) => {
        router.delete(`/student/promissory-notes/${noteId}/cancel`);
    };

    return (
        <StudentLayout>
            <Head title="Promissory Notes" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Promissory Notes</h1>
                        <p className="text-muted-foreground">
                            Request and track your payment extensions
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Request Payment Extension
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Request Payment Extension</DialogTitle>
                                <DialogDescription>
                                    Submit a request for a payment extension. This allows accounting to give you more time to settle your fees.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fee">Select Fee (Optional)</Label>
                                            <Select
                                                value={form.data.student_fee_id || 'general'}
                                                onValueChange={handleFeeChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="General request (all fees)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="general">General request (all fees)</SelectItem>
                                                    {studentFees.map((fee) => (
                                                        <SelectItem key={fee.id} value={fee.id.toString()}>
                                                            {fee.school_year} - Balance: {formatCurrency(fee.balance)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Leave blank for a general extension request
                                            </p>
                                            {form.errors.student_fee_id && (
                                                <p className="text-sm text-red-500">{form.errors.student_fee_id}</p>
                                            )}
                                        </div>

                                        {selectedFee && (
                                            <div className="p-3 bg-muted rounded-lg text-sm">
                                                <div className="flex justify-between">
                                                    <span>Total Fee:</span>
                                                    <span className="font-medium">{formatCurrency(selectedFee.total_amount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Remaining Balance:</span>
                                                    <span className="font-medium text-red-600">{formatCurrency(selectedFee.balance)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount to Cover (Optional)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={selectedFee?.balance}
                                                value={form.data.amount}
                                                onChange={(e) => form.setData('amount', e.target.value)}
                                                placeholder="Leave blank for full balance"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Specify an amount or leave blank for full balance extension
                                            </p>
                                            {form.errors.amount && (
                                                <p className="text-sm text-red-500">{form.errors.amount}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="due_date">Proposed Payment Date</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={form.data.due_date}
                                                onChange={(e) => form.setData('due_date', e.target.value)}
                                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                            />
                                            {form.errors.due_date && (
                                                <p className="text-sm text-red-500">{form.errors.due_date}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Reason / Justification</Label>
                                            <Textarea
                                                id="reason"
                                                rows={3}
                                                value={form.data.reason}
                                                onChange={(e) => form.setData('reason', e.target.value)}
                                                placeholder="Explain why you need a promissory note..."
                                            />
                                            {form.errors.reason && (
                                                <p className="text-sm text-red-500">{form.errors.reason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={form.processing}>
                                            Submit Request
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Declined</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.declined}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* No Outstanding Fees Message */}
                {studentFees.length === 0 && notes.length === 0 && (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                            <h3 className="mt-4 text-lg font-semibold">No Outstanding Fees</h3>
                            <p className="mt-2 text-muted-foreground">
                                You don't have any outstanding fees that require a promissory note.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Notes Table */}
                {notes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Promissory Notes</CardTitle>
                            <CardDescription>
                                View the status of your promissory note requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>School Year</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reviewer Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {notes.map((note) => {
                                        const config = statusConfig[note.status];
                                        const StatusIcon = config.icon;
                                        
                                        return (
                                            <TableRow key={note.id}>
                                                <TableCell className="font-medium">
                                                    {note.school_year || 'General Request'}
                                                </TableCell>
                                                <TableCell>
                                                    {note.amount !== null ? formatCurrency(note.amount) : 'Full Balance'}
                                                </TableCell>
                                                <TableCell>{note.submitted_date}</TableCell>
                                                <TableCell>{note.due_date}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={config.variant}
                                                        className={`${config.bgColor} ${config.textColor}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {config.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {note.review_notes ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            {note.review_notes}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {note.status === 'pending' && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to cancel this promissory note request?
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleCancel(note.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Yes, cancel
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                            Important Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>
                            • A promissory note is a formal agreement to pay a specified amount by a certain date.
                        </p>
                        <p>
                            • Once approved, you are legally obligated to pay the amount by the due date.
                        </p>
                        <p>
                            • Failure to honor a promissory note may result in additional penalties or academic holds.
                        </p>
                        <p>
                            • You can only have one pending promissory note per fee at a time.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
