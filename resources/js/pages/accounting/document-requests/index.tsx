import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/filters/filter-bar';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import {
    Check,
    Circle,
    Clock,
    FileCheck,
    FileOutput,
    MoreHorizontal,
    Printer,
    Plus,
    Trash2,
    X,
    DollarSign,
} from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
}

interface DocumentRequest {
    id: number;
    student_id: number;
    document_type: string;
    quantity: number;
    purpose?: string;
    fee_amount: string;
    payment_status: 'unpaid' | 'paid';
    status: 'pending' | 'processing' | 'ready' | 'released' | 'cancelled';
    processed_at?: string;
    ready_at?: string;
    released_at?: string;
    remarks?: string;
    created_at: string;
    student: Student;
    processed_by?: { name: string };
    released_by?: { name: string };
}

interface PaginatedRequests {
    data: DocumentRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    requests: PaginatedRequests;
    students: { id: number; full_name: string; lrn: string }[];
    documentTypes: Record<string, string>;
    stats: {
        pending: number;
        processing: number;
        ready: number;
        total_unpaid: string;
    };
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
        document_type?: string;
    };
}

export default function DocumentRequestIndex({
    requests,
    students,
    documentTypes,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || 'all');
    const [documentType, setDocumentType] = useState(filters.document_type || 'all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

    const createForm = useForm({
        student_id: '',
        document_type: '',
        quantity: '1',
        purpose: '',
        fee_amount: '',
        remarks: '',
    });

    const handleFilter = () => {
        router.get('/accounting/document-requests', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
            document_type: documentType !== 'all' ? documentType : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setPaymentStatus('all');
        setDocumentType('all');
        router.get('/accounting/document-requests');
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/accounting/document-requests', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleMarkPaid = () => {
        if (selectedRequest) {
            router.post(`/accounting/document-requests/${selectedRequest.id}/mark-paid`, {}, {
                onSuccess: () => {
                    setIsPaymentModalOpen(false);
                    setSelectedRequest(null);
                },
            });
        }
    };

    const handleProcess = (id: number) => {
        router.post(`/accounting/document-requests/${id}/process`);
    };

    const handleMarkReady = (id: number) => {
        router.post(`/accounting/document-requests/${id}/mark-ready`);
    };

    const handleRelease = (id: number) => {
        if (confirm('Confirm document release to student?')) {
            router.post(`/accounting/document-requests/${id}/release`);
        }
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this request?')) {
            router.post(`/accounting/document-requests/${id}/cancel`);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this request?')) {
            router.delete(`/accounting/document-requests/${id}`);
        }
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '₱0.00';
        return `₱${numAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline"><Circle className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'processing':
                return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
            case 'ready':
                return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Ready</Badge>;
            case 'released':
                return <Badge className="bg-gray-500"><FileOutput className="h-3 w-3 mr-1" />Released</Badge>;
            case 'cancelled':
                return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status: string) => {
        return status === 'paid' ? (
            <Badge className="bg-green-500">Paid</Badge>
        ) : (
            <Badge variant="outline" className="text-red-600 border-red-300">Unpaid</Badge>
        );
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'ready', label: 'Ready' },
        { value: 'released', label: 'Released' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const paymentStatusOptions = [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
    ];

    const documentTypeOptions = documentTypes ? Object.entries(documentTypes).map(([value, label]) => ({ value, label })) : [];

    return (
        <AccountingLayout>
            <Head title="Document Requests" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Document Requests"
                    description="Manage student document requests and track processing status"
                    action={
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                {/* <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Request
                                </Button> */}
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <form onSubmit={handleCreate}>
                                    <DialogHeader>
                                        <DialogTitle>Create Document Request</DialogTitle>
                                        <DialogDescription>
                                            Create a new document request for a student
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="student_id">Student *</Label>
                                            <Select
                                                value={createForm.data.student_id}
                                                onValueChange={(value) => createForm.setData('student_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id.toString()}>
                                                            {student.full_name} ({student.lrn})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {createForm.errors.student_id && <p className="text-sm text-red-500">{createForm.errors.student_id}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="document_type">Document Type *</Label>
                                                <Select
                                                    value={createForm.data.document_type}
                                                    onValueChange={(value) => createForm.setData('document_type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {documentTypeOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {createForm.errors.document_type && <p className="text-sm text-red-500">{createForm.errors.document_type}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="quantity">Quantity *</Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    min="1"
                                                    value={createForm.data.quantity}
                                                    onChange={(e) => createForm.setData('quantity', e.target.value)}
                                                />
                                                {createForm.errors.quantity && <p className="text-sm text-red-500">{createForm.errors.quantity}</p>}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="fee_amount">Fee Amount *</Label>
                                            <Input
                                                id="fee_amount"
                                                type="number"
                                                step="0.01"
                                                value={createForm.data.fee_amount}
                                                onChange={(e) => createForm.setData('fee_amount', e.target.value)}
                                                placeholder="0.00"
                                            />
                                            {createForm.errors.fee_amount && <p className="text-sm text-red-500">{createForm.errors.fee_amount}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="purpose">Purpose</Label>
                                            <Input
                                                id="purpose"
                                                value={createForm.data.purpose}
                                                onChange={(e) => createForm.setData('purpose', e.target.value)}
                                                placeholder="e.g., Employment, Scholarship"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="remarks">Remarks</Label>
                                            <Textarea
                                                id="remarks"
                                                value={createForm.data.remarks}
                                                onChange={(e) => createForm.setData('remarks', e.target.value)}
                                                placeholder="Optional notes..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createForm.processing}>
                                            Create
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Circle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting processing</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Processing</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.processing}</div>
                            <p className="text-xs text-muted-foreground">Currently being prepared</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ready</CardTitle>
                            <FileCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.ready}</div>
                            <p className="text-xs text-muted-foreground">Ready for release</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unpaid Fees</CardTitle>
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_unpaid)}</div>
                            <p className="text-xs text-muted-foreground">Pending payments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <FilterBar onReset={handleReset}>
                    <SearchBar
                        value={search}
                        onChange={(value) => {
                            setSearch(value);
                            if (value === '') handleFilter();
                        }}
                        placeholder="Search by student name or LRN..."
                    />
                    <FilterDropdown
                        label="Status"
                        value={status}
                        options={statusOptions}
                        onChange={(value) => {
                            setStatus(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <FilterDropdown
                        label="Payment"
                        value={paymentStatus}
                        options={paymentStatusOptions}
                        onChange={(value) => {
                            setPaymentStatus(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <FilterDropdown
                        label="Document Type"
                        value={documentType}
                        options={documentTypeOptions}
                        onChange={(value) => {
                            setDocumentType(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <Button onClick={handleFilter} className="mt-auto">
                        Apply Filters
                    </Button>
                </FilterBar>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead className="text-right">Fee</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No document requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.data.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{request.student.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{request.student.lrn}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {documentTypes?.[request.document_type] || request.document_type}
                                        </TableCell>
                                        <TableCell className="text-center">{request.quantity}</TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            {request.purpose || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(request.fee_amount)}</TableCell>
                                        <TableCell>{getPaymentBadge(request.payment_status)}</TableCell>
                                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                        <TableCell>{formatDate(request.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {request.payment_status === 'unpaid' && request.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedRequest(request);
                                                            setIsPaymentModalOpen(true);
                                                        }}>
                                                            <DollarSign className="h-4 w-4 mr-2" />
                                                            Mark as Paid
                                                        </DropdownMenuItem>
                                                    )}
                                                    {request.status === 'pending' && request.payment_status === 'paid' && (
                                                        <DropdownMenuItem onClick={() => handleProcess(request.id)}>
                                                            <Printer className="h-4 w-4 mr-2" />
                                                            Start Processing
                                                        </DropdownMenuItem>
                                                    )}
                                                    {request.status === 'processing' && (
                                                        <DropdownMenuItem onClick={() => handleMarkReady(request.id)}>
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Mark as Ready
                                                        </DropdownMenuItem>
                                                    )}
                                                    {request.status === 'ready' && (
                                                        <DropdownMenuItem onClick={() => handleRelease(request.id)}>
                                                            <FileOutput className="h-4 w-4 mr-2" />
                                                            Release Document
                                                        </DropdownMenuItem>
                                                    )}
                                                    {!['cancelled', 'released'].includes(request.status) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleCancel(request.id)}
                                                                className="text-orange-600"
                                                            >
                                                                <X className="h-4 w-4 mr-2" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(request.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {requests.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {requests.data.length} of {requests.total} records
                        </p>
                        <div className="flex gap-2">
                            {requests.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Confirmation Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
                setIsPaymentModalOpen(open);
                if (!open) setSelectedRequest(null);
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Mark this document request fee as paid?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="py-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Student:</span>
                                <span className="font-medium">{selectedRequest.student.full_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Document:</span>
                                <span className="font-medium">{documentTypes?.[selectedRequest.document_type] || selectedRequest.document_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-semibold text-lg">{formatCurrency(selectedRequest.fee_amount)}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleMarkPaid}>
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AccountingLayout>
    );
}
