import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    CheckCircle2,
    Circle,
    Search,
    Filter,
    DollarSign,
    Users,
    Clock,
    AlertCircle,
} from 'lucide-react';
import AccountingLayout from '@/layouts/accounting/accounting-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface EnrollmentClearance {
    id: number;
    accounting_clearance: boolean;
    accounting_cleared_at: string | null;
    accounting_notes: string | null;
}

interface Student {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    lrn: string;
    program: string;
    year_level: string;
    section: string | null;
    student_photo_url: string | null;
    enrollment_clearance: EnrollmentClearance | null;
    total_fees: number;
    total_paid: number;
    balance: number;
    is_fully_paid: boolean;
}

interface Props {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    programs: string[];
    yearLevels: string[];
    stats: {
        total: number;
        pending: number;
        cleared: number;
    };
    filters: {
        search?: string;
        status?: string;
        program?: string;
        year_level?: string;
    };
}

export default function ClearanceIndex({ students, programs, yearLevels, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [program, setProgram] = useState(filters.program || 'all');
    const [yearLevel, setYearLevel] = useState(filters.year_level || 'all');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; student: Student | null; action: 'clear' | 'unclear' }>({
        open: false,
        student: null,
        action: 'clear',
    });
    const [bulkAction, setBulkAction] = useState<'clear' | 'unclear' | null>(null);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getFullName = (student: Student) => {
        let name = `${student.first_name}`;
        if (student.middle_name) name += ` ${student.middle_name}`;
        name += ` ${student.last_name}`;
        if (student.suffix) name += ` ${student.suffix}`;
        return name;
    };

    const getInitials = (student: Student) => {
        return `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
    };

    const handleSearch = () => {
        router.get('/accounting/clearance', {
            search,
            status: status !== 'all' ? status : undefined,
            program: program !== 'all' ? program : undefined,
            year_level: yearLevel !== 'all' ? yearLevel : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params: Record<string, string | undefined> = {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            program: program !== 'all' ? program : undefined,
            year_level: yearLevel !== 'all' ? yearLevel : undefined,
        };
        
        if (value === 'all') {
            delete params[key];
        } else {
            params[key] = value;
        }
        
        router.get('/accounting/clearance', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearanceToggle = (student: Student, newStatus: boolean) => {
        router.put(`/accounting/clearance/${student.id}`, {
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(newStatus 
                    ? `${getFullName(student)} cleared successfully` 
                    : `Clearance removed for ${getFullName(student)}`);
                setConfirmDialog({ open: false, student: null, action: 'clear' });
            },
            onError: () => {
                toast.error('Failed to update clearance status');
            },
        });
    };

    const handleBulkClear = (status: boolean) => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        router.post('/accounting/clearance/bulk-clear', {
            student_ids: selectedStudents,
            status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${selectedStudents.length} students updated successfully`);
                setSelectedStudents([]);
                setBulkAction(null);
            },
            onError: () => {
                toast.error('Failed to update students');
            },
        });
    };

    const toggleSelectAll = () => {
        if (selectedStudents.length === students.data.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.data.map(s => s.id));
        }
    };

    const toggleSelect = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    return (
        <AccountingLayout>
            <Head title="Student Clearance" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Student Clearance</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage accounting clearance for student enrollment
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Clearance</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cleared</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.cleared}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, LRN, email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <Select value={status} onValueChange={(v) => { setStatus(v); handleFilterChange('status', v); }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cleared">Cleared</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={program} onValueChange={(v) => { setProgram(v); handleFilterChange('program', v); }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {programs.map((p) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={yearLevel} onValueChange={(v) => { setYearLevel(v); handleFilterChange('year_level', v); }}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Year Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Year Levels</SelectItem>
                                    {yearLevels.map((y) => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedStudents.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    {selectedStudents.length} student(s) selected
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedStudents([])}
                                    >
                                        Clear Selection
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={() => setBulkAction('clear')}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Clear Selected
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Students Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedStudents.length === students.data.length && students.data.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Program / Year</TableHead>
                                    <TableHead className="text-right">Total Fees</TableHead>
                                    <TableHead className="text-right">Total Paid</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead className="text-center">Clearance Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.data.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={() => toggleSelect(student.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={student.student_photo_url || undefined} />
                                                        <AvatarFallback>{getInitials(student)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{getFullName(student)}</div>
                                                        <div className="text-sm text-muted-foreground">LRN: {student.lrn}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{student.program}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {student.year_level}{student.section ? ` - ${student.section}` : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatMoney(student.total_fees)}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600">
                                                {formatMoney(student.total_paid)}
                                            </TableCell>
                                            <TableCell className={cn(
                                                "text-right font-medium",
                                                student.balance > 0 ? "text-red-600" : "text-green-600"
                                            )}>
                                                {formatMoney(student.balance)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.enrollment_clearance?.accounting_clearance ? (
                                                    <Badge className="bg-green-100 text-green-700">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Cleared
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.enrollment_clearance?.accounting_clearance ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setConfirmDialog({ open: true, student, action: 'unclear' })}
                                                    >
                                                        Remove Clearance
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setConfirmDialog({ open: true, student, action: 'clear' })}
                                                    >
                                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                                        Clear
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <Pagination data={students} />
            </div>

            {/* Confirm Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmDialog.action === 'clear' ? 'Clear Student?' : 'Remove Clearance?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.action === 'clear' ? (
                                <>
                                    Are you sure you want to clear <strong>{confirmDialog.student && getFullName(confirmDialog.student)}</strong> for accounting?
                                    {confirmDialog.student && confirmDialog.student.balance > 0 && (
                                        <span className="block mt-2 text-orange-600">
                                            <AlertCircle className="inline mr-1 h-4 w-4" />
                                            Note: This student still has an outstanding balance of {formatMoney(confirmDialog.student.balance)}.
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    Are you sure you want to remove accounting clearance for <strong>{confirmDialog.student && getFullName(confirmDialog.student)}</strong>?
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmDialog.student && handleClearanceToggle(confirmDialog.student, confirmDialog.action === 'clear')}
                        >
                            {confirmDialog.action === 'clear' ? 'Clear Student' : 'Remove Clearance'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Action Dialog */}
            <AlertDialog open={bulkAction !== null} onOpenChange={(open) => !open && setBulkAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Clear {selectedStudents.length} Students?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear accounting for {selectedStudents.length} selected students?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkClear(true)}>
                            Clear All Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AccountingLayout>
    );
}
