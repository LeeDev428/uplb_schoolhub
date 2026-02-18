import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Plus,
    FileText,
    AlertTriangle,
    Upload,
    History,
    Eye,
} from 'lucide-react';
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
import { PageHeader } from '@/components/page-header';
import StudentLayout from '@/layouts/student/student-layout';
import { Link } from '@inertiajs/react';

interface DocumentFee {
    id: number;
    category: string;
    name: string;
    price: string;
    processing_days: number;
    processing_type: 'normal' | 'rush';
    description?: string;
}

interface DocumentRequest {
    id: number;
    document_type: string;
    document_type_label: string;
    copies: number;
    purpose: string;
    status: string;
    fee: string;
    total_fee: number;
    is_paid: boolean;
    processing_type: 'normal' | 'rush';
    processing_days: number;
    receipt_file_path?: string;
    receipt_number?: string;
    registrar_status: 'pending' | 'approved' | 'rejected';
    registrar_remarks?: string;
    accounting_status: 'pending' | 'approved' | 'rejected';
    accounting_remarks?: string;
    approval_stage: string;
    expected_completion_date?: string;
    request_date?: string;
    release_date?: string;
    created_at: string;
}

interface Props {
    requests: DocumentRequest[];
    documentFees: DocumentFee[];
    feesByCategory: Record<string, DocumentFee[]>;
    documentTypes: Record<string, string>;
}

const approvalStageConfig: Record<string, { label: string; color: string }> = {
    awaiting_registrar: { label: 'Awaiting Registrar Approval', color: 'bg-yellow-100 text-yellow-800' },
    awaiting_accounting: { label: 'Awaiting Accounting Approval', color: 'bg-blue-100 text-blue-800' },
    approved: { label: 'Approved - Processing', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    ready: { label: 'Ready for Pickup', color: 'bg-green-100 text-green-800' },
    released: { label: 'Released', color: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function DocumentRequestsIndex({ requests, documentFees, feesByCategory }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<DocumentFee | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm({
        document_fee_item_id: '',
        copies: '1',
        purpose: '',
        receipt_file: null as File | null,
        receipt_number: '',
    });

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '₱0.00';
        return `₱${numAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleFeeSelect = (feeId: string) => {
        const fee = documentFees.find((f) => f.id.toString() === feeId);
        setSelectedFee(fee || null);
        form.setData('document_fee_item_id', feeId);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('receipt_file', file);
            // Create preview URL for images
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/student/document-requests', {
            forceFormData: true,
            onSuccess: () => {
                setIsDialogOpen(false);
                form.reset();
                setSelectedFee(null);
                setPreviewUrl(null);
            },
        });
    };

    const handleCancel = (id: number) => {
        router.post(`/student/document-requests/${id}/cancel`);
    };

    const pendingRequests = requests.filter((r) => r.status === 'pending' || r.status === 'processing');
    const hasActiveRequests = pendingRequests.length > 0;

    return (
        <StudentLayout>
            <Head title="Document Requests" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Document Requests"
                    description="Request official documents such as transcripts, certificates, and more"
                    action={
                        <div className="flex gap-2">
                            <Link href="/student/document-requests/history">
                                <Button variant="outline">
                                    <History className="h-4 w-4 mr-2" />
                                    View History
                                </Button>
                            </Link>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Request
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                    <form onSubmit={handleSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Request Document</DialogTitle>
                                            <DialogDescription>
                                                Fill in the details below to request an official document.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            {/* Document Type Selection */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="document_type">Document Type *</Label>
                                                <Select
                                                    value={form.data.document_fee_item_id}
                                                    onValueChange={handleFeeSelect}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a document type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(feesByCategory).map(([category, fees]) => (
                                                            <div key={category}>
                                                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                                                    {category}
                                                                </div>
                                                                {fees.map((fee) => (
                                                                    <SelectItem
                                                                        key={fee.id}
                                                                        value={fee.id.toString()}
                                                                    >
                                                                        {fee.name} - {formatCurrency(fee.price)} ({fee.processing_days} days)
                                                                    </SelectItem>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {form.errors.document_fee_item_id && (
                                                    <p className="text-sm text-red-500">{form.errors.document_fee_item_id}</p>
                                                )}
                                            </div>

                                            {/* Selected Fee Info */}
                                            {selectedFee && (
                                                <Card className="bg-muted/50">
                                                    <CardContent className="pt-4 space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Price per copy:</span>
                                                            <span className="font-medium">{formatCurrency(selectedFee.price)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Processing Type:</span>
                                                            <Badge variant={selectedFee.processing_type === 'rush' ? 'destructive' : 'secondary'}>
                                                                {selectedFee.processing_type === 'rush' ? 'Rush' : 'Normal'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-muted-foreground">Processing Time:</span>
                                                            <span>{selectedFee.processing_days} working days</span>
                                                        </div>
                                                        {selectedFee.description && (
                                                            <p className="text-sm text-muted-foreground pt-2 border-t">
                                                                {selectedFee.description}
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Number of Copies */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="copies">Number of Copies *</Label>
                                                <Input
                                                    id="copies"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={form.data.copies}
                                                    onChange={(e) => form.setData('copies', e.target.value)}
                                                />
                                                {form.errors.copies && (
                                                    <p className="text-sm text-red-500">{form.errors.copies}</p>
                                                )}
                                                {selectedFee && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Total: {formatCurrency(parseFloat(selectedFee.price) * parseInt(form.data.copies || '1'))}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Purpose */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="purpose">Purpose *</Label>
                                                <Textarea
                                                    id="purpose"
                                                    value={form.data.purpose}
                                                    onChange={(e) => form.setData('purpose', e.target.value)}
                                                    placeholder="Why do you need this document?"
                                                    rows={3}
                                                />
                                                {form.errors.purpose && (
                                                    <p className="text-sm text-red-500">{form.errors.purpose}</p>
                                                )}
                                            </div>

                                            {/* Receipt Number */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="receipt_number">Receipt/Reference Number *</Label>
                                                <Input
                                                    id="receipt_number"
                                                    value={form.data.receipt_number}
                                                    onChange={(e) => form.setData('receipt_number', e.target.value)}
                                                    placeholder="Enter your payment receipt number"
                                                />
                                                {form.errors.receipt_number && (
                                                    <p className="text-sm text-red-500">{form.errors.receipt_number}</p>
                                                )}
                                            </div>

                                            {/* Receipt Upload */}
                                            <div className="grid gap-2">
                                                <Label htmlFor="receipt_file">Upload Receipt *</Label>
                                                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                                    <input
                                                        id="receipt_file"
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="receipt_file"
                                                        className="cursor-pointer flex flex-col items-center gap-2"
                                                    >
                                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">
                                                            Click to upload receipt (JPG, PNG, PDF - max 5MB)
                                                        </span>
                                                    </label>
                                                    {form.data.receipt_file && (
                                                        <p className="mt-2 text-sm text-green-600">
                                                            ✓ {form.data.receipt_file.name}
                                                        </p>
                                                    )}
                                                    {previewUrl && (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Receipt preview"
                                                            className="mt-2 max-h-32 mx-auto rounded"
                                                        />
                                                    )}
                                                </div>
                                                {form.errors.receipt_file && (
                                                    <p className="text-sm text-red-500">{form.errors.receipt_file}</p>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                    }
                />

                {/* Active Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Active Requests
                        </CardTitle>
                        <CardDescription>
                            Track the status of your pending document requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!hasActiveRequests ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No active document requests.</p>
                                <p className="text-sm">Click "New Request" to request a document.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Copies</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Approval Progress</TableHead>
                                        <TableHead>Total Fee</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">
                                                {request.document_type_label}
                                            </TableCell>
                                            <TableCell>{request.copies}</TableCell>
                                            <TableCell>
                                                <Badge variant={request.processing_type === 'rush' ? 'destructive' : 'secondary'}>
                                                    {request.processing_type === 'rush' ? 'Rush' : 'Normal'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusConfig[request.status]?.color || 'bg-gray-100'}>
                                                    {statusConfig[request.status]?.label || request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        {request.registrar_status === 'approved' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        ) : request.registrar_status === 'rejected' ? (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                        <span>Registrar</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        {request.accounting_status === 'approved' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        ) : request.accounting_status === 'rejected' ? (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <Clock className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                        <span>Accounting</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(request.total_fee)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.registrar_status === 'pending' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-red-600">
                                                                Cancel
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to cancel this document request?
                                                                    This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleCancel(request.id)}
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
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Remarks Display */}
                {pendingRequests.some((r) => r.registrar_remarks || r.accounting_remarks) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Remarks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingRequests
                                .filter((r) => r.registrar_remarks || r.accounting_remarks)
                                .map((request) => (
                                    <div key={request.id} className="p-4 bg-muted rounded-lg">
                                        <p className="font-medium mb-2">{request.document_type_label}</p>
                                        {request.registrar_remarks && (
                                            <p className="text-sm">
                                                <span className="font-medium">Registrar:</span> {request.registrar_remarks}
                                            </p>
                                        )}
                                        {request.accounting_remarks && (
                                            <p className="text-sm">
                                                <span className="font-medium">Accounting:</span> {request.accounting_remarks}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </StudentLayout>
    );
}
