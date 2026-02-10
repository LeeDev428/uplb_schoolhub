import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LibrarianLayout from '@/layouts/librarian/librarian-layout';
import { Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';

interface BookOption {
    id: number;
    title: string;
    author: string;
    isbn: string | null;
    available_quantity: number;
}

interface StudentOption {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
}

interface Transaction {
    id: number;
    transaction_type: string;
    borrow_date: string;
    due_date: string;
    return_date: string | null;
    status: string;
    penalty_amount: string;
    penalty_paid: boolean;
    notes: string | null;
    book?: { id: number; title: string; author: string; isbn: string | null } | null;
    student?: { first_name: string; last_name: string; lrn: string } | null;
    librarian?: { name: string } | null;
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    books: BookOption[];
    students: StudentOption[];
    filters: {
        search?: string;
        status?: string;
        type?: string;
    };
}

const STATUS_COLORS: Record<string, string> = {
    borrowed: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    lost: 'bg-gray-100 text-gray-700',
};

export default function TransactionsIndex({ transactions, books, students, filters }: Props) {
    const [isBorrowOpen, setIsBorrowOpen] = useState(false);
    const [returnTarget, setReturnTarget] = useState<Transaction | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [type, setType] = useState(filters.type || 'all');

    const borrowForm = useForm({
        book_id: '',
        student_id: '',
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
    });

    const returnForm = useForm({
        return_date: new Date().toISOString().split('T')[0],
        status: 'returned' as string,
        penalty_amount: '0',
        penalty_paid: false,
        notes: '',
    });

    const navigate = (params: Record<string, string>) => {
        router.get('/librarian/transactions', params, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, status, type });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ search, status: value, type });
    };

    const handleTypeChange = (value: string) => {
        setType(value);
        navigate({ search, status, type: value });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setType('all');
        router.get('/librarian/transactions');
    };

    const handleBorrow = (e: React.FormEvent) => {
        e.preventDefault();
        borrowForm.post('/librarian/transactions', {
            onSuccess: () => { setIsBorrowOpen(false); borrowForm.reset(); },
        });
    };

    const handleReturn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!returnTarget) return;
        returnForm.put(`/librarian/transactions/${returnTarget.id}`, {
            onSuccess: () => { setReturnTarget(null); returnForm.reset(); },
        });
    };

    const openReturnModal = (tx: Transaction) => {
        setReturnTarget(tx);
        returnForm.setData({
            return_date: new Date().toISOString().split('T')[0],
            status: 'returned',
            penalty_amount: tx.penalty_amount || '0',
            penalty_paid: tx.penalty_paid,
            notes: tx.notes || '',
        });
    };

    return (
        <LibrarianLayout>
            <Head title="Transactions" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Transactions</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage book borrows and returns</p>
                    </div>
                    <Button onClick={() => setIsBorrowOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Borrow
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <FilterBar
                            onReset={resetFilters}
                            showReset={!!(search || status !== 'all' || type !== 'all')}
                        >
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search..." />
                            <FilterDropdown
                                label="Status"
                                value={status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'borrowed', label: 'Borrowed' },
                                    { value: 'returned', label: 'Returned' },
                                    { value: 'overdue', label: 'Overdue' },
                                    { value: 'lost', label: 'Lost' },
                                ]}
                            />
                            <FilterDropdown
                                label="Type"
                                value={type}
                                onChange={handleTypeChange}
                                options={[
                                    { value: 'borrow', label: 'Borrow' },
                                    { value: 'return', label: 'Return' },
                                ]}
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">Book</th>
                                        <th className="p-3 text-left font-semibold">Student</th>
                                        <th className="p-3 text-center font-semibold">Type</th>
                                        <th className="p-3 text-center font-semibold">Borrow</th>
                                        <th className="p-3 text-center font-semibold">Due</th>
                                        <th className="p-3 text-center font-semibold">Returned</th>
                                        <th className="p-3 text-center font-semibold">Status</th>
                                        <th className="p-3 text-center font-semibold">Penalty</th>
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-gray-500">No transactions found.</td>
                                        </tr>
                                    ) : (
                                        transactions.data.map((tx) => (
                                            <tr key={tx.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium text-sm">{tx.book?.title || '-'}</td>
                                                <td className="p-3 text-sm">
                                                    {tx.student ? `${tx.student.last_name}, ${tx.student.first_name}` : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">{tx.transaction_type}</span>
                                                </td>
                                                <td className="p-3 text-center text-sm">{new Date(tx.borrow_date).toLocaleDateString()}</td>
                                                <td className="p-3 text-center text-sm">{new Date(tx.due_date).toLocaleDateString()}</td>
                                                <td className="p-3 text-center text-sm">
                                                    {tx.return_date ? new Date(tx.return_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${STATUS_COLORS[tx.status] || ''}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm">
                                                    {parseFloat(tx.penalty_amount) > 0 ? `₱${tx.penalty_amount}` : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {tx.status === 'borrowed' && (
                                                        <Button size="sm" variant="outline" onClick={() => openReturnModal(tx)}>
                                                            <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                            Return
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination data={transactions} />
                    </CardContent>
                </Card>
            </div>

            {/* Borrow Modal */}
            <Dialog open={isBorrowOpen} onOpenChange={setIsBorrowOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>New Book Borrow</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBorrow}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Book *</Label>
                                <Select value={borrowForm.data.book_id} onValueChange={(v) => borrowForm.setData('book_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                                    <SelectContent>
                                        {books.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.title} — {b.author} (Avail: {b.available_quantity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {borrowForm.errors.book_id && <p className="text-sm text-red-500">{borrowForm.errors.book_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Student *</Label>
                                <Select value={borrowForm.data.student_id} onValueChange={(v) => borrowForm.setData('student_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.last_name}, {s.first_name} ({s.lrn})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {borrowForm.errors.student_id && <p className="text-sm text-red-500">{borrowForm.errors.student_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Borrow Date *</Label>
                                    <Input type="date" value={borrowForm.data.borrow_date} onChange={(e) => borrowForm.setData('borrow_date', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date *</Label>
                                    <Input type="date" value={borrowForm.data.due_date} onChange={(e) => borrowForm.setData('due_date', e.target.value)} required />
                                    {borrowForm.errors.due_date && <p className="text-sm text-red-500">{borrowForm.errors.due_date}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea value={borrowForm.data.notes} onChange={(e) => borrowForm.setData('notes', e.target.value)} rows={2} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsBorrowOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={borrowForm.processing}>
                                {borrowForm.processing ? 'Processing...' : 'Borrow'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Return Modal */}
            <Dialog open={!!returnTarget} onOpenChange={(open) => !open && setReturnTarget(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Return Book</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReturn}>
                        <div className="space-y-4 py-4">
                            {returnTarget && (
                                <div className="rounded-lg border bg-gray-50 p-3">
                                    <p className="text-sm font-medium">{returnTarget.book?.title}</p>
                                    <p className="text-xs text-gray-500">
                                        Borrowed by: {returnTarget.student?.last_name}, {returnTarget.student?.first_name}
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Return Date *</Label>
                                <Input type="date" value={returnForm.data.return_date} onChange={(e) => returnForm.setData('return_date', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={returnForm.data.status} onValueChange={(v) => returnForm.setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="returned">Returned</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Penalty Amount (₱)</Label>
                                <Input type="number" min="0" step="0.01" value={returnForm.data.penalty_amount} onChange={(e) => returnForm.setData('penalty_amount', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea value={returnForm.data.notes} onChange={(e) => returnForm.setData('notes', e.target.value)} rows={2} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setReturnTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={returnForm.processing}>
                                {returnForm.processing ? 'Processing...' : 'Process Return'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </LibrarianLayout>
    );
}
