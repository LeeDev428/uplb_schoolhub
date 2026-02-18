import { Head } from '@inertiajs/react';
import { FileText, Calendar, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import StudentLayout from '@/layouts/student/student-layout';
import { Link } from '@inertiajs/react';

interface CompletedRequest {
    id: number;
    document_type: string;
    document_type_label: string;
    copies: number;
    purpose: string;
    status: string;
    fee: string;
    total_fee: number;
    processing_type: 'normal' | 'rush';
    request_date?: string;
    release_date?: string;
    remarks?: string;
}

interface Props {
    completedRequests: CompletedRequest[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    released: { label: 'Released', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function DocumentRequestsHistory({ completedRequests }: Props) {
    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '₱0.00';
        return `₱${numAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const releasedCount = completedRequests.filter((r) => r.status === 'released').length;
    const cancelledCount = completedRequests.filter((r) => r.status === 'cancelled').length;

    return (
        <StudentLayout>
            <Head title="Document Request History" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Document Request History"
                    description="View your completed and cancelled document requests"
                    action={
                        <Link href="/student/document-requests">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Requests
                            </Button>
                        </Link>
                    }
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedRequests.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Released</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{releasedCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Request History
                        </CardTitle>
                        <CardDescription>
                            All your past document requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {completedRequests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No completed requests yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Copies</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Request Date</TableHead>
                                        <TableHead>Release Date</TableHead>
                                        <TableHead className="text-right">Total Fee</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedRequests.map((request) => {
                                        const config = statusConfig[request.status];
                                        const Icon = config?.icon || FileText;
                                        return (
                                            <TableRow key={request.id}>
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
                                                    <Badge className={config?.color || 'bg-gray-100'}>
                                                        <Icon className="h-3 w-3 mr-1" />
                                                        {config?.label || request.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{request.request_date || '-'}</TableCell>
                                                <TableCell>{request.release_date || '-'}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(request.total_fee)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
