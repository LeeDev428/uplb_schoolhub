import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    CheckCircle2,
    Clock,
    DollarSign,
    Search,
    ThumbsDown,
    ThumbsUp,
    UserX,
    XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import RegistrarLayout from '@/layouts/registrar/registrar-layout';

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

type DropFeeItem = {
    id: number;
    name: string;
    selling_price: number;
    category: string | null;
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
    fee_amount: number;
    is_paid: boolean;
    registrar_approved_by: ApprovedBy | null;
    registrar_approved_at: string | null;
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
    dropFeeItems: DropFeeItem[];
    appSettings: {
        has_k12: boolean;
        has_college: boolean;
    };
};

const formatCurrency = (amount: number) =>
    `\u20B1${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

export default function DropRequestsIndex({ requests, stats, tab, filters, dropFeeItems }: Props) {
    const [activeTab, setActiveTab] = useState(tab);
    const [selectedRequest, setSelectedRequest] = useState<DropRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedFeeItemIds, setSelectedFeeItemIds] = useState<number[]>([]);

    const approveForm = useForm({ registrar_remarks: '', fee_item_ids: [] as number[] });
    const rejectForm = useForm({ registrar_remarks: '' });

    const selectedFeeTotal = useMemo(() => {
        return dropFeeItems
            .filter((fi) => selectedFeeItemIds.includes(fi.id))
            .reduce((sum, fi) => sum + fi.selling_price, 0);
    }, [selectedFeeItemIds, dropFeeItems]);

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.get('/registrar/drop-requests', { tab: newTab, search: filters.search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = () => {
        router.get('/registrar/drop-requests', { tab: activeTab, search }, {
            preserveState: true,
            replace: true,
        });
    };

    const openApproveModal = (request: DropRequest) => {
        setSelectedRequest(request);
        approveForm.reset();
        setSelectedFeeItemIds([]);
        setShowApproveModal(true);
    };

    const toggleFeeItem = (id: number) => {
        setSelectedFeeItemIds((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };

    const openRejectModal = (request: DropRequest) => {
        setSelectedRequest(request);
        rejectForm.reset();
        setShowRejectModal(true);
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        approveForm.transform((data) => ({
            ...data,
            fee_item_ids: selectedFeeItemIds,
        }));
        approveForm.post(`/registrar/drop-requests/${selectedRequest.id}/approve`, {
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedRequest(null);
                setSelectedFeeItemIds([]);
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        rejectForm.post(`/registrar/drop-requests/${selectedRequest.id}/reject`, {
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedRequest(null);
            },
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <RegistrarLayout>
            <Head title="Drop Requests" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Drop Requests</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review student drop requests and assign applicable fees before forwarding to accounting.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleTabChange('pending')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleTabChange('approved')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Forwarded to accounting</p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleTabChange('rejected')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Requests denied</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2">
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
                        <TabsTrigger value="pending">
                            Pending ({stats.pending})
                        </TabsTrigger>
                        <TabsTrigger value="approved">
                            Approved ({stats.approved})
                        </TabsTrigger>
                        <TabsTrigger value="rejected">
                            Rejected ({stats.rejected})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Program / Year</TableHead>
                                            <TableHead>School Year</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Fee</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            {activeTab !== 'pending' && <TableHead>Processed</TableHead>}
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">No {activeTab} drop requests found.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            requests.data.map((req) => (
                                                <TableRow key={req.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={req.student.student_photo_url || undefined} />
                                                                <AvatarFallback>
                                                                    {getInitials(req.student.full_name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{req.student.full_name}</div>
                                                                <div className="text-sm text-muted-foreground">{req.student.lrn}</div>
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
                                                    <TableCell className="max-w-[200px]">
                                                        <p className="truncate text-sm" title={req.reason}>
                                                            {req.reason}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        {req.fee_amount > 0 ? (
                                                            <span className="text-sm font-medium">
                                                                {formatCurrency(req.fee_amount)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">&mdash;</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={req.registrar_status} />
                                                    </TableCell>
                                                    <TableCell className="text-sm">{req.created_at}</TableCell>
                                                    {activeTab !== 'pending' && (
                                                        <TableCell>
                                                            {req.registrar_approved_at ? (
                                                                <div className="text-sm">
                                                                    <div>{req.registrar_approved_at}</div>
                                                                    <div className="text-muted-foreground">{req.registrar_approved_by?.name}</div>
                                                                </div>
                                                            ) : '—'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right">
                                                        {req.registrar_status === 'pending' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 hover:text-green-700"
                                                                    onClick={() => openApproveModal(req)}
                                                                >
                                                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 hover:text-red-700"
                                                                    onClick={() => openRejectModal(req)}
                                                                >
                                                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {req.registrar_status !== 'pending' && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {req.registrar_remarks || '—'}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {requests.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t px-4 py-3">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {requests.from} to {requests.to} of {requests.total}
                                        </div>
                                        <div className="flex gap-1">
                                            {requests.links.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Approve Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="max-w-lg">
                    <form onSubmit={handleApprove}>
                        <DialogHeader>
                            <DialogTitle>Approve Drop Request</DialogTitle>
                            <DialogDescription>
                                Review and approve the drop request for{' '}
                                <strong>{selectedRequest?.student.full_name}</strong>.
                                Select applicable fee items and forward to accounting for final approval.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Fee Items Selection */}
                            {dropFeeItems.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Drop Fee Items</Label>
                                    <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                                        {dropFeeItems.map((item) => (
                                            <label
                                                key={item.id}
                                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={selectedFeeItemIds.includes(item.id)}
                                                    onCheckedChange={() => toggleFeeItem(item.id)}
                                                />
                                                <span className="flex-1 text-sm">{item.name}</span>
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(item.selling_price)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {selectedFeeItemIds.length > 0 && (
                                        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                                            <span className="text-sm font-medium flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                Total Fee:
                                            </span>
                                            <span className="text-sm font-bold">
                                                {formatCurrency(selectedFeeTotal)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="approve_remarks">Remarks (Optional)</Label>
                                <Textarea
                                    id="approve_remarks"
                                    value={approveForm.data.registrar_remarks}
                                    onChange={(e) => approveForm.setData('registrar_remarks', e.target.value)}
                                    placeholder="Add any notes..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowApproveModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={approveForm.processing}>
                                Approve & Forward to Accounting
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <form onSubmit={handleReject}>
                        <DialogHeader>
                            <DialogTitle>Reject Drop Request</DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting the drop request from{' '}
                                <strong>{selectedRequest?.student.full_name}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="reject_remarks">
                                    Reason for Rejection <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="reject_remarks"
                                    value={rejectForm.data.registrar_remarks}
                                    onChange={(e) => rejectForm.setData('registrar_remarks', e.target.value)}
                                    placeholder="Explain why the drop request is being rejected..."
                                    rows={3}
                                    required
                                />
                                {rejectForm.errors.registrar_remarks && (
                                    <p className="text-sm text-destructive">{rejectForm.errors.registrar_remarks}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                Reject Request
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </RegistrarLayout>
    );
}
