import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Eye,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    User,
    FileText,
    Plus,
    Loader2,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperAccountingLayout from '@/layouts/super-accounting/super-accounting-layout';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
    program: string;
    year_level: string;
}

interface StudentFee {
    id: number;
    school_year: string;
    total_amount: number;
    total_paid: number;
    balance: number;
}

interface StudentWithFees {
    id: number;
    full_name: string;
    lrn: string;
    program: string;
    year_level: string;
    fees: StudentFee[];
}

interface RefundRequest {
    id: number;
    student: Student;
    amount: string;
    reason: string;
    payment_method: string;
    account_details: string | null;
    receipt_path: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    processed_by: { name: string } | null;
    processed_at: string | null;
    created_at: string;
}

interface Props {
    refunds: {
        data: RefundRequest[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        pending: number;
        approved: number;
        rejected: number;
    };
    tab: string;
    filters: {
        search?: string;
    };
}

const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusConfig = {
    pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock,
    },
    approved: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle2,
    },
    rejected: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
    },
};

export default function RefundRequests({ refunds, stats, tab, filters }: Props) {
    const [activeTab, setActiveTab] = useState(tab || 'pending');
    const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    // Create refund request state
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');
    const [studentResults, setStudentResults] = useState<StudentWithFees[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
    const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
    const [searching, setSearching] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const approveForm = useForm({
        notes: '',
    });

    const rejectForm = useForm({
        notes: '',
    });

    const createForm = useForm({
        student_id: 0,
        student_fee_id: 0,
        type: 'refund' as 'refund' | 'void',
        amount: '',
        reason: '',
    });

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.get(
            '/super-accounting/refunds',
            { tab: newTab, search: filters.search },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = () => {
        router.get(
            '/super-accounting/refunds',
            { tab: activeTab, search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        approveForm.post(`/super-accounting/refunds/${selectedRequest.id}/approve`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedRequest(null);
                approveForm.reset();
            },
        });
    };

    const handleReject = () => {
        if (!selectedRequest) return;
        rejectForm.post(`/super-accounting/refunds/${selectedRequest.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedRequest(null);
                rejectForm.reset();
            },
        });
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
                const response = await fetch(`/super-accounting/refunds/search-students?search=${encodeURIComponent(value)}`);
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
        createForm.post('/super-accounting/refunds', {
            onSuccess: () => resetCreateForm(),
        });
    };

    const renderRefundTable = (data: RefundRequest[], showActions: boolean = false) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Requested</TableHead>
                    {!showActions && <TableHead>Processed By</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={showActions ? 6 : 7} className="text-center py-8">
                            <div className="flex flex-col items-center text-muted-foreground">
                                <RotateCcw className="h-8 w-8 mb-2" />
                                <p>No refund requests found</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((request) => (
                        <TableRow key={request.id}>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{request.student.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{request.student.lrn}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {request.student.program} - {request.student.year_level}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">
                                {formatCurrency(request.amount)}
                            </TableCell>
                            <TableCell>
                                <span className="line-clamp-2 max-w-[200px]">{request.reason}</span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{request.payment_method}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(request.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            {!showActions && (
                                <TableCell>
                                    {request.processed_by ? (
                                        <div>
                                            <p className="text-sm">{request.processed_by.name}</p>
                                            {request.processed_at && (
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(request.processed_at), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                            )}
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setSelectedRequest(request);
                                            setShowDetailsModal(true);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {showActions && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-600 hover:text-green-700"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowApproveModal(true);
                                                }}
                                            >
                                                <ThumbsUp className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowRejectModal(true);
                                                }}
                                            >
                                                <ThumbsDown className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    const renderPagination = () => (
        <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
                Showing {refunds.data.length} of {refunds.total} results
            </p>
            <div className="flex gap-1">
                {refunds.links.map((link, index) => (
                    <Button
                        key={index}
                        size="sm"
                        variant={link.active ? 'default' : 'outline'}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <SuperAccountingLayout>
            <Head title="Refund Requests" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Refund Requests"
                        description="Review and process student refund requests"
                    />
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Request
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Processed successfully</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Did not qualify</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name or LRN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs with Tables */}
                <Card>
                    <CardContent className="pt-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="pending" className="gap-2">
                                    <Clock className="h-4 w-4" />
                                    Pending
                                    {stats.pending > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {stats.pending}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="approved" className="gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approved
                                </TabsTrigger>
                                <TabsTrigger value="rejected" className="gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Rejected
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="pending" className="mt-4">
                                {renderRefundTable(refunds.data, true)}
                                {renderPagination()}
                            </TabsContent>

                            <TabsContent value="approved" className="mt-4">
                                {renderRefundTable(refunds.data)}
                                {renderPagination()}
                            </TabsContent>

                            <TabsContent value="rejected" className="mt-4">
                                {renderRefundTable(refunds.data)}
                                {renderPagination()}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Refund Request Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this refund request
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Student</Label>
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.student.lrn}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Program</Label>
                                    <p className="font-medium">{selectedRequest.student.program}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.student.year_level}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Amount</Label>
                                    <p className="font-medium text-lg text-green-600">
                                        {formatCurrency(selectedRequest.amount)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={statusConfig[selectedRequest.status].color}>
                                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Reason</Label>
                                <p className="text-sm">{selectedRequest.reason}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Payment Method</Label>
                                    <p className="font-medium">{selectedRequest.payment_method}</p>
                                </div>
                                {selectedRequest.account_details && (
                                    <div>
                                        <Label className="text-muted-foreground">Account Details</Label>
                                        <p className="font-medium">{selectedRequest.account_details}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Requested On</Label>
                                    <p className="text-sm">
                                        {format(new Date(selectedRequest.created_at), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                                {selectedRequest.processed_at && (
                                    <div>
                                        <Label className="text-muted-foreground">Processed On</Label>
                                        <p className="text-sm">
                                            {format(new Date(selectedRequest.processed_at), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedRequest.admin_notes && (
                                <div>
                                    <Label className="text-muted-foreground">Admin Notes</Label>
                                    <p className="text-sm">{selectedRequest.admin_notes}</p>
                                </div>
                            )}

                            {selectedRequest.receipt_path && (
                                <div>
                                    <Label className="text-muted-foreground">Receipt</Label>
                                    <Button asChild variant="outline" size="sm" className="mt-1">
                                        <a href={selectedRequest.receipt_path} target="_blank" rel="noopener noreferrer">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View Receipt
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Refund Request</DialogTitle>
                        <DialogDescription>
                            Confirm that you want to approve this refund of{' '}
                            <span className="font-medium text-green-600">
                                {selectedRequest && formatCurrency(selectedRequest.amount)}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="approve-notes">Notes (optional)</Label>
                            <Textarea
                                id="approve-notes"
                                placeholder="Add any notes about this approval..."
                                value={approveForm.data.notes}
                                onChange={(e) => approveForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={approveForm.processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {approveForm.processing ? 'Approving...' : 'Approve Refund'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Refund Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this refund request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reject-notes">Reason for Rejection *</Label>
                            <Textarea
                                id="reject-notes"
                                placeholder="Explain why this refund request is being rejected..."
                                value={rejectForm.data.notes}
                                onChange={(e) => rejectForm.setData('notes', e.target.value)}
                                required
                            />
                            {rejectForm.errors.notes && (
                                <p className="text-sm text-red-500 mt-1">{rejectForm.errors.notes}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejectForm.processing || !rejectForm.data.notes}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            {rejectForm.processing ? 'Rejecting...' : 'Reject Request'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Refund Request Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={open => !open && resetCreateForm()}>
                <DialogContent className="max-w-lg">
                    <form onSubmit={submitCreateForm}>
                        <DialogHeader>
                            <DialogTitle>Create Refund / Void Request</DialogTitle>
                            <DialogDescription>
                                Create a refund or void request for a student.
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
        </SuperAccountingLayout>
    );
}
