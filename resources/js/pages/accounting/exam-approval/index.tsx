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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilterBar } from '@/components/filters/filter-bar';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { Check, MoreHorizontal, Plus, Trash2, X, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
}

interface ExamApproval {
    id: number;
    student_id: number;
    school_year: string;
    exam_type: string;
    term?: string;
    status: 'pending' | 'approved' | 'denied';
    required_amount: string;
    paid_amount: string;
    remarks?: string;
    approved_at?: string;
    student: Student;
    approved_by?: { name: string };
}

interface PaginatedApprovals {
    data: ExamApproval[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface StudentOverdue {
    id: number;
    full_name: string;
    lrn: string;
    overdue_amount: string;
    school_year: string;
}

interface Props {
    approvals: PaginatedApprovals;
    studentsWithOverdue: StudentOverdue[];
    examTypes: Record<string, string>;
    terms: Record<string, string>;
    schoolYears: string[];
    filters: {
        search?: string;
        status?: string;
        exam_type?: string;
        school_year?: string;
    };
}

export default function ExamApprovalIndex({
    approvals,
    studentsWithOverdue,
    examTypes,
    terms,
    schoolYears,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [examType, setExamType] = useState(filters.exam_type || 'all');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState<ExamApproval | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const createForm = useForm({
        student_id: '',
        school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        exam_type: '',
        term: '',
        required_amount: '',
        remarks: '',
    });

    const denyForm = useForm({
        remarks: '',
    });

    const handleFilter = () => {
        router.get('/accounting/exam-approval', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            exam_type: examType !== 'all' ? examType : undefined,
            school_year: schoolYear !== 'all' ? schoolYear : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setExamType('all');
        setSchoolYear('all');
        router.get('/accounting/exam-approval');
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/accounting/exam-approval', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleApprove = (id: number) => {
        router.post(`/accounting/exam-approval/${id}/approve`);
    };

    const handleDeny = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedApproval) {
            router.post(`/accounting/exam-approval/${selectedApproval.id}/deny`, {
                remarks: denyForm.data.remarks,
            }, {
                onSuccess: () => {
                    setIsDenyModalOpen(false);
                    setSelectedApproval(null);
                    denyForm.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this approval record?')) {
            router.delete(`/accounting/exam-approval/${id}`);
        }
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Are you sure you want to approve ${selectedIds.length} exam(s)?`)) {
            router.post('/accounting/exam-approval/bulk-approve', {
                approval_ids: selectedIds,
            }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const toggleSelectAll = () => {
        const pendingIds = approvals.data.filter(a => a.status === 'pending').map(a => a.id);
        if (selectedIds.length === pendingIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingIds);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const formatCurrency = (amount: string | number) => {
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500">Approved</Badge>;
            case 'denied':
                return <Badge variant="destructive">Denied</Badge>;
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    const canApprove = (approval: ExamApproval) => {
        const paid = parseFloat(approval.paid_amount);
        const required = parseFloat(approval.required_amount);
        return paid >= required;
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'denied', label: 'Denied' },
    ];

    const examTypeOptions = Object.entries(examTypes).map(([value, label]) => ({ value, label }));
    const termOptions = Object.entries(terms).map(([value, label]) => ({ value, label }));
    const schoolYearOptions = schoolYears.map(y => ({ value: y, label: y }));

    return (
        <AccountingLayout>
            <Head title="Exam Approval" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Exam Approval"
                    description="Approve students to take exams based on payment of overdue fees"
                    action={
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <Button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Selected ({selectedIds.length})
                                </Button>
                            )}
                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Approval
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <form onSubmit={handleCreate}>
                                        <DialogHeader>
                                            <DialogTitle>Create Exam Approval</DialogTitle>
                                            <DialogDescription>
                                                Create an exam approval request for a student with overdue fees
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="student_id">Student *</Label>
                                                <Select
                                                    value={createForm.data.student_id}
                                                    onValueChange={(value) => {
                                                        createForm.setData('student_id', value);
                                                        const student = studentsWithOverdue.find(s => s.id.toString() === value);
                                                        if (student) {
                                                            createForm.setData('required_amount', student.overdue_amount);
                                                            createForm.setData('school_year', student.school_year);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {studentsWithOverdue.map((student) => (
                                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                                {student.full_name} - {formatCurrency(student.overdue_amount)} overdue
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {createForm.errors.student_id && <p className="text-sm text-red-500">{createForm.errors.student_id}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="exam_type">Exam Type *</Label>
                                                    <Select
                                                        value={createForm.data.exam_type}
                                                        onValueChange={(value) => createForm.setData('exam_type', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {examTypeOptions.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {createForm.errors.exam_type && <p className="text-sm text-red-500">{createForm.errors.exam_type}</p>}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="term">Term</Label>
                                                    <Select
                                                        value={createForm.data.term}
                                                        onValueChange={(value) => createForm.setData('term', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select term" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {termOptions.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="required_amount">Required Amount *</Label>
                                                <Input
                                                    id="required_amount"
                                                    type="number"
                                                    step="0.01"
                                                    value={createForm.data.required_amount}
                                                    onChange={(e) => createForm.setData('required_amount', e.target.value)}
                                                    placeholder="Amount required for approval"
                                                />
                                                {createForm.errors.required_amount && <p className="text-sm text-red-500">{createForm.errors.required_amount}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="remarks">Remarks</Label>
                                                <Textarea
                                                    id="remarks"
                                                    value={createForm.data.remarks}
                                                    onChange={(e) => createForm.setData('remarks', e.target.value)}
                                                    placeholder="Optional remarks..."
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
                        </div>
                    }
                />

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
                        label="Exam Type"
                        value={examType}
                        options={examTypeOptions}
                        onChange={(value) => {
                            setExamType(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <FilterDropdown
                        label="School Year"
                        value={schoolYear}
                        options={schoolYearOptions}
                        onChange={(value) => {
                            setSchoolYear(value);
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
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedIds.length === approvals.data.filter(a => a.status === 'pending').length && selectedIds.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Exam</TableHead>
                                <TableHead>School Year</TableHead>
                                <TableHead className="text-right">Required</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvals.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No exam approval records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                approvals.data.map((approval) => (
                                    <TableRow key={approval.id}>
                                        <TableCell>
                                            {approval.status === 'pending' && (
                                                <Checkbox
                                                    checked={selectedIds.includes(approval.id)}
                                                    onCheckedChange={() => toggleSelect(approval.id)}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{approval.student.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{approval.student.lrn}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{examTypes[approval.exam_type] || approval.exam_type}</div>
                                                {approval.term && (
                                                    <div className="text-sm text-muted-foreground">{terms[approval.term] || approval.term}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{approval.school_year}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(approval.required_amount)}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={canApprove(approval) ? 'text-green-600' : 'text-red-600'}>
                                                {formatCurrency(approval.paid_amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {approval.status === 'pending' ? (
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(approval.id)}
                                                        className="text-green-600"
                                                        disabled={!canApprove(approval)}
                                                        title={canApprove(approval) ? 'Approve' : 'Insufficient payment'}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedApproval(approval);
                                                            setIsDenyModalOpen(true);
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(approval.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(approval.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {approvals.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {approvals.data.length} of {approvals.total} records
                        </p>
                        <div className="flex gap-2">
                            {approvals.links.map((link, index) => (
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

            {/* Deny Modal */}
            <Dialog open={isDenyModalOpen} onOpenChange={(open) => {
                setIsDenyModalOpen(open);
                if (!open) {
                    setSelectedApproval(null);
                    denyForm.reset();
                }
            }}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleDeny}>
                        <DialogHeader>
                            <DialogTitle>Deny Exam Approval</DialogTitle>
                            <DialogDescription>
                                Provide a reason for denying this exam approval request
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="deny_remarks">Reason for denial</Label>
                                <Textarea
                                    id="deny_remarks"
                                    value={denyForm.data.remarks}
                                    onChange={(e) => denyForm.setData('remarks', e.target.value)}
                                    placeholder="Enter reason..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDenyModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={denyForm.processing}>
                                Deny
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AccountingLayout>
    );
}
