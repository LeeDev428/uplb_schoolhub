import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AccountingLayout from '@/layouts/accounting-layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FullyPaidStudent {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    lrn: string;
    gender: string;
    classification?: string;
    department?: string;
    program?: string;
    year_level?: string;
    section?: string;
    student_photo_url: string | null;
    total_amount: number;
    total_paid: number;
    balance: number;
    payment_status: string;
    school_year: string;
}

interface Props {
    fullyPaidMale: FullyPaidStudent[];
    fullyPaidFemale: FullyPaidStudent[];
}

export default function ExamApprovalIndex({
    fullyPaidMale,
    fullyPaidFemale,
}: Props) {
    const [fpYearLevel, setFpYearLevel] = useState('all');
    const [fpSection, setFpSection] = useState('all');
    const [fpProgram, setFpProgram] = useState('all');
    const [fpClassification, setFpClassification] = useState('all');
    const [fpDepartment, setFpDepartment] = useState('all');

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

    // Derive unique filter values from all paid students
    const allPaid = [...fullyPaidMale, ...fullyPaidFemale];
    const fpUnique = <T,>(key: keyof FullyPaidStudent) =>
        [...new Set(allPaid.map(s => s[key] as T).filter(Boolean))] as T[];

    const applyFpFilters = (list: FullyPaidStudent[]) => list.filter(s =>
        (fpYearLevel === 'all' || s.year_level === fpYearLevel) &&
        (fpSection === 'all' || s.section === fpSection) &&
        (fpProgram === 'all' || s.program === fpProgram) &&
        (fpClassification === 'all' || s.classification === fpClassification) &&
        (fpDepartment === 'all' || s.department === fpDepartment)
    );

    const filteredMale = applyFpFilters(fullyPaidMale);
    const filteredFemale = applyFpFilters(fullyPaidFemale);

    const classificationLabels: Record<string, string> = {
        new: 'New',
        transferee: 'Transferee',
        returnee: 'Returnee',
    };

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
                                    {/* <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Approval
                                    </Button> */}
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
                                                        const student = eligibleStudents.find(s => s.id.toString() === value);
                                                        if (student) {
                                                            createForm.setData('required_amount', student.balance);
                                                            createForm.setData('school_year', student.school_year);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select eligible student" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {eligibleStudents.map((student) => (
                                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                                {student.full_name} - Paid: {formatCurrency(student.total_paid)}
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

            {/* Eligible Students (Non-Overdue) — Male / Female Tables */}
            <div className="space-y-4 p-6 pt-0">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Eligible Students (Excluding Overdue)</h2>
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                        {fullyPaidMale.length + fullyPaidFemale.length} total
                    </Badge>
                </div>

                {/* Fully paid filters */}
                <div className="flex flex-wrap gap-2">
                    <Select value={fpClassification} onValueChange={setFpClassification}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Classification" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {fpUnique<string>('classification').map(v => (
                                <SelectItem key={v} value={v}>{classificationLabels[v] ?? v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={fpDepartment} onValueChange={setFpDepartment}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {fpUnique<string>('department').map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={fpProgram} onValueChange={setFpProgram}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Program" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Programs</SelectItem>
                            {fpUnique<string>('program').map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={fpYearLevel} onValueChange={setFpYearLevel}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Year Level" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Year Levels</SelectItem>
                            {fpUnique<string>('year_level').map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={fpSection} onValueChange={setFpSection}>
                        <SelectTrigger className="w-36"><SelectValue placeholder="Section" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            {fpUnique<string>('section').map(v => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(fpClassification !== 'all' || fpDepartment !== 'all' || fpProgram !== 'all' || fpYearLevel !== 'all' || fpSection !== 'all') && (
                        <Button variant="ghost" size="sm" onClick={() => { setFpClassification('all'); setFpDepartment('all'); setFpProgram('all'); setFpYearLevel('all'); setFpSection('all'); }}>
                            Clear filters
                        </Button>
                    )}
                </div>

                <Tabs defaultValue="male">
                    <TabsList>
                        <TabsTrigger value="male">Male ({filteredMale.length})</TabsTrigger>
                        <TabsTrigger value="female">Female ({filteredFemale.length})</TabsTrigger>
                    </TabsList>

                    {(['male', 'female'] as const).map((gender) => {
                        const students = gender === 'male' ? filteredMale : filteredFemale;
                        return (
                            <TabsContent key={gender} value={gender}>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base capitalize">{gender} Students</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-10">#</TableHead>
                                                    <TableHead>Student</TableHead>
                                                    <TableHead>LRN</TableHead>
                                                    <TableHead>Classification</TableHead>
                                                    <TableHead>Department</TableHead>
                                                    <TableHead>Program</TableHead>
                                                    <TableHead>Year / Section</TableHead>
                                                    <TableHead className="text-right">Total Paid</TableHead>
                                                    <TableHead className="text-right">Balance</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>School Year</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {students.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                                                            No eligible {gender} students.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    students.map((student, idx) => (
                                                        <TableRow key={student.id}>
                                                            <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={student.student_photo_url ?? undefined} />
                                                                        <AvatarFallback className="text-xs">{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="font-medium text-sm">{student.full_name}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm font-mono text-muted-foreground">{student.lrn}</TableCell>
                                                            <TableCell className="text-sm">
                                                                <Badge variant="outline" className="capitalize text-xs">{classificationLabels[student.classification ?? ''] ?? student.classification ?? '—'}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm">{student.department || '—'}</TableCell>
                                                            <TableCell className="text-sm">{student.program || '—'}</TableCell>
                                                            <TableCell className="text-sm">{[student.year_level, student.section].filter(Boolean).join(' – ') || '—'}</TableCell>
                                                            <TableCell className="text-right text-green-600 font-medium text-sm">{formatCurrency(student.total_paid)}</TableCell>
                                                            <TableCell className={`text-right font-medium text-sm ${student.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>{student.balance > 0 ? formatCurrency(student.balance) : 'Paid'}</TableCell>
                                                            <TableCell>
                                                                {student.payment_status === 'paid' ? (
                                                                    <Badge className="bg-green-500 text-xs">Fully Paid</Badge>
                                                                ) : student.payment_status === 'partial' ? (
                                                                    <Badge className="bg-yellow-500 text-xs">Partial</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs">Unpaid</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm">{student.school_year}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
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
