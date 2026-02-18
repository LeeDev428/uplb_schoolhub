import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    FileText,
    Check,
    X,
    Filter,
    User,
} from 'lucide-react';
import { FilterBar } from '@/components/filters/filter-bar';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';

interface PromissoryNote {
    id: number;
    student_name: string;
    student_id: number;
    submitted_date: string;
    due_date: string;
    amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'declined';
    reviewed_by: string | null;
    reviewed_at: string | null;
    review_notes: string | null;
    school_year: string;
}

interface PaginatedNotes {
    data: PromissoryNote[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    pending: number;
    approved: number;
    total: number;
}

interface Filters {
    status: string;
}

interface Props {
    notes: PaginatedNotes;
    stats: Stats;
    filters: Filters;
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

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-700',
    },
    declined: {
        label: 'Declined',
        icon: XCircle,
        color: 'bg-red-100 text-red-700',
    },
};

export default function PromissoryNotesIndex({ notes, stats, filters }: Props) {
    const [selectedNote, setSelectedNote] = useState<PromissoryNote | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const approveForm = useForm({
        notes: '',
    });

    const declineForm = useForm({
        notes: '',
    });

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        router.get('/accounting/promissory-notes', {
            status: value !== 'all' ? value : undefined,
        }, {
            preserveState: true,
        });
    };

    const openApproveDialog = (note: PromissoryNote) => {
        setSelectedNote(note);
        approveForm.reset();
        setIsApproveDialogOpen(true);
    };

    const openDeclineDialog = (note: PromissoryNote) => {
        setSelectedNote(note);
        declineForm.reset();
        setIsDeclineDialogOpen(true);
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedNote) {
            approveForm.post(`/accounting/promissory-notes/${selectedNote.id}/approve`, {
                onSuccess: () => {
                    setIsApproveDialogOpen(false);
                    setSelectedNote(null);
                },
            });
        }
    };

    const handleDecline = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedNote) {
            declineForm.post(`/accounting/promissory-notes/${selectedNote.id}/decline`, {
                onSuccess: () => {
                    setIsDeclineDialogOpen(false);
                    setSelectedNote(null);
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    return (
        <AccountingLayout>
            <Head title="Promissory Notes" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Promissory Notes"
                    description="Review and manage student promissory note requests"
                />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">
                                Active promissory notes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                All time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <FilterBar>
                    <FilterDropdown
                        label="Status"
                        value={statusFilter}
                        onValueChange={handleStatusFilter}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'declined', label: 'Declined' },
                        ]}
                    />
                </FilterBar>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No promissory notes found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notes.data.map((note) => (
                                        <TableRow key={note.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{note.student_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{note.school_year}</TableCell>
                                            <TableCell>{formatDate(note.submitted_date)}</TableCell>
                                            <TableCell>{formatDate(note.due_date)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(note.amount)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(note.status)}</TableCell>
                                            <TableCell className="text-right">
                                                {note.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-8"
                                                            onClick={() => openApproveDialog(note)}
                                                        >
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => openDeclineDialog(note)}
                                                        >
                                                            <X className="h-3 w-3 mr-1" />
                                                            Decline
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        {note.reviewed_by && `by ${note.reviewed_by}`}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Approve Dialog */}
                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleApprove}>
                            <DialogHeader>
                                <DialogTitle>Approve Promissory Note</DialogTitle>
                                <DialogDescription>
                                    Approve the promissory note request from {selectedNote?.student_name}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedNote && (
                                <div className="py-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Amount:</span>
                                            <span className="ml-2 font-medium">{formatCurrency(selectedNote.amount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Due Date:</span>
                                            <span className="ml-2 font-medium">{formatDate(selectedNote.due_date)}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-1">Reason:</p>
                                        <p className="text-sm text-muted-foreground">{selectedNote.reason}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes (Optional)</Label>
                                        <Textarea
                                            value={approveForm.data.notes}
                                            onChange={(e) => approveForm.setData('notes', e.target.value)}
                                            placeholder="Add any notes for this approval..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={approveForm.processing}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Decline Dialog */}
                <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleDecline}>
                            <DialogHeader>
                                <DialogTitle>Decline Promissory Note</DialogTitle>
                                <DialogDescription>
                                    Decline the promissory note request from {selectedNote?.student_name}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedNote && (
                                <div className="py-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Amount:</span>
                                            <span className="ml-2 font-medium">{formatCurrency(selectedNote.amount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Due Date:</span>
                                            <span className="ml-2 font-medium">{formatDate(selectedNote.due_date)}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-1">Reason:</p>
                                        <p className="text-sm text-muted-foreground">{selectedNote.reason}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reason for Declining</Label>
                                        <Textarea
                                            value={declineForm.data.notes}
                                            onChange={(e) => declineForm.setData('notes', e.target.value)}
                                            placeholder="Explain why this request is being declined..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="destructive" disabled={declineForm.processing}>
                                    <X className="h-4 w-4 mr-2" />
                                    Decline
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AccountingLayout>
    );
}
