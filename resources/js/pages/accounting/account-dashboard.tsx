import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
    DollarSign,
    FileText,
    CreditCard,
    TrendingUp,
    RefreshCw,
    Download,
    Search,
    Clock,
} from 'lucide-react';
import { SearchBar } from '@/components/filters/search-bar';
import { ExportButton } from '@/components/export-button';

interface Student {
    id: number;
    full_name: string;
    lrn: string;
    program?: string;
    year_level?: string;
    section?: string;
    gender?: string;
    phone?: string;
    address?: string;
    student_id?: string;
    student_photo_url?: string | null;
    school_year?: string;
    enrollment_status?: string;
    total_fees?: number;
    total_paid?: number;
    total_balance?: number;
}

interface Transaction {
    id: number;
    date: string;
    time: string;
    type: 'Fee' | 'Document';
    or_number: string;
    mode: string;
    reference: string | null;
    amount: number;
}

interface Stats {
    total_fees_processed: number;
    total_document_processed: number;
    total_amount_processed: number;
    overall_amount_processed: number;
}

interface DailyCollection {
    day: number;
    date: string;
    amount: number;
    time: string;
}

interface PaymentSummary {
    cash: number;
    gcash: number;
    bank: number;
}

interface Props {
    student?: Student;
    stats: Stats;
    transactions: Transaction[];
    dailyCollections: DailyCollection[];
    paymentSummary: PaymentSummary;
    students: Student[];
    selectedMonth: number;
    selectedYear: number;
    months: { value: number; label: string }[];
    years: number[];
    filters: {
        search?: string;
        student_id?: string;
        month?: number;
        year?: number;
    };
}

export default function AccountDashboard({
    student,
    stats,
    transactions,
    dailyCollections,
    paymentSummary,
    students,
    selectedMonth,
    selectedYear,
    months,
    years,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [month, setMonth] = useState(selectedMonth.toString());
    const [year, setYear] = useState(selectedYear.toString());
    const [studentId, setStudentId] = useState(filters.student_id || '');

    const formatCurrency = (amount: number) => {
        return `₱ ${(amount || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleFilter = () => {
        router.get('/accounting/account-dashboard', {
            search: search || undefined,
            student_id: studentId || undefined,
            month: month !== 'all' ? month : undefined,
            year: year || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setMonth(selectedMonth.toString());
        setYear(selectedYear.toString());
        setStudentId('');
        router.get('/accounting/account-dashboard');
    };

    // Find max for chart
    const maxAmount = Math.max(...(dailyCollections?.map(d => d.amount) || [1]), 1);

    return (
        <AccountingLayout>
            <Head title="Account Dashboard" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <PageHeader
                        title="Account Dashboard"
                        description={student ? `Account Dashboard: ${student.full_name}` : 'Select a student to view their account'}
                    />
                    <div className="flex gap-2">
                        <ExportButton
                            exportUrl="/accounting/account-dashboard/export"
                            filters={{ student_id: student?.id, month: selectedMonth, year: selectedYear }}
                            buttonText="Export Data"
                        />
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Student Profile Card - shown when student is selected */}
                {student && (
                    <Card className="border-l-4" style={{ borderLeftColor: '#2563eb' }}>
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-6">
                                <Avatar className="h-20 w-20 ring-4 ring-blue-100 flex-shrink-0">
                                    <AvatarImage src={student.student_photo_url ?? undefined} alt={student.full_name} />
                                    <AvatarFallback className="text-xl font-semibold bg-blue-600 text-white">
                                        {student.full_name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
                                            <p className="text-sm text-muted-foreground font-mono">Student No.: {student.lrn}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {student.program && <Badge variant="secondary">{student.program}</Badge>}
                                                {student.year_level && <Badge variant="outline">{student.year_level}{student.section ? ` - ${student.section}` : ''}</Badge>}
                                                {student.school_year && <Badge variant="outline">SY {student.school_year}</Badge>}
                                                {student.enrollment_status && (
                                                    <Badge className={student.enrollment_status === 'enrolled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                        {student.enrollment_status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {/* Balance summary */}
                                        {(student.total_fees ?? 0) > 0 && (
                                            <div className="text-right min-w-[200px]">
                                                <p className="text-sm text-muted-foreground mb-1">Payment Progress</p>
                                                <Progress
                                                    value={Math.min(((student.total_paid ?? 0) / (student.total_fees ?? 1)) * 100, 100)}
                                                    className="h-2 mb-2"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Paid: {formatCurrency(student.total_paid ?? 0)}</span>
                                                    <span>Total: {formatCurrency(student.total_fees ?? 0)}</span>
                                                </div>
                                                {(student.total_balance ?? 0) > 0 ? (
                                                    <p className="mt-1 text-sm font-semibold text-red-600">
                                                        Balance: {formatCurrency(student.total_balance ?? 0)}
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-sm font-semibold text-green-600">Fully Paid ✓</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Student Selection and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-2">
                                <Label>Search Student</Label>
                                <Select value={studentId} onValueChange={(value) => {
                                    setStudentId(value);
                                    setTimeout(handleFilter, 0);
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a student..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(students || []).map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.full_name} - {s.lrn}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Month</Label>
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(months || []).map((m) => (
                                            <SelectItem key={m.value} value={m.value.toString()}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Year</Label>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(years || [new Date().getFullYear()]).map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 items-end">
                                <Button onClick={handleFilter} className="flex-1">
                                    <Search className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats?.total_fees_processed ?? 0)}</div>
                            <p className="text-sm text-muted-foreground">Total Fees Process</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats?.total_document_processed ?? 0)}</div>
                            <p className="text-sm text-muted-foreground">Total Document Process</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-teal-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats?.total_amount_processed ?? 0)}</div>
                            <p className="text-sm text-muted-foreground">Total Amount Process</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-pink-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats?.overall_amount_processed ?? 0)}</div>
                            <p className="text-sm text-muted-foreground">Overall Amount Process</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Collection Chart */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Daily Collection (8:00 AM - 5:00 PM)
                            </CardTitle>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {months?.find(m => m.value === parseInt(month))?.label} {year}
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-1 h-56 pt-4 overflow-x-auto">
                            {(dailyCollections || []).map((day, index) => {
                                const heightPercent = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                                return (
                                    <div key={index} className="flex flex-col items-center gap-1 min-w-[60px]">
                                        <div 
                                            className="w-10 bg-blue-600 rounded-t-md transition-all hover:bg-blue-700 cursor-pointer min-h-[4px]"
                                            style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                            title={`Day ${day.day}: ${formatCurrency(day.amount)}`}
                                        />
                                        <div className="text-center">
                                            <p className="text-xs font-medium">Day {day.day}</p>
                                            <p className="text-xs text-blue-600">{formatCurrency(day.amount)}</p>
                                            <p className="text-xs text-muted-foreground">({day.time})</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            ⏱ Business Hours: 8:00 AM - 5:00 PM
                        </p>
                    </CardContent>
                </Card>

                {/* Transaction History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-800 hover:bg-slate-800">
                                        <TableHead className="text-white">Date & Time</TableHead>
                                        <TableHead className="text-white">Type</TableHead>
                                        <TableHead className="text-white">OR No.</TableHead>
                                        <TableHead className="text-white">Mode</TableHead>
                                        <TableHead className="text-white">Reference</TableHead>
                                        <TableHead className="text-white text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(transactions || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No transactions found for the selected period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (transactions || []).map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell>
                                                    {tx.date} {tx.time}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={tx.type === 'Fee' ? 'default' : 'secondary'} className={
                                                        tx.type === 'Fee' ? 'bg-blue-500' : 'bg-green-500'
                                                    }>
                                                        {tx.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono">{tx.or_number}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={
                                                        tx.mode === 'CASH' ? 'border-green-500 text-green-600' :
                                                        tx.mode === 'GCASH' ? 'border-blue-500 text-blue-600' :
                                                        'border-purple-500 text-purple-600'
                                                    }>
                                                        {tx.mode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{tx.reference || 'N/A'}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(tx.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Summary by Mode */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Summary by Mode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-8">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">CASH:</span>
                                <span className="text-green-600 font-bold">{formatCurrency(paymentSummary?.cash ?? 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">GCASH:</span>
                                <span className="text-blue-600 font-bold">{formatCurrency(paymentSummary?.gcash ?? 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">BANK:</span>
                                <span className="text-purple-600 font-bold">{formatCurrency(paymentSummary?.bank ?? 0)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AccountingLayout>
    );
}
