import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Edit, Gift, MoreHorizontal, Plus, Trash2, UserPlus, Users } from 'lucide-react';

interface Grant {
    id: number;
    name: string;
    code?: string;
    description?: string;
    type: 'fixed' | 'percentage';
    value: string;
    formatted_value: string;
    school_year?: string;
    is_active: boolean;
    recipients_count: number;
    active_recipients_count: number;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    full_name: string;
    program?: string;
    year_level?: string;
}

interface GrantRecipient {
    id: number;
    student_id: number;
    grant_id: number;
    school_year: string;
    discount_amount: string;
    status: string;
    notes?: string;
    assigned_at: string;
    student: Student;
    grant: Grant;
    assigned_by?: { name: string };
}

interface PaginatedRecipients {
    data: GrantRecipient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    tab: string;
    grants: Grant[];
    recipients: PaginatedRecipients;
    students: Student[];
    schoolYears: string[];
    filters: {
        search?: string;
        grant_id?: string;
        school_year?: string;
        status?: string;
    };
}

export default function GrantsIndex({ tab, grants, recipients, students, schoolYears, filters }: Props) {
    const [activeTab, setActiveTab] = useState(tab || 'library');
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingGrant, setEditingGrant] = useState<Grant | null>(null);

    const [search, setSearch] = useState(filters.search || '');
    const [grantFilter, setGrantFilter] = useState(filters.grant_id || 'all');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [studentSearch, setStudentSearch] = useState('');

    const grantForm = useForm({
        name: '',
        code: '',
        description: '',
        type: 'fixed' as 'fixed' | 'percentage',
        value: '',
        school_year: '',
        is_active: true,
    });

    const assignForm = useForm({
        student_id: '',
        grant_id: '',
        school_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        notes: '',
    });

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.get('/accounting/grants', { tab: value }, { preserveState: true });
    };

    const handleFilter = () => {
        router.get('/accounting/grants', {
            tab: 'recipients',
            search: search || undefined,
            grant_id: grantFilter !== 'all' ? grantFilter : undefined,
            school_year: schoolYear !== 'all' ? schoolYear : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setGrantFilter('all');
        setSchoolYear('all');
        setStatusFilter('all');
        router.get('/accounting/grants', { tab: 'recipients' });
    };

    const handleCreateGrant = (e: React.FormEvent) => {
        e.preventDefault();
        grantForm.post('/accounting/grants', {
            onSuccess: () => {
                setIsGrantModalOpen(false);
                grantForm.reset();
            },
        });
    };

    const handleEditGrant = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGrant) {
            grantForm.put(`/accounting/grants/${editingGrant.id}`, {
                onSuccess: () => {
                    setIsGrantModalOpen(false);
                    setEditingGrant(null);
                    grantForm.reset();
                },
            });
        }
    };

    const handleDeleteGrant = (id: number) => {
        if (confirm('Are you sure you want to delete this grant?')) {
            router.delete(`/accounting/grants/${id}`);
        }
    };

    const openEditModal = (grant: Grant) => {
        setEditingGrant(grant);
        grantForm.setData({
            name: grant.name,
            code: grant.code || '',
            description: grant.description || '',
            type: grant.type,
            value: grant.value,
            school_year: grant.school_year || '',
            is_active: grant.is_active,
        });
        setIsGrantModalOpen(true);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assignForm.post('/accounting/grants/recipients', {
            onSuccess: () => {
                setIsAssignModalOpen(false);
                setStudentSearch('');
                assignForm.reset();
            },
        });
    };

    const handleRemoveRecipient = (id: number) => {
        if (confirm('Are you sure you want to remove this recipient?')) {
            router.delete(`/accounting/grants/recipients/${id}`);
        }
    };

    const formatCurrency = (amount: string | number) => {
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const grantOptions = grants.map(g => ({ value: g.id.toString(), label: g.name }));
    const schoolYearOptions = schoolYears.map(y => ({ value: y, label: y }));
    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'graduated', label: 'Graduated' },
        { value: 'withdrawn', label: 'Withdrawn' },
    ];

    return (
        <AccountingLayout>
            <Head title="Student Grants" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Student Grants"
                    description="Manage scholarships, discounts, and financial aid programs"
                />

                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList>
                        <TabsTrigger value="library" className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Grant Library
                        </TabsTrigger>
                        <TabsTrigger value="recipients" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Recipients
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="space-y-4">
                        <div className="flex justify-end">
                            <Dialog open={isGrantModalOpen && !editingGrant} onOpenChange={(open) => {
                                setIsGrantModalOpen(open);
                                if (!open) {
                                    setEditingGrant(null);
                                    grantForm.reset();
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Grant
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <form onSubmit={editingGrant ? handleEditGrant : handleCreateGrant}>
                                        <DialogHeader>
                                            <DialogTitle>{editingGrant ? 'Edit Grant' : 'Create Grant'}</DialogTitle>
                                            <DialogDescription>
                                                {editingGrant ? 'Update the grant details' : 'Add a new grant or scholarship program'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={grantForm.data.name}
                                                    onChange={(e) => grantForm.setData('name', e.target.value)}
                                                    placeholder="e.g., Academic Scholarship"
                                                />
                                                {grantForm.errors.name && <p className="text-sm text-red-500">{grantForm.errors.name}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="code">Code</Label>
                                                <Input
                                                    id="code"
                                                    value={grantForm.data.code}
                                                    onChange={(e) => grantForm.setData('code', e.target.value)}
                                                    placeholder="e.g., ACAD-SCH"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="type">Discount Type *</Label>
                                                    <Select
                                                        value={grantForm.data.type}
                                                        onValueChange={(value) => grantForm.setData('type', value as 'fixed' | 'percentage')}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                            <SelectItem value="percentage">Percentage</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="value">Value *</Label>
                                                    <Input
                                                        id="value"
                                                        type="number"
                                                        step="0.01"
                                                        value={grantForm.data.value}
                                                        onChange={(e) => grantForm.setData('value', e.target.value)}
                                                        placeholder={grantForm.data.type === 'percentage' ? 'e.g., 50' : 'e.g., 5000'}
                                                    />
                                                    {grantForm.errors.value && <p className="text-sm text-red-500">{grantForm.errors.value}</p>}
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={grantForm.data.description}
                                                    onChange={(e) => grantForm.setData('description', e.target.value)}
                                                    placeholder="Brief description of the grant..."
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={grantForm.processing}>
                                                {editingGrant ? 'Update' : 'Create'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {grants.map((grant) => (
                                <Card key={grant.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{grant.name}</CardTitle>
                                                {grant.code && <CardDescription>{grant.code}</CardDescription>}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(grant)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteGrant(grant.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Discount</span>
                                                <Badge variant="secondary" className="text-lg font-semibold">
                                                    {grant.formatted_value}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Recipients</span>
                                                <span className="font-medium">
                                                    {grant.active_recipients_count} active / {grant.recipients_count} total
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Status</span>
                                                <Badge variant={grant.is_active ? 'default' : 'secondary'}>
                                                    {grant.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            {grant.description && (
                                                <p className="text-sm text-muted-foreground pt-2 border-t">
                                                    {grant.description}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {grants.length === 0 && (
                                <Card className="col-span-full">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No grants found. Create your first grant to get started.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="recipients" className="space-y-4">
                        <div className="flex justify-end">
                            <Dialog open={isAssignModalOpen} onOpenChange={(open) => {
                                setIsAssignModalOpen(open);
                                if (!open) {
                                    setStudentSearch('');
                                    assignForm.reset();
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Assign Grant
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <form onSubmit={handleAssign}>
                                        <DialogHeader>
                                            <DialogTitle>Assign Grant to Student</DialogTitle>
                                            <DialogDescription>
                                                Select a student and grant to assign
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="student_id">Student *</Label>
                                                <Input
                                                    placeholder="Search students by name or LRN..."
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    className="mb-2"
                                                />
                                                <Select
                                                    value={assignForm.data.student_id}
                                                    onValueChange={(value) => assignForm.setData('student_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {students
                                                            .filter(student => 
                                                                studentSearch === '' ||
                                                                student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                                student.lrn.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                                (student.program && student.program.toLowerCase().includes(studentSearch.toLowerCase())) ||
                                                                (student.year_level && student.year_level.toLowerCase().includes(studentSearch.toLowerCase()))
                                                            )
                                                            .map((student) => (
                                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{student.full_name}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {student.lrn} {student.program && student.year_level ? `• ${student.program} - ${student.year_level}` : ''}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        {students.filter(student => 
                                                            studentSearch === '' ||
                                                            student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                            student.lrn.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                                            (student.program && student.program.toLowerCase().includes(studentSearch.toLowerCase())) ||
                                                            (student.year_level && student.year_level.toLowerCase().includes(studentSearch.toLowerCase()))
                                                        ).length === 0 && (
                                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                                No students found
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {assignForm.errors.student_id && <p className="text-sm text-red-500">{assignForm.errors.student_id}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="grant_id">Grant *</Label>
                                                <Select
                                                    value={assignForm.data.grant_id}
                                                    onValueChange={(value) => assignForm.setData('grant_id', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select grant" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {grants.filter(g => g.is_active).map((grant) => (
                                                            <SelectItem key={grant.id} value={grant.id.toString()}>
                                                                {grant.name} ({grant.formatted_value})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {assignForm.errors.grant_id && <p className="text-sm text-red-500">{assignForm.errors.grant_id}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="school_year">School Year *</Label>
                                                <Input
                                                    id="school_year"
                                                    value={assignForm.data.school_year}
                                                    onChange={(e) => assignForm.setData('school_year', e.target.value)}
                                                    placeholder="e.g., 2025-2026"
                                                />
                                                {assignForm.errors.school_year && <p className="text-sm text-red-500">{assignForm.errors.school_year}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={assignForm.data.notes}
                                                    onChange={(e) => assignForm.setData('notes', e.target.value)}
                                                    placeholder="Optional notes..."
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={assignForm.processing}>
                                                Assign
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

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
                                label="Grant"
                                value={grantFilter}
                                options={grantOptions}
                                onChange={(value) => {
                                    setGrantFilter(value);
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
                            <FilterDropdown
                                label="Status"
                                value={statusFilter}
                                options={statusOptions}
                                onChange={(value) => {
                                    setStatusFilter(value);
                                    setTimeout(handleFilter, 0);
                                }}
                            />
                            <Button onClick={handleFilter} className="mt-auto">
                                Apply Filters
                            </Button>
                        </FilterBar>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Grant</TableHead>
                                        <TableHead>School Year</TableHead>
                                        <TableHead className="text-right">Discount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recipients.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No grant recipients found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recipients.data.map((recipient) => (
                                            <TableRow key={recipient.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{recipient.student.full_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {recipient.student.lrn}
                                                            {recipient.student.program && ` • ${recipient.student.program}`}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{recipient.grant.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {recipient.grant.formatted_value}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{recipient.school_year}</TableCell>
                                                <TableCell className="text-right text-green-600 font-medium">
                                                    {formatCurrency(recipient.discount_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={recipient.status === 'active' ? 'default' : 'secondary'}>
                                                        {recipient.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveRecipient(recipient.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {recipients.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {recipients.data.length} of {recipients.total} recipients
                                </p>
                                <div className="flex gap-2">
                                    {recipients.links.map((link, index) => (
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
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Grant Modal (separate from create) */}
            <Dialog open={isGrantModalOpen && !!editingGrant} onOpenChange={(open) => {
                if (!open) {
                    setIsGrantModalOpen(false);
                    setEditingGrant(null);
                    grantForm.reset();
                }
            }}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleEditGrant}>
                        <DialogHeader>
                            <DialogTitle>Edit Grant</DialogTitle>
                            <DialogDescription>
                                Update the grant details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={grantForm.data.name}
                                    onChange={(e) => grantForm.setData('name', e.target.value)}
                                    placeholder="e.g., Academic Scholarship"
                                />
                                {grantForm.errors.name && <p className="text-sm text-red-500">{grantForm.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-code">Code</Label>
                                <Input
                                    id="edit-code"
                                    value={grantForm.data.code}
                                    onChange={(e) => grantForm.setData('code', e.target.value)}
                                    placeholder="e.g., ACAD-SCH"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-type">Discount Type *</Label>
                                    <Select
                                        value={grantForm.data.type}
                                        onValueChange={(value) => grantForm.setData('type', value as 'fixed' | 'percentage')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-value">Value *</Label>
                                    <Input
                                        id="edit-value"
                                        type="number"
                                        step="0.01"
                                        value={grantForm.data.value}
                                        onChange={(e) => grantForm.setData('value', e.target.value)}
                                        placeholder={grantForm.data.type === 'percentage' ? 'e.g., 50' : 'e.g., 5000'}
                                    />
                                    {grantForm.errors.value && <p className="text-sm text-red-500">{grantForm.errors.value}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={grantForm.data.description}
                                    onChange={(e) => grantForm.setData('description', e.target.value)}
                                    placeholder="Brief description of the grant..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={grantForm.processing}>
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AccountingLayout>
    );
}
