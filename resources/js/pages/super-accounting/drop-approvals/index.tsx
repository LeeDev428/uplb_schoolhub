import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Ban,
    CheckCircle2,
    Clock,
    DollarSign,
    Search,
    ThumbsDown,
    ThumbsUp,
    UserMinus,
    UserX,
    XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import SuperAccountingLayout from '@/layouts/super-accounting/super-accounting-layout';

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
    status: string;
    registrar_status: string;
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

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function DropApprovals({ requests, stats, tab, filters }: Props) {
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
            '/super-accounting/drop-approvals',
            { tab: newTab, search: filters.search },
            { preserveState: true, replace: true },
        );
    };

    const handleSearch = () => {
        router.get(
            '/super-accounting/drop-approvals',
            { tab: activeTab, search },
            { preserveState: true, replace: true },
        );
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        approveForm.post(`/super-accounting/drop-approvals/${selectedRequest.id}/approve`, {
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
        rejectForm.post(`/super-accounting/drop-approvals/${selectedRequest.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedRequest(null);
                rejectForm.reset();
            },
        });
    };

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    return (
        <SuperAccountingLayout>
            <Head title="Drop Request Approvals" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Drop Request Approvals"
                    description="Verify payment and approve student drop requests (from Registrar-approved requests)"
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting payment & approval</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Students dropped & deactivated</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Payment issues</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserMinus className="h-5 w-5" />
                            Registrar-Approved Drop Requests
                        </CardTitle>
                        <CardDescription>
                            Verify payment and approve drop requests that have been cleared by the Registrar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name, LRN, or email..."
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
                                                <TableHead>Program / Year</TableHead>
                                                <TableHead>School Year</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Fee Items</TableHead>
                                                <TableHead className="text-right">Total Fee</TableHead>
                                                <TableHead>Registrar</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.map((req) => {
                                                const config = statusConfig[req.accounting_status];
                                                const Icon = config?.icon || Clock;
                                                return (
                                                    <TableRow key={req.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={req.student.student_photo_url || undefined} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {getInitials(req.student.full_name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{req.student.full_name}</p>
                                                                    <p className="text-sm text-muted-foreground">{req.student.lrn}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>{req.student.program || '—'}</div>
                                                                <div className="text-muted-foreground">
                                                                    {[req.student.year_level, req.student.section].filter(Boolean).join(' - ') || '—'}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>{req.school_year || '—'}</div>
                                                                <div className="text-muted-foreground">{req.semester || '—'}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[150px]">
                                                            <p className="truncate text-sm" title={req.reason}>{req.reason}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            {req.fee_items.length > 0 ? (
                                                                <div className="space-y-0.5">
                                                                    {req.fee_items.map((fi) => (
                                                                        <div key={fi.id} className="text-xs">
                                                                            {fi.name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {req.fee_amount > 0 ? formatCurrency(req.fee_amount) : '—'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs">
                                                                <span className="text-green-600">Approved</span>
                                                                <p className="text-muted-foreground">{req.registrar_approved_at}</p>
                                                                <p className="text-muted-foreground">{req.registrar_approved_by?.name}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={config?.color || 'bg-gray-100'}>
                                                                <Icon className="h-3 w-3 mr-1" />
                                                                {req.accounting_status}
                                                            </Badge>
                                                            {req.is_paid && (
                                                                <Badge className="ml-1 bg-blue-100 text-blue-800">
                                                                    <DollarSign className="h-3 w-3" />
                                                                    Paid
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {req.accounting_status === 'pending' ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-green-600 hover:text-green-700"
                                                                        onClick={() => {
                                                                            setSelectedRequest(req);
                                                                            approveForm.setData('or_number', req.or_number || '');
                                                                            setShowApproveModal(true);
                                                                        }}
                                                                    >
                                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700"
                                                                        onClick={() => {
                                                                            setSelectedRequest(req);
                                                                            setShowRejectModal(true);
                                                                        }}
                                                                    >
                                                                        <ThumbsDown className="h-4 w-4 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {req.accounting_approved_at}
                                                                    {req.accounting_remarks && (
                                                                        <p className="text-xs truncate max-w-[120px]" title={req.accounting_remarks}>
                                                                            {req.accounting_remarks}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
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
                                Verify payment and finalize the drop request. This will mark the student as dropped and deactivate their account.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRequest.student.lrn} &bull;{' '}
                                        {selectedRequest.student.program || 'N/A'} &bull;{' '}
                                        {selectedRequest.student.year_level || 'N/A'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Reason: {selectedRequest.reason}
                                    </p>
                                    {selectedRequest.fee_items.length > 0 && (
                                        <div className="border-t pt-2 mt-2 space-y-1">
                                            <span className="text-xs font-medium uppercase text-muted-foreground">Fee Items</span>
                                            {selectedRequest.fee_items.map((fi) => (
                                                <div key={fi.id} className="flex justify-between text-sm">
                                                    <span>{fi.name}</span>
                                                    <span className="font-medium">{formatCurrency(fi.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between font-bold pt-1 border-t">
                                                <span>Total</span>
                                                <span>{formatCurrency(selectedRequest.fee_amount)}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedRequest.registrar_remarks && (
                                        <p className="text-sm text-muted-foreground italic">
                                            Registrar Notes: {selectedRequest.registrar_remarks}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="or_number">Official Receipt Number</Label>
                                    <Input
                                        id="or_number"
                                        placeholder="Enter OR number..."
                                        value={approveForm.data.or_number}
                                        onChange={(e) => approveForm.setData('or_number', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the official receipt number if payment was made at the cashier
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="approve_remarks">Remarks (Optional)</Label>
                                    <Textarea
                                        id="approve_remarks"
                                        placeholder="Add any remarks..."
                                        value={approveForm.data.accounting_remarks}
                                        onChange={(e) => approveForm.setData('accounting_remarks', e.target.value)}
                                        rows={3}
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
                                <Ban className="h-5 w-5 text-red-500" />
                                Reject Drop Request
                            </DialogTitle>
                            <DialogDescription>
                                Reject this drop request due to payment issues or other concerns.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRequest.student.lrn} &bull; {selectedRequest.reason}
                                    </p>
                                    {selectedRequest.fee_amount > 0 && (
                                        <p className="text-sm font-medium mt-2">
                                            Total Fee: {formatCurrency(selectedRequest.fee_amount)}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reject_remarks">Reason for Rejection *</Label>
                                    <Textarea
                                        id="reject_remarks"
                                        placeholder="e.g., Payment not received, insufficient amount..."
                                        value={rejectForm.data.accounting_remarks}
                                        onChange={(e) => rejectForm.setData('accounting_remarks', e.target.value)}
                                        rows={3}
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
        </SuperAccountingLayout>
    );
}
