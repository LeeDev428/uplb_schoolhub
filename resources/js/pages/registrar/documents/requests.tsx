import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FileCheck, FileX, FileClock, FileText, Eye, Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Document Requests',
        href: '/registrar/documents/requests',
    },
];

interface Student {
    id: number;
    name: string;
    student_id: string;
    program: string;
    year_level: string;
}

interface RequirementCategory {
    id: number;
    name: string;
}

interface Requirement {
    id: number;
    name: string;
    category: RequirementCategory | null;
}

interface Reviewer {
    id: number;
    name: string;
}

interface StudentDocument {
    id: number;
    student: Student;
    requirement: Requirement;
    file_path: string;
    original_filename: string;
    status: 'pending' | 'approved' | 'rejected';
    status_badge: { label: string; variant: string };
    submitted_at: string;
    reviewed_at: string | null;
    reviewer: Reviewer | null;
    reviewer_notes: string | null;
}

interface RequirementOption {
    id: number;
    name: string;
}

interface Props {
    documents: {
        data: StudentDocument[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    requirements: RequirementOption[];
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: {
        search?: string;
        status?: string;
        requirement?: string;
    };
}

export default function DocumentRequests({ documents, requirements, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [requirement, setRequirement] = useState(filters.requirement || 'all');
    const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);
    const [notes, setNotes] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/registrar/documents/requests', {
            search: value,
            status,
            requirement,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/registrar/documents/requests', {
            search,
            status: value,
            requirement,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleRequirementChange = (value: string) => {
        setRequirement(value);
        router.get('/registrar/documents/requests', {
            search,
            status,
            requirement: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openApproveDialog = (doc: StudentDocument) => {
        setSelectedDocument(doc);
        setActionType('approve');
        setNotes('');
        setIsDialogOpen(true);
    };

    const openRejectDialog = (doc: StudentDocument) => {
        setSelectedDocument(doc);
        setActionType('reject');
        setNotes('');
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (doc: StudentDocument) => {
        setSelectedDocument(doc);
        setActionType('delete');
        setIsDialogOpen(true);
    };

    const handleSubmitAction = () => {
        if (!selectedDocument) return;

        if (actionType === 'approve') {
            router.post(`/registrar/documents/${selectedDocument.id}/approve`, {
                notes,
            }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setNotes('');
                },
            });
        } else if (actionType === 'reject') {
            router.post(`/registrar/documents/${selectedDocument.id}/reject`, {
                notes,
            }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setNotes('');
                },
            });
        } else if (actionType === 'delete') {
            router.delete(`/registrar/documents/${selectedDocument.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusVariant = (variant: string): any => {
        const variantMap: Record<string, any> = {
            secondary: 'secondary',
            default: 'default',
            destructive: 'destructive',
            outline: 'outline',
        };
        return variantMap[variant] || 'secondary';
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Document Requests" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Document Requests
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review and manage student-submitted documents
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <FileClock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <FileCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <FileX className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <FilterBar>
                            <SearchBar
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search by student name or ID..."
                            />
                            <FilterDropdown
                                label="Status"
                                value={status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'rejected', label: 'Rejected' },
                                ]}
                            />
                            <FilterDropdown
                                label="Requirement"
                                value={requirement}
                                onChange={handleRequirementChange}
                                options={[
                                    { value: 'all', label: 'All Requirements' },
                                    ...requirements.map(r => ({ value: r.id.toString(), label: r.name })),
                                ]}
                            />
                        </FilterBar>

                        {/* Documents Table */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left text-sm font-semibold">Student</th>
                                        <th className="p-3 text-left text-sm font-semibold">Requirement</th>
                                        <th className="p-3 text-left text-sm font-semibold">File</th>
                                        <th className="p-3 text-left text-sm font-semibold">Submitted</th>
                                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                                        <th className="p-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No document submissions found
                                            </td>
                                        </tr>
                                    ) : (
                                        documents.data.map((doc) => (
                                            <tr key={doc.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{doc.student.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.student.student_id} • {doc.student.program} {doc.student.year_level}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{doc.requirement.name}</p>
                                                        {doc.requirement.category && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {doc.requirement.category.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-sm truncate max-w-[200px]" title={doc.original_filename}>
                                                        {doc.original_filename}
                                                    </p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-sm">{formatDate(doc.submitted_at)}</p>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={getStatusVariant(doc.status_badge.variant)}>
                                                        {doc.status_badge.label}
                                                    </Badge>
                                                    {doc.reviewer_notes && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Note: {doc.reviewer_notes}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => window.open(`/storage/${doc.file_path}`, '_blank')}
                                                            title="View document"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {doc.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => openApproveDialog(doc)}
                                                                    title="Approve"
                                                                >
                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => openRejectDialog(doc)}
                                                                    title="Reject"
                                                                >
                                                                    <X className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openDeleteDialog(doc)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {documents.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination data={documents} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Action Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' && 'Approve Document'}
                            {actionType === 'reject' && 'Reject Document'}
                            {actionType === 'delete' && 'Delete Document'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDocument && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-3 bg-muted/50">
                                <p className="text-sm">
                                    <span className="font-medium">Student:</span> {selectedDocument.student.name}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Requirement:</span> {selectedDocument.requirement.name}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">File:</span> {selectedDocument.original_filename}
                                </p>
                            </div>

                            {actionType === 'delete' ? (
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this document submission? This action cannot be undone.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="notes">
                                        {actionType === 'reject' ? 'Reason for rejection *' : 'Notes (optional)'}
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={
                                            actionType === 'reject'
                                                ? 'Explain why this document was rejected...'
                                                : 'Add any notes about this approval...'
                                        }
                                        rows={3}
                                        required={actionType === 'reject'}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitAction}
                            variant={actionType === 'reject' || actionType === 'delete' ? 'destructive' : 'default'}
                            disabled={actionType === 'reject' && !notes.trim()}
                        >
                            {actionType === 'approve' && 'Approve'}
                            {actionType === 'reject' && 'Reject'}
                            {actionType === 'delete' && 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </RegistrarLayout>
    );
}
