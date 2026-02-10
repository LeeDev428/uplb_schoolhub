import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LibrarianLayout from '@/layouts/librarian/librarian-layout';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Book {
    id: number;
    isbn: string | null;
    title: string;
    author: string;
    publisher: string | null;
    publication_year: number | null;
    category: string | null;
    shelf_location: string | null;
    quantity: number;
    available_quantity: number;
    description: string | null;
    is_available: boolean;
}

interface Props {
    books: {
        data: Book[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        availability?: string;
    };
}

export default function BooksIndex({ books, categories, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [availability, setAvailability] = useState(filters.availability || 'all');

    const form = useForm({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publication_year: '',
        category: '',
        shelf_location: '',
        quantity: '1',
        description: '',
    });

    const navigate = (params: Record<string, string>) => {
        router.get('/librarian/books', params, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, category, availability });
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        navigate({ search, category: value, availability });
    };

    const handleAvailabilityChange = (value: string) => {
        setAvailability(value);
        navigate({ search, category, availability: value });
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('all');
        setAvailability('all');
        router.get('/librarian/books');
    };

    const openCreateModal = () => {
        form.reset();
        setEditingBook(null);
        setIsModalOpen(true);
    };

    const openEditModal = (book: Book) => {
        setEditingBook(book);
        form.setData({
            isbn: book.isbn || '',
            title: book.title,
            author: book.author,
            publisher: book.publisher || '',
            publication_year: book.publication_year ? String(book.publication_year) : '',
            category: book.category || '',
            shelf_location: book.shelf_location || '',
            quantity: String(book.quantity),
            description: book.description || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBook) {
            form.put(`/librarian/books/${editingBook.id}`, {
                onSuccess: () => { setIsModalOpen(false); form.reset(); },
            });
        } else {
            form.post('/librarian/books', {
                onSuccess: () => { setIsModalOpen(false); form.reset(); },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/librarian/books/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <LibrarianLayout>
            <Head title="Books" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Books</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage library book inventory</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Book
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <FilterBar
                            onReset={resetFilters}
                            showReset={!!(search || category !== 'all' || availability !== 'all')}
                        >
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search books..." />
                            <FilterDropdown
                                label="Category"
                                value={category}
                                onChange={handleCategoryChange}
                                options={categories.map((c) => ({ value: c, label: c }))}
                                placeholder="All Categories"
                            />
                            <FilterDropdown
                                label="Availability"
                                value={availability}
                                onChange={handleAvailabilityChange}
                                options={[
                                    { value: 'available', label: 'Available' },
                                    { value: 'unavailable', label: 'Unavailable' },
                                ]}
                                placeholder="All"
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">Title</th>
                                        <th className="p-3 text-left font-semibold">Author</th>
                                        <th className="p-3 text-left font-semibold">ISBN</th>
                                        <th className="p-3 text-left font-semibold">Category</th>
                                        <th className="p-3 text-center font-semibold">Qty</th>
                                        <th className="p-3 text-center font-semibold">Available</th>
                                        <th className="p-3 text-center font-semibold">Location</th>
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-gray-500">No books found.</td>
                                        </tr>
                                    ) : (
                                        books.data.map((book) => (
                                            <tr key={book.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{book.title}</td>
                                                <td className="p-3 text-sm">{book.author}</td>
                                                <td className="p-3 font-mono text-sm">{book.isbn || '-'}</td>
                                                <td className="p-3 text-sm">{book.category || '-'}</td>
                                                <td className="p-3 text-center">{book.quantity}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                                                        book.available_quantity > 0
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {book.available_quantity}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm">{book.shelf_location || '-'}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => openEditModal(book)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(book)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination data={books} />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                                {form.errors.title && <p className="text-sm text-red-500">{form.errors.title}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Author *</Label>
                                <Input value={form.data.author} onChange={(e) => form.setData('author', e.target.value)} required />
                                {form.errors.author && <p className="text-sm text-red-500">{form.errors.author}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>ISBN</Label>
                                    <Input value={form.data.isbn} onChange={(e) => form.setData('isbn', e.target.value)} />
                                    {form.errors.isbn && <p className="text-sm text-red-500">{form.errors.isbn}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Quantity *</Label>
                                    <Input type="number" min="1" value={form.data.quantity} onChange={(e) => form.setData('quantity', e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Publisher</Label>
                                    <Input value={form.data.publisher} onChange={(e) => form.setData('publisher', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input type="number" value={form.data.publication_year} onChange={(e) => form.setData('publication_year', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} placeholder="e.g., Fiction" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Shelf Location</Label>
                                    <Input value={form.data.shelf_location} onChange={(e) => form.setData('shelf_location', e.target.value)} placeholder="e.g., A-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={2} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Book"
                description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
                confirmLabel="Delete"
                variant="danger"
            />
        </LibrarianLayout>
    );
}
