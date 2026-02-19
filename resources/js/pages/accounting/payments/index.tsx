import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ArrowRight, DollarSign, Users, AlertCircle, Wallet, TrendingDown, CreditCard, Receipt } from 'lucide-react';
import { StudentPhoto } from '@/components/ui/student-photo';

interface Student {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    lrn: string;
    student_photo_url: string | null;
    program: string | null;
    year_level: string | null;
    section: string | null;
    department: string | null;
    enrollment_status: string;
    current_balance: number;
    previous_balance: number;
    total_balance: number;
    status: string;
}

interface PaginatedStudents {
    data: Student[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    students: PaginatedStudents;
    filters: {
        search?: string;
        enrollment_status?: string;
    };
    statistics: {
        original_tuition: number;
        grant_deduction: number;
        total_tuition_fees: number;
        previous_balance: number;
        total_balance_to_pay: number;
    };
}

function formatCurrency(amount: number): string {
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getStatusBadge(status: string) {
    const configs: Record<string, { label: string; className: string }> = {
        approved: { label: 'Cleared', className: 'bg-green-100 text-green-700' },
        fully_paid: { label: 'Fully Paid', className: 'bg-blue-100 text-blue-700' },
        overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    };
    const config = configs[status] || configs.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
}

export default function PaymentProcessingIndex({ students, filters, statistics }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [enrollmentStatus, setEnrollmentStatus] = useState(filters.enrollment_status || 'all');

    const handleSearch = () => {
        router.get('/accounting/payments', {
            search: search || undefined,
            enrollment_status: enrollmentStatus !== 'all' ? enrollmentStatus : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Calculate stats
    const stats = {
        total: students.data.length,
        withBalance: students.data.filter(s => s.total_balance > 0).length,
        overdue: students.data.filter(s => s.status === 'overdue').length,
        cleared: students.data.filter(s => s.status === 'approved' || s.status === 'fully_paid').length,
    };

    return (
        <AccountingLayout>
            <Head title="Payment Processing" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <PageHeader
                    title="Payment Processing"
                    description="Process student payments and manage fee accounts. Click a student to view details and process payments."
                />

                {/* Financial Summary Statistics */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Original Tuition</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(statistics.original_tuition)}</div>
                            <p className="text-xs text-muted-foreground">Before grant deductions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Grant Deduction</CardTitle>
                            <TrendingDown className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">-{formatCurrency(statistics.grant_deduction)}</div>
                            <p className="text-xs text-muted-foreground">Total scholarships & grants</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tuition Fees</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(statistics.total_tuition_fees)}</div>
                            <p className="text-xs text-muted-foreground">After grant deductions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Previous Balance</CardTitle>
                            <CreditCard className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{formatCurrency(statistics.previous_balance)}</div>
                            <p className="text-xs text-muted-foreground">From previous years</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Balance to Pay</CardTitle>
                            <DollarSign className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(statistics.total_balance_to_pay)}</div>
                            <p className="text-xs text-muted-foreground">Overall outstanding balance</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{students.total}</div>
                            <p className="text-xs text-muted-foreground">Ready for processing</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">With Balance</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.withBalance}</div>
                            <p className="text-xs text-muted-foreground">Students with outstanding fees</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <p className="text-xs text-muted-foreground">Need immediate attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cleared</CardTitle>
                            <Users className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.cleared}</div>
                            <p className="text-xs text-muted-foreground">Fully paid or cleared</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Search Student</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, LRN, or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label className="text-sm font-medium mb-2 block">Status</label>
                                <Select
                                    value={enrollmentStatus}
                                    onValueChange={setEnrollmentStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="approved">Cleared</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Click on a student to view payment details and process payments
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Student No.</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Year & Section</TableHead>
                                        <TableHead className="text-right">Current Balance</TableHead>
                                        <TableHead className="text-right">Previous Balance</TableHead>
                                        <TableHead className="text-right">Total Balance</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                No students found. Try adjusting your search filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.data.map((student) => (
                                            <TableRow 
                                                key={student.id}
                                                className="cursor-pointer hover:bg-accent transition-colors"
                                                onClick={() => router.visit(`/accounting/payments/process/${student.id}`)}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <StudentPhoto
                                                            src={student.student_photo_url}
                                                            firstName={student.first_name}
                                                            lastName={student.last_name}
                                                            size="sm"
                                                        />
                                                        <div>
                                                            {student.full_name}
                                                            {student.department && (
                                                                <div className="text-xs text-muted-foreground">{student.department}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{student.lrn}</TableCell>
                                                <TableCell>{student.program || '-'}</TableCell>
                                                <TableCell>
                                                    {student.year_level} {student.section && `- ${student.section}`}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={student.current_balance > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                                                        {formatCurrency(student.current_balance)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={student.previous_balance > 0 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                                                        {formatCurrency(student.previous_balance)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={student.total_balance > 0 ? 'font-bold' : 'text-muted-foreground'}>
                                                        {formatCurrency(student.total_balance)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(student.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {students.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {students.data.length} of {students.total} students
                                </div>
                                <div className="flex gap-2">
                                    {students.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AccountingLayout>
    );
}
