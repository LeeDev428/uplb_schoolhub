import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { FilterBar } from '@/components/filters/filter-bar';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { ImportButton } from '@/components/import-button';
import { AlertTriangle, Eye, MoreHorizontal, Users, DollarSign, TrendingUp, Clock, Plus, Upload, CreditCard } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
    program?: string;
    year_level?: string;
    section?: string;
    department?: string;
}

interface Grant {
    name: string;
    discount: string;
}

interface StudentAccount {
    id: number;
    student: Student;
    school_year: string;
    total_amount: string;
    grant_discount: string;
    total_paid: string;
    balance: string;
    is_overdue: boolean;
    due_date?: string;
    payment_status: string;
    payments_count: number;
    grants: Grant[];
}

interface PaginatedAccounts {
    data: StudentAccount[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Stats {
    total_students: number;
    total_receivables: number;
    total_collected: number;
    total_balance: number;
    overdue_count: number;
    fully_paid: number;
}

interface Department {
    id: number;
    name: string;
    code: string;
    classification: string;
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    department: string;
    classification: string;
}

interface Props {
    accounts: PaginatedAccounts;
    schoolYears: string[];
    stats: Stats;
    departments: Department[];
    classifications: string[];
    yearLevels: YearLevel[];
    filters: {
        search?: string;
        status?: string;
        school_year?: string;
        department_id?: string;
        classification?: string;
    };
}

export default function StudentAccounts({ accounts, schoolYears, stats, departments = [], classifications = [], yearLevels = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');
    const [departmentId, setDepartmentId] = useState(filters.department_id || 'all');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [isOverdueDialogOpen, setIsOverdueDialogOpen] = useState(false);

    const overdueForm = useForm({
        classification: 'all',
        department_id: 'all',
        year_level: 'all',
        overdue_date: new Date().toISOString().split('T')[0],
    });

    const handleFilter = () => {
        router.get('/accounting/student-accounts', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            school_year: schoolYear !== 'all' ? schoolYear : undefined,
            department_id: departmentId !== 'all' ? departmentId : undefined,
            classification: classification !== 'all' ? classification : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setSchoolYear('all');
        setDepartmentId('all');
        setClassification('all');
        router.get('/accounting/student-accounts');
    };

    const handleBulkOverdue = (e: React.FormEvent) => {
        e.preventDefault();
        overdueForm.post('/accounting/student-accounts/bulk-mark-overdue', {
            onSuccess: () => {
                setIsOverdueDialogOpen(false);
                overdueForm.reset();
            },
        });
    };
    const handleMarkOverdue = (id: number) => {
        if (confirm('Are you sure you want to mark this account as overdue?')) {
            router.post(`/accounting/student-accounts/${id}/mark-overdue`);
        }
    };

    const handleClearOverdue = (id: number) => {
        if (confirm('Are you sure you want to clear the overdue status?')) {
            router.post(`/accounting/student-accounts/${id}/clear-overdue`);
        }
    };

    const formatCurrency = (amount: string | number) => {
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStatusBadge = (account: StudentAccount) => {
        if (account.is_overdue) {
            return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Overdue</Badge>;
        }
        switch (account.payment_status) {
            case 'paid':
                return <Badge className="bg-green-500">Fully Paid</Badge>;
            case 'partial':
                return <Badge className="bg-yellow-500">Partial</Badge>;
            default:
                return <Badge variant="outline">Unpaid</Badge>;
        }
    };

    const statusOptions = [
        { value: 'paid', label: 'Fully Paid' },
        { value: 'partial', label: 'Partial' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'overdue', label: 'Overdue' },
    ];

    const schoolYearOptions = schoolYears.map(year => ({
        value: year,
        label: year,
    }));

    const departmentOptions = departments.map(dept => ({
        value: dept.id.toString(),
        label: dept.name,
    }));

    const classificationOptions = classifications.map(cls => ({
        value: cls,
        label: cls,
    }));

    return (
        <AccountingLayout>
            <Head title="Student Accounts" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Student Accounts"
                        description="View and manage student fee accounts, balances, and payment status"
                    />
                    <div className="flex gap-2">
                        {/* <ImportButton
                            importUrl="/accounting/student-accounts/import"
                            templateUrl="/accounting/student-accounts/template"
                            title="Import Student Accounts"
                            description="Upload an Excel or CSV file to import student fee accounts."
                        /> */}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_students}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.fully_paid} fully paid
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_receivables)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total assessed fees
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_collected)}</div>
                            <p className="text-xs text-muted-foreground">
                                {((stats.total_collected / stats.total_receivables) * 100 || 0).toFixed(1)}% collection rate
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue_count}</div>
                            <p className="text-xs text-muted-foreground">
                                Accounts requiring attention
                            </p>
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
                        placeholder="Search by name or LRN..."
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
                        label="School Year"
                        value={schoolYear}
                        options={schoolYearOptions}
                        onChange={(value) => {
                            setSchoolYear(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <FilterDropdown
                        label="Department"
                        value={departmentId}
                        options={departmentOptions}
                        onChange={(value) => {
                            setDepartmentId(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <FilterDropdown
                        label="Classification"
                        value={classification}
                        options={classificationOptions}
                        onChange={(value) => {
                            setClassification(value);
                            setTimeout(handleFilter, 0);
                        }}
                    />
                    <Button onClick={handleFilter} className="mt-auto">
                        Apply Filters
                    </Button>
                    
                    {/* Mark Overdue Button and Dialog */}
                    <Dialog open={isOverdueDialogOpen} onOpenChange={setIsOverdueDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="mt-auto">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Mark Overdue
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <form onSubmit={handleBulkOverdue}>
                                <DialogHeader className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertTriangle className="h-8 w-8 text-red-600" />
                                        </div>
                                    </div>
                                    <DialogTitle className="text-red-600 text-xl">Mark Overdue Balances</DialogTitle>
                                    <DialogDescription className="text-amber-600 flex items-center justify-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        Once marked overdue, this action cannot be undone.
                                        <AlertTriangle className="h-4 w-4" />
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Classification</Label>
                                        <Select
                                            value={overdueForm.data.classification}
                                            onValueChange={(value) => overdueForm.setData('classification', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Classifications" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Classifications</SelectItem>
                                                {classifications.map((classification) => (
                                                    <SelectItem key={classification} value={classification}>
                                                        {classification}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Department</Label>
                                        <Select
                                            value={overdueForm.data.department_id}
                                            onValueChange={(value) => overdueForm.setData('department_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Departments" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Year Level</Label>
                                        <Select
                                            value={overdueForm.data.year_level}
                                            onValueChange={(value) => overdueForm.setData('year_level', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Years" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Years</SelectItem>
                                                {yearLevels.map((yl) => (
                                                    <SelectItem key={yl.id} value={yl.name}>
                                                        {yl.name} ({yl.classification})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Set Overdue Date</Label>
                                        <Input
                                            type="date"
                                            value={overdueForm.data.overdue_date}
                                            onChange={(e) => overdueForm.setData('overdue_date', e.target.value)}
                                        />
                                        {overdueForm.errors.overdue_date && (
                                            <p className="text-sm text-red-500">{overdueForm.errors.overdue_date}</p>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter className="flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={overdueForm.processing}
                                        className="flex-1"
                                    >
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Confirm Overdue
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOverdueDialogOpen(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </FilterBar>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>School Year</TableHead>
                                <TableHead className="text-right">Total Fees</TableHead>
                                <TableHead className="text-right">Discount</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No student accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                accounts.data.map((account) => (
                                    <TableRow key={account.id} className={account.is_overdue ? 'bg-red-50' : ''}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{account.student.full_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {account.student.lrn}
                                                    {account.student.program && ` • ${account.student.program}`}
                                                    {account.student.year_level && ` - ${account.student.year_level}`}
                                                </div>
                                                {account.grants.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {account.grants.map((grant, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {grant.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{account.school_year}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(account.total_amount)}</TableCell>
                                        <TableCell className="text-right">
                                            {parseFloat(account.grant_discount) > 0 ? (
                                                <span className="text-green-600">-{formatCurrency(account.grant_discount)}</span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">{formatCurrency(account.total_paid)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {parseFloat(account.balance) > 0 ? (
                                                <span className="text-red-600">{formatCurrency(account.balance)}</span>
                                            ) : (
                                                <span className="text-green-600">{formatCurrency(0)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(account)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/accounting/student-accounts/${account.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/accounting/payments/process/${account.student.id}`}>
                                                            <DollarSign className="h-4 w-4 mr-2" />
                                                            Process Payment
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {!account.is_overdue && parseFloat(account.balance) > 0 && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleMarkOverdue(account.id)}
                                                            className="text-red-600"
                                                        >
                                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                                            Mark Overdue
                                                        </DropdownMenuItem>
                                                    )}
                                                    {account.is_overdue && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleClearOverdue(account.id)}
                                                            className="text-green-600"
                                                        >
                                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                                            Clear Overdue
                                                        </DropdownMenuItem>
                                                    )}
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
                {accounts.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {accounts.data.length} of {accounts.total} accounts
                        </p>
                        <div className="flex gap-2">
                            {accounts.links.map((link, index) => (
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
        </AccountingLayout>
    );
}
