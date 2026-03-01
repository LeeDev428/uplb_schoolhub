import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Scale,
    Search,
    Filter,
    TrendingUp,
    Users,
    CalendarDays,
    AlertTriangle,
    Eye,
    X,
} from 'lucide-react';

interface StudentInfo {
    id: number;
    full_name: string;
    lrn: string;
    program: string | null;
    year_level: string | null;
}

interface AdjusterInfo {
    name: string;
    role: string;
}

interface Adjustment {
    id: number;
    student: StudentInfo | null;
    adjuster: AdjusterInfo | null;
    amount: number;
    reason: string;
    notes: string | null;
    school_year: string | null;
    fee_total_after: number | null;
    fee_balance_after: number | null;
    created_at: string;
    created_at_raw: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    adjustments: PaginatedData<Adjustment>;
    filters: {
        search?: string;
        school_year?: string;
        date_from?: string;
        date_to?: string;
    };
    schoolYears: string[];
    stats: {
        total_adjustments: number;
        total_amount_added: number;
        adjusters_count: number;
        today_count: number;
    };
}

function formatCurrency(amount: number | null): string {
    if (amount === null || amount === undefined) return 'N/A';
    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function AuditLogs({ adjustments, filters, schoolYears, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [schoolYear, setSchoolYear] = useState(filters.school_year || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedAdjustment, setSelectedAdjustment] = useState<Adjustment | null>(null);

    const handleSearch = () => {
        router.get('/owner/audit-logs', {
            search: search || undefined,
            school_year: schoolYear !== 'all' ? schoolYear : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSchoolYear('all');
        setDateFrom('');
        setDateTo('');
        router.get('/owner/audit-logs', {}, { preserveState: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <OwnerLayout>
            <Head title="Audit Logs - Balance Adjustments" />

            <div className="space-y-6 p-6">
                <PageHeader heading="Audit Logs" description="Monitor all balance adjustments made by Super Accounting staff. Every balance addition is permanently logged here." />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-2.5">
                                    <Scale className="h-5 w-5 text-amber-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Adjustments</p>
                                    <p className="text-2xl font-bold">{stats.total_adjustments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-100 p-2.5">
                                    <TrendingUp className="h-5 w-5 text-red-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Amount Added</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_amount_added)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2.5">
                                    <Users className="h-5 w-5 text-blue-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Staff Involved</p>
                                    <p className="text-2xl font-bold">{stats.adjusters_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2.5">
                                    <CalendarDays className="h-5 w-5 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Today</p>
                                    <p className="text-2xl font-bold">{stats.today_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Label className="text-xs text-muted-foreground">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Student name, LRN, staff name, or reason..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="w-40">
                                <Label className="text-xs text-muted-foreground">School Year</Label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {schoolYears.map((sy) => (
                                            <SelectItem key={sy} value={sy}>{sy}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-40">
                                <Label className="text-xs text-muted-foreground">From</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="w-40">
                                <Label className="text-xs text-muted-foreground">To</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSearch} size="sm">
                                <Filter className="h-4 w-4 mr-1" />
                                Filter
                            </Button>
                            {(filters.search || filters.school_year || filters.date_from || filters.date_to) && (
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    <X className="h-4 w-4 mr-1" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            Balance Adjustment Logs
                        </CardTitle>
                        <CardDescription>
                            All balance additions by Super Accounting staff are permanently recorded below.
                            Showing {adjustments.data.length} of {adjustments.total} records.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {adjustments.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                                <p className="text-lg font-medium">No balance adjustments found</p>
                                <p className="text-sm">Balance adjustments made by Super Accounting will appear here.</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>School Year</TableHead>
                                            <TableHead className="text-right">Amount Added</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Adjusted By</TableHead>
                                            <TableHead className="text-center">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {adjustments.data.map((adj) => (
                                            <TableRow key={adj.id} className="hover:bg-amber-50/50">
                                                <TableCell className="text-sm whitespace-nowrap">
                                                    {adj.created_at}
                                                </TableCell>
                                                <TableCell>
                                                    {adj.student ? (
                                                        <div>
                                                            <p className="font-medium">{adj.student.full_name}</p>
                                                            <p className="text-xs text-muted-foreground">{adj.student.lrn}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{adj.school_year || '—'}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="font-semibold text-red-600">+{formatCurrency(adj.amount)}</span>
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="truncate text-sm">{adj.reason}</p>
                                                </TableCell>
                                                <TableCell>
                                                    {adj.adjuster ? (
                                                        <div>
                                                            <p className="text-sm font-medium">{adj.adjuster.name}</p>
                                                            <Badge variant="secondary" className="text-xs">{adj.adjuster.role}</Badge>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSelectedAdjustment(adj)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[500px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Balance Adjustment Details</DialogTitle>
                                                                <DialogDescription>
                                                                    Full details for this balance adjustment entry.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Student</p>
                                                                        <p className="font-medium">{adj.student?.full_name || '—'}</p>
                                                                        <p className="text-xs text-muted-foreground">{adj.student?.lrn}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Program / Year</p>
                                                                        <p className="text-sm">{adj.student?.program || '—'}</p>
                                                                        <p className="text-xs text-muted-foreground">{adj.student?.year_level}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Amount Added</p>
                                                                        <p className="text-xl font-bold text-red-600">+{formatCurrency(adj.amount)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">School Year</p>
                                                                        <p className="font-medium">{adj.school_year || '—'}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">Reason</p>
                                                                    <p className="text-sm bg-muted rounded-md p-2.5">{adj.reason}</p>
                                                                </div>
                                                                {adj.notes && (
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground">Notes</p>
                                                                        <p className="text-sm bg-muted rounded-md p-2.5">{adj.notes}</p>
                                                                    </div>
                                                                )}
                                                                {(adj.fee_total_after !== null || adj.fee_balance_after !== null) && (
                                                                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Fee Total (After)</p>
                                                                            <p className="font-medium">{formatCurrency(adj.fee_total_after)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Balance (After)</p>
                                                                            <p className="font-medium text-red-600">{formatCurrency(adj.fee_balance_after)}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="border-t pt-3">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Adjusted By</p>
                                                                            <p className="font-medium">{adj.adjuster?.name || '—'}</p>
                                                                            <Badge variant="secondary" className="text-xs mt-1">{adj.adjuster?.role}</Badge>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Date & Time</p>
                                                                            <p className="text-sm">{adj.created_at}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {adjustments.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Page {adjustments.current_page} of {adjustments.last_page}
                                        </p>
                                        <div className="flex gap-1">
                                            {adjustments.links.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className="min-w-[36px]"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </OwnerLayout>
    );
}
