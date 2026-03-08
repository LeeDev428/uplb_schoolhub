import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Search,
    ThumbsDown,
    ThumbsUp,
    UserX,
    XCircle,
    DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';

type Student = {
    id: number;
    full_name: string;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    student_photo_url: string | null;
    enrollment_status: string;
    classification: string | null;
};

type FeeItemInfo = {
    id: number;
    name: string;
    amount: number;
};

type ApprovedBy = {
    id: number;
    name: string;
};

type DropRequest = {
    id: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    registrar_status: 'pending' | 'approved' | 'rejected';
    accounting_status: 'pending' | 'approved' | 'rejected';
    semester: string | null;
    school_year: string | null;
    registrar_remarks: string | null;
    accounting_remarks: string | null;
    fee_amount: number;
    is_paid: boolean;
    or_number: string | null;
    registrar_approved_by: ApprovedBy | null;
    registrar_approved_at: string | null;
    accounting_approved_by: ApprovedBy | null;
    accounting_approved_at: string | null;
    created_at: string;
    fee_items: FeeItemInfo[];
    student: Student;
};

type PaginatedRequests = {
    data: DropRequest[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Stats = {
    pending: number;
    approved: number;
    rejected: number;
};

type Props = {
    requests: PaginatedRequests;
    stats: Stats;
    tab: string;
    filters: {
        search?: string;
    };
};

const formatCurrency = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

// 3-step status indicator
const ApprovalFlow = ({ registrar_status, accounting_status }: { registrar_status: string; accounting_status: string }) => {
    const steps = [
        { label: 'Submitted', done: true },
        { label: 'Registrar', done: registrar_status === 'approved', rejected: registrar_status === 'rejected' },
        { label: 'Accounting', done: accounting_status === 'approved', rejected: accounting_status === 'rejected' },
    ];
    return (
        <div className="flex items-center gap-1">
            {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-1">
                    <div className={`flex flex-col items-center`}>
                        <div className={`h-3 w-3 rounded-full ${
                            step.rejected ? 'bg-red-500' :
                            step.done ? 'bg-green-500' :
                            'bg-gray-300'
                        }`} />
                        <span className="text-[10px] text-muted-foreground mt-0.5">{step.label}</span>
                    </div>
                    {i < steps.length - 1 && <div className="h-0.5 w-4 bg-gray-300 mb-3" />}
                </div>
            ))}
        </div>
    );
};

export default function AccountingDropRequests({ requests, stats, tab, filters }: Props) {
    const [activeTab, setActiveTab] = useState(tab);
    const [selectedRequest, setSelectedRequest] = useState<DropRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const approveForm = useForm({
        accounting_remarks: '',
        or_number: '',
    });

    const rejectForm = useForm({
        accounting_remarks: '',
    });

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.get(
            '/accounting/drop-requests',
            { tab: newTab, search: filters.search },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = () => {
        router.get(
            '/accounting/drop-requests',
            { tab: activeTab, search },
            { preserveState: true, replace: true }
        );
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        approveForm.post(`/accounting/drop-requests/${selectedRequest.id}/approve`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Drop request approved. Student is now officially dropped.');
                setShowApproveModal(false);
                setSelectedRequest(null);
                approveForm.reset();
            },
        });
    };

    const handleReject = () => {
        if (!selectedRequest) return;
        rejectForm.post(`/accounting/drop-requests/${selectedRequest.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Drop request rejected.');
                setShowRejectModal(false);
                setSelectedRequest(null);
                rejectForm.reset();
            },
        });
    };

    return (
        <AccountingLayout>
            <Head title="Drop Requests" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Drop Request Approvals"
                    description="Final accounting approval for student drop requests (Registrar-approved)"
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting accounting approval</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Students officially dropped</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5" />
                            Registrar-Approved Drop Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name or LRN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleSearch}>Search</Button>
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList>
                                <TabsTrigger value="pending" className="flex gap-2">
                                    <Clock className="h-4 w-4" />
                                    Pending
                                    {stats.pending > 0 && (
                                        <Badge variant="secondary">{stats.pending}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="approved" className="flex gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approved
                                </TabsTrigger>
                                <TabsTrigger value="rejected" className="flex gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Rejected
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="mt-4">
                                {requests.data.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No {activeTab} drop requests found.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Fees</TableHead>
                                                <TableHead>Flow</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.map((request) => (
                                                <TableRow key={request.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={request.student.student_photo_url ?? undefined} />
                                                                <AvatarFallback className="text-xs">
                                                                    {request.student.full_name.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <Link href={`/accounting/payments/process/${request.student.id}`} className="font-medium text-sm hover:underline text-primary">
                                                                    {request.student.full_name}
                                                                </Link>
                                                                <p className="text-xs text-muted-foreground">{request.student.lrn}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {request.student.program} {request.student.year_level}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm max-w-[200px] truncate" title={request.reason}>
                                                            {request.reason}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <p>{request.semester}</p>
                                                            <p className="text-muted-foreground">{request.school_year}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {request.fee_amount > 0 ? (
                                                                <>
                                                                    <p className="font-medium">{formatCurrency(request.fee_amount)}</p>
                                                                    {request.is_paid && (
                                                                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                                            <DollarSign className="h-3 w-3 mr-0.5" />
                                                                            Paid {request.or_number ? `(${request.or_number})` : ''}
                                                                        </Badge>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-muted-foreground">No fee</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ApprovalFlow
                                                            registrar_status={request.registrar_status}
                                                            accounting_status={request.accounting_status}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={request.accounting_status} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {request.accounting_status === 'pending' ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-green-600 hover:text-green-700"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setShowApproveModal(true);
                                                                    }}
                                                                >
                                                                    <ThumbsUp className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700"
                                                                    onClick={() => {
                                                                        setSelectedRequest(request);
                                                                        setShowRejectModal(true);
                                                                    }}
                                                                >
                                                                    <ThumbsDown className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground text-right">
                                                                <p>{request.accounting_approved_at}</p>
                                                                {request.accounting_approved_by && (
                                                                    <p className="text-xs">{request.accounting_approved_by.name}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {/* Pagination */}
                                {requests.last_page > 1 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        {requests.links.map((link, i) => (
                                            <Button
                                                key={i}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Approve Modal */}
                <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Approve Drop Request
                            </DialogTitle>
                            <DialogDescription>
                                Final accounting approval. The student will be officially marked as dropped.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg space-y-1">
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">LRN: {selectedRequest.student.lrn}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.student.program} {selectedRequest.student.year_level}</p>
                                    <p className="text-sm">Reason: {selectedRequest.reason}</p>
                                    {selectedRequest.fee_amount > 0 && (
                                        <p className="text-sm font-medium">Fee: {formatCurrency(selectedRequest.fee_amount)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="or_number">OR Number (Optional)</Label>
                                    <Input
                                        id="or_number"
                                        placeholder="Official Receipt Number..."
                                        value={approveForm.data.or_number}
                                        onChange={(e) => approveForm.setData('or_number', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accounting_remarks">Remarks (Optional)</Label>
                                    <Textarea
                                        id="accounting_remarks"
                                        placeholder="Add any remarks..."
                                        value={approveForm.data.accounting_remarks}
                                        onChange={(e) => approveForm.setData('accounting_remarks', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleApprove} disabled={approveForm.processing}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve & Drop Student
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject Modal */}
                <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                Reject Drop Request
                            </DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting this drop request.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.student.program} {selectedRequest.student.year_level}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reject-remarks">Reason for Rejection *</Label>
                                    <Textarea
                                        id="reject-remarks"
                                        placeholder="Explain why this drop request is being rejected..."
                                        value={rejectForm.data.accounting_remarks}
                                        onChange={(e) => rejectForm.setData('accounting_remarks', e.target.value)}
                                        required
                                    />
                                    {rejectForm.errors.accounting_remarks && (
                                        <p className="text-sm text-red-500">{rejectForm.errors.accounting_remarks}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={rejectForm.processing || !rejectForm.data.accounting_remarks}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AccountingLayout>
    );
}
