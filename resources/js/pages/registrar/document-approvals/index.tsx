import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Search,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Filter,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
    program: string;
    year_level: string;
}

interface DocumentFeeItem {
    name: string;
    category: string;
    price: string;
}

interface DocumentRequest {
    id: number;
    student: Student;
    document_type: string;
    document_type_label: string;
    document_fee_item: DocumentFeeItem | null;
    copies: number;
    purpose: string;
    processing_type: 'normal' | 'rush';
    fee: string;
    total_fee: number;
    receipt_number: string | null;
    receipt_file_path: string | null;
    registrar_status: 'pending' | 'approved' | 'rejected';
    registrar_remarks: string | null;
    registrar_approved_at: string | null;
    accounting_status: 'pending' | 'approved' | 'rejected';
    status: string;
    request_date: string | null;
    created_at: string;
}

interface Props {
    requests: {
        data: DocumentRequest[];
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
    documentTypes: Record<string, string>;
    tab: string;
    filters: {
        search?: string;
        document_type?: string;
    };
}

export default function DocumentApprovals({ requests, stats, documentTypes, tab, filters }: Props) {
    const [activeTab, setActiveTab] = useState(tab);
    const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [documentTypeFilter, setDocumentTypeFilter] = useState(filters.document_type || 'all');

    const approveForm = useForm({
        remarks: '',
    });

    const rejectForm = useForm({
        remarks: '',
    });

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.get(
            '/registrar/document-approvals',
            { tab: newTab, search: filters.search, document_type: filters.document_type },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = () => {
        router.get(
            '/registrar/document-approvals',
            { tab: activeTab, search, document_type: documentTypeFilter !== 'all' ? documentTypeFilter : undefined },
            { preserveState: true, replace: true }
        );
    };

    const handleApprove = () => {
        if (!selectedRequest) return;
        approveForm.post(`/registrar/document-approvals/${selectedRequest.id}/approve`, {
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
        rejectForm.post(`/registrar/document-approvals/${selectedRequest.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedRequest(null);
                rejectForm.reset();
            },
        });
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '₱0.00';
        return `₱${numAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
        rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    return (
        <RegistrarLayout>
            <Head title="Document Approvals" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Document Request Approvals"
                    description="Review and approve student document requests (transcripts, certificates, etc.)"
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
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
                            <FileText className="h-5 w-5" />
                            Document Requests
                        </CardTitle>
                        <CardDescription>
                            Review document requests submitted by students
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                            <Select value={documentTypeFilter} onValueChange={(v) => setDocumentTypeFilter(v)}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Document Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.entries(documentTypes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
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
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No {activeTab} requests found.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Document</TableHead>
                                                <TableHead>Copies</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Receipt</TableHead>
                                                <TableHead className="text-right">Fee</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.data.map((request) => {
                                                const config = statusConfig[request.registrar_status];
                                                const Icon = config?.icon || Clock;
                                                return (
                                                    <TableRow key={request.id}>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{request.student.full_name}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {request.student.lrn}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {request.student.program} - {request.student.year_level}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{request.document_type_label}</p>
                                                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                                    {request.purpose}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{request.copies}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={request.processing_type === 'rush' ? 'destructive' : 'secondary'}>
                                                                {request.processing_type === 'rush' ? 'Rush' : 'Normal'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {request.receipt_number ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm">{request.receipt_number}</span>
                                                                    {request.receipt_file_path && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                setSelectedRequest(request);
                                                                                setShowReceiptModal(true);
                                                                            }}
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-sm">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency(request.total_fee)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={config?.color || 'bg-gray-100'}>
                                                                <Icon className="h-3 w-3 mr-1" />
                                                                {request.registrar_status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {request.registrar_status === 'pending' ? (
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
                                                                <span className="text-sm text-muted-foreground">
                                                                    {request.registrar_approved_at}
                                                                </span>
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
                                Approve Document Request
                            </DialogTitle>
                            <DialogDescription>
                                Approve this document request and forward to Accounting for payment verification.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRequest.document_type_label} - {selectedRequest.copies} copy(ies)
                                    </p>
                                    <p className="text-sm font-medium mt-2">
                                        Total Fee: {formatCurrency(selectedRequest.total_fee)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks (Optional)</Label>
                                    <Textarea
                                        id="remarks"
                                        placeholder="Add any remarks..."
                                        value={approveForm.data.remarks}
                                        onChange={(e) => approveForm.setData('remarks', e.target.value)}
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
                                Approve
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
                                Reject Document Request
                            </DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting this document request.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div className="bg-muted p-4 rounded-lg">
                                    <p className="font-medium">{selectedRequest.student.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRequest.document_type_label} - {selectedRequest.copies} copy(ies)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reject-remarks">Reason for Rejection *</Label>
                                    <Textarea
                                        id="reject-remarks"
                                        placeholder="Explain why this request is being rejected..."
                                        value={rejectForm.data.remarks}
                                        onChange={(e) => rejectForm.setData('remarks', e.target.value)}
                                        required
                                    />
                                    {rejectForm.errors.remarks && (
                                        <p className="text-sm text-red-500">{rejectForm.errors.remarks}</p>
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
                                disabled={rejectForm.processing || !rejectForm.data.remarks}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Receipt Modal */}
                <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Receipt Image</DialogTitle>
                            <DialogDescription>
                                Receipt #{selectedRequest?.receipt_number}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedRequest?.receipt_file_path && (
                            <div className="flex justify-center">
                                <img
                                    src={`/storage/${selectedRequest.receipt_file_path}`}
                                    alt="Receipt"
                                    className="max-w-full max-h-[500px] object-contain rounded-lg"
                                />
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowReceiptModal(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </RegistrarLayout>
    );
}
