import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { index as feesIndex, store as storeFor, update as updateFee, destroy as destroyFee } from '@/routes/accounting/fees';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useForm } from '@inertiajs/react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    lrn: string;
    program?: string;
    year_level?: string;
    section?: string;
    full_name: string;
}

interface StudentFee {
    id: number;
    student_id: number;
    school_year: string;
    registration_fee: string;
    tuition_fee: string;
    misc_fee: string;
    books_fee: string;
    other_fees: string;
    total_amount: string;
    total_paid: string;
    balance: string;
    created_at: string;
    student: Student;
}

interface PaginatedFees {
    data: StudentFee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    fees: PaginatedFees;
    filters: {
        search?: string;
        status?: string;
        school_year?: string;
    };
    schoolYears: string[];
    students: Student[];
}

export default function AccountingFees({ fees, filters, schoolYears, students = [] }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        student_id: '',
        school_year: '',
        registration_fee: '0',
        tuition_fee: '0',
        misc_fee: '0',
        books_fee: '0',
        other_fees: '0',
    });

    const handleSearch = () => {
        router.get(feesIndex.url(), {
            search,
            status: status !== 'all' ? status : undefined,
            school_year: schoolYear !== 'all' ? schoolYear : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCreateFee = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeFor.url(), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEditFee = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFee) {
            put(updateFee.url({ fee: selectedFee.id }), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedFee(null);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this fee record?')) {
            router.delete(destroyFee.url({ fee: id }));
        }
    };

    const openEditModal = (fee: StudentFee) => {
        setSelectedFee(fee);
        setData({
            student_id: fee.student_id.toString(),
            school_year: fee.school_year,
            registration_fee: fee.registration_fee,
            tuition_fee: fee.tuition_fee,
            misc_fee: fee.misc_fee,
            books_fee: fee.books_fee,
            other_fees: fee.other_fees,
        });
        setIsEditModalOpen(true);
    };

    const calculateTotal = () => {
        return (
            parseFloat(data.registration_fee || '0') +
            parseFloat(data.tuition_fee || '0') +
            parseFloat(data.misc_fee || '0') +
            parseFloat(data.books_fee || '0') +
            parseFloat(data.other_fees || '0')
        ).toFixed(2);
    };

    const getPaymentStatusBadge = (fee: StudentFee) => {
        const balance = parseFloat(fee.balance);
        const totalPaid = parseFloat(fee.total_paid);

        if (balance <= 0) {
            return <Badge className="bg-green-500">Fully Paid</Badge>;
        } else if (totalPaid > 0) {
            return <Badge className="bg-yellow-500">Partial</Badge>;
        } else {
            return <Badge variant="destructive">Unpaid</Badge>;
        }
    };

    const formatCurrency = (amount: string | number) => {
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <AccountingLayout>
            <Head title="Student Fees" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Student Fees Management"
                    description="Manage student fee assessments and track payment status"
                    action={
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Fee Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <form onSubmit={handleCreateFee}>
                                    <DialogHeader>
                                        <DialogTitle>Create Fee Record</DialogTitle>
                                        <DialogDescription>
                                            Add a new fee assessment for a student
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="student_id">Student *</Label>
                                            <Select
                                                value={data.student_id}
                                                onValueChange={(value) => setData('student_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select student" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id.toString()}>
                                                            {student.full_name} - {student.lrn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.student_id && (
                                                <p className="text-sm text-red-500">{errors.student_id}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="school_year">School Year *</Label>
                                            <Input
                                                id="school_year"
                                                placeholder="e.g., 2025-2026"
                                                value={data.school_year}
                                                onChange={(e) => setData('school_year', e.target.value)}
                                            />
                                            {errors.school_year && (
                                                <p className="text-sm text-red-500">{errors.school_year}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="registration_fee">Registration Fee *</Label>
                                                <Input
                                                    id="registration_fee"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.registration_fee}
                                                    onChange={(e) => setData('registration_fee', e.target.value)}
                                                />
                                                {errors.registration_fee && (
                                                    <p className="text-sm text-red-500">{errors.registration_fee}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="tuition_fee">Tuition Fee *</Label>
                                                <Input
                                                    id="tuition_fee"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.tuition_fee}
                                                    onChange={(e) => setData('tuition_fee', e.target.value)}
                                                />
                                                {errors.tuition_fee && (
                                                    <p className="text-sm text-red-500">{errors.tuition_fee}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="misc_fee">Miscellaneous Fee *</Label>
                                                <Input
                                                    id="misc_fee"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.misc_fee}
                                                    onChange={(e) => setData('misc_fee', e.target.value)}
                                                />
                                                {errors.misc_fee && (
                                                    <p className="text-sm text-red-500">{errors.misc_fee}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="books_fee">Books Fee *</Label>
                                                <Input
                                                    id="books_fee"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.books_fee}
                                                    onChange={(e) => setData('books_fee', e.target.value)}
                                                />
                                                {errors.books_fee && (
                                                    <p className="text-sm text-red-500">{errors.books_fee}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="other_fees">Other Fees</Label>
                                                <Input
                                                    id="other_fees"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.other_fees}
                                                    onChange={(e) => setData('other_fees', e.target.value)}
                                                />
                                                {errors.other_fees && (
                                                    <p className="text-sm text-red-500">{errors.other_fees}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Total Amount</Label>
                                                <Input
                                                    value={formatCurrency(calculateTotal())}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateModalOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Create Fee Record
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {/* Filters */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search by student name or LRN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 sm:w-48">
                        <Label htmlFor="status">Payment Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="paid">Fully Paid</SelectItem>
                                <SelectItem value="partial">Partial Payment</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 sm:w-48">
                        <Label htmlFor="schoolYear">School Year</Label>
                        <Select value={schoolYear} onValueChange={setSchoolYear}>
                            <SelectTrigger id="schoolYear">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                {schoolYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleSearch}>
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>LRN</TableHead>
                                <TableHead>School Year</TableHead>
                                <TableHead className="text-right">Registration</TableHead>
                                <TableHead className="text-right">Tuition</TableHead>
                                <TableHead className="text-right">Misc</TableHead>
                                <TableHead className="text-right">Books</TableHead>
                                <TableHead className="text-right">Other</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No fee records found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fees.data.map((fee) => (
                                    <TableRow key={fee.id}>
                                        <TableCell className="font-medium">
                                            {fee.student.full_name}
                                        </TableCell>
                                        <TableCell>{fee.student.lrn}</TableCell>
                                        <TableCell>{fee.school_year}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(fee.registration_fee)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(fee.tuition_fee)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(fee.misc_fee)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(fee.books_fee)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(fee.other_fees)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(fee.total_amount)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">
                                            {formatCurrency(fee.total_paid)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(fee.balance)}
                                        </TableCell>
                                        <TableCell>{getPaymentStatusBadge(fee)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(fee)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(fee.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {fees.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {fees.data.length} of {fees.total} records
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: fees.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === fees.current_page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get(feesIndex.url({ query: { page } }))}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleEditFee}>
                            <DialogHeader>
                                <DialogTitle>Edit Fee Record</DialogTitle>
                                <DialogDescription>
                                    Update fee assessment for {selectedFee?.student.full_name}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_registration_fee">Registration Fee *</Label>
                                        <Input
                                            id="edit_registration_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.registration_fee}
                                            onChange={(e) => setData('registration_fee', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_tuition_fee">Tuition Fee *</Label>
                                        <Input
                                            id="edit_tuition_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.tuition_fee}
                                            onChange={(e) => setData('tuition_fee', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_misc_fee">Miscellaneous Fee *</Label>
                                        <Input
                                            id="edit_misc_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.misc_fee}
                                            onChange={(e) => setData('misc_fee', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_books_fee">Books Fee *</Label>
                                        <Input
                                            id="edit_books_fee"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.books_fee}
                                            onChange={(e) => setData('books_fee', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_other_fees">Other Fees</Label>
                                        <Input
                                            id="edit_other_fees"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.other_fees}
                                            onChange={(e) => setData('other_fees', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Total Amount</Label>
                                        <Input
                                            value={formatCurrency(calculateTotal())}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Fee Record
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AccountingLayout>
    );
}
