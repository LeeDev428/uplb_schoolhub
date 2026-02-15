import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FilterBar } from '@/components/filters/filter-bar';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { AlertTriangle, Eye, MoreHorizontal, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
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

interface Props {
    accounts: PaginatedAccounts;
    schoolYears: string[];
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        school_year?: string;
        department_id?: string;
    };
}

export default function StudentAccounts({ accounts, schoolYears, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');

    const handleFilter = () => {
        router.get('/accounting/student-accounts', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            school_year: schoolYear !== 'all' ? schoolYear : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setSchoolYear('all');
        router.get('/accounting/student-accounts');
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

    return (
        <AccountingLayout>
            <Head title="Student Accounts" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="Student Accounts"
                    description="View and manage student fee accounts, balances, and payment status"
                />

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
                                                        <Link href={`/accounting/payments?student_id=${account.student.id}`}>
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
