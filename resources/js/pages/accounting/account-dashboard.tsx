import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountingLayout from '@/layouts/accounting-layout';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { FilterBar } from '@/components/filters/filter-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { DateRangePicker } from '@/components/filters/date-range-picker';
import { ExportButton } from '@/components/export-button';
import type { DateRange } from 'react-day-picker';

interface FilterOption {
    value: string;
    label: string;
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
    total_transactions: number;
    fee_transactions: number;
    document_transactions: number;
    collection_rate: number;
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
    stats: Stats;
    transactions: Transaction[];
    dailyCollections: DailyCollection[];
    paymentSummary: PaymentSummary;
    departments: FilterOption[];
    programs: FilterOption[];
    yearLevels: FilterOption[];
    sections: FilterOption[];
    selectedMonth: number;
    selectedYear: number;
    months: { value: number; label: string }[];
    years: number[];
    filters: {
        classification?: string;
        department_id?: string;
        program?: string;
        year_level?: string;
        section?: string;
        date_from?: string;
        date_to?: string;
        month?: number;
        year?: number;
    };
}

export default function AccountDashboard({
    stats,
    transactions,
    dailyCollections,
    paymentSummary,
    departments = [],
    programs = [],
    yearLevels = [],
    sections = [],
    selectedMonth,
    selectedYear,
    months,
    years,
    filters,
}: Props) {
    const [classification, setClassification] = useState(filters.classification || '');
    const [departmentId, setDepartmentId]     = useState(filters.department_id || '');
    const [program, setProgram]               = useState(filters.program || '');
    const [yearLevel, setYearLevel]           = useState(filters.year_level || '');
    const [section, setSection]               = useState(filters.section || '');
    const [dateRange, setDateRange]           = useState<DateRange | undefined>(
        filters.date_from && filters.date_to
            ? { from: new Date(filters.date_from), to: new Date(filters.date_to) }
            : undefined
    );

    const formatCurrency = (amount: number) => {
        return `₱ ${(amount || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleFilter = () => {
        router.get('/accounting/account-dashboard', {
            classification: classification || undefined,
            department_id:  departmentId || undefined,
            program:        program || undefined,
            year_level:     yearLevel || undefined,
            section:        section || undefined,
            date_from: dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined,
            date_to:   dateRange?.to   ? dateRange.to.toISOString().split('T')[0]   : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setClassification('');
        setDepartmentId('');
        setProgram('');
        setYearLevel('');
        setSection('');
        setDateRange(undefined);
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
                        description="Payment transactions across all students for the selected period"
                    />
                    <div className="flex gap-2">
                        <ExportButton
                            exportUrl="/accounting/account-dashboard/export"
                            filters={{ classification, department_id: departmentId, program, year_level: yearLevel, section }}
                            buttonText="Export Data"
                        />
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <FilterBar onReset={handleReset}>
                    <FilterDropdown
                        label="Classification"
                        value={classification || 'all'}
                        options={[{ value: 'K-12', label: 'K-12' }, { value: 'College', label: 'College' }]}
                        onChange={v => setClassification(v === 'all' ? '' : v)}
                        placeholder="All Classifications"
                    />
                    <FilterDropdown
                        label="Department"
                        value={departmentId || 'all'}
                        options={departments}
                        onChange={v => setDepartmentId(v === 'all' ? '' : v)}
                        placeholder="All Departments"
                    />
                    <FilterDropdown
                        label="Program"
                        value={program || 'all'}
                        options={programs}
                        onChange={v => setProgram(v === 'all' ? '' : v)}
                        placeholder="All Programs"
                    />
                    <FilterDropdown
                        label="Year Level"
                        value={yearLevel || 'all'}
                        options={yearLevels}
                        onChange={v => setYearLevel(v === 'all' ? '' : v)}
                        placeholder="All Year Levels"
                    />
                    <FilterDropdown
                        label="Section"
                        value={section || 'all'}
                        options={sections}
                        onChange={v => setSection(v === 'all' ? '' : v)}
                        placeholder="All Sections"
                    />
                    <DateRangePicker
                        label="Date Range"
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Pick a date range"
                    />
                    <div className="flex items-end">
                        <Button size="sm" onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Apply Filters
                        </Button>
                    </div>
                </FilterBar>

                {/* Stats Cards — 8 cards in 2 rows of 4 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Row 1: Counts */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_transactions ?? 0}</div>
                            <p className="text-sm text-muted-foreground">Total Transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.fee_transactions ?? 0}</div>
                            <p className="text-sm text-muted-foreground">Fee Transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.document_transactions ?? 0}</div>
                            <p className="text-sm text-muted-foreground">Document Transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.collection_rate ?? 0}%</div>
                            <p className="text-sm text-muted-foreground">Collection Rate</p>
                        </CardContent>
                    </Card>

                    {/* Row 2: Amounts */}
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
                            <div className="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-violet-600" />
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
                            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
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
                            {filters.date_from && filters.date_to
                                ? `${filters.date_from} – ${filters.date_to}`
                                : `${months?.find(m => m.value === selectedMonth)?.label ?? ''} ${selectedYear}`}
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
