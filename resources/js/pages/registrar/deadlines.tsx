import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { Plus, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deadlines',
        href: '/registrar/deadlines',
    },
];

interface Deadline {
    id: number;
    name: string;
    description: string | null;
    classification: 'K-12' | 'College';
    deadline_date: string;
    deadline_time: string | null;
    applies_to: 'all' | 'new_enrollee' | 'transferee' | 'returning';
    send_reminder: boolean;
    reminder_days_before: number | null;
    is_active: boolean;
}

interface Props {
    deadlines: {
        data: Deadline[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    filters: {
        search?: string;
        classification?: string;
        applies_to?: string;
        status?: string;
    };
}

export default function Deadlines({ deadlines, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deadlineToDelete, setDeadlineToDelete] = useState<Deadline | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [appliesTo, setAppliesTo] = useState(filters.applies_to || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        name: '',
        description: '',
        classification: 'K-12' as 'K-12' | 'College',
        deadline_date: '',
        deadline_time: '',
        applies_to: 'all' as 'all' | 'new_enrollee' | 'transferee' | 'returning',
        send_reminder: false,
        reminder_days_before: 3,
        is_active: true,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/registrar/deadlines', {
            search: value,
            classification,
            applies_to: appliesTo,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        router.get('/registrar/deadlines', {
            search,
            classification: value,
            applies_to: appliesTo,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleAppliesToChange = (value: string) => {
        setAppliesTo(value);
        router.get('/registrar/deadlines', {
            search,
            classification,
            applies_to: value,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/registrar/deadlines', {
            search,
            classification,
            applies_to: appliesTo,
            status: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openCreateModal = () => {
        form.reset();
        setEditingDeadline(null);
        setIsModalOpen(true);
    };

    const openEditModal = (deadline: Deadline) => {
        setEditingDeadline(deadline);
        form.setData({
            name: deadline.name,
            description: deadline.description || '',
            classification: deadline.classification,
            deadline_date: deadline.deadline_date,
            deadline_time: deadline.deadline_time || '',
            applies_to: deadline.applies_to,
            send_reminder: deadline.send_reminder,
            reminder_days_before: deadline.reminder_days_before || 3,
            is_active: deadline.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDeadline) {
            form.put(`/registrar/deadlines/${editingDeadline.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/registrar/deadlines', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = (deadline: Deadline) => {
        setDeadlineToDelete(deadline);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (deadlineToDelete) {
            router.delete(`/registrar/deadlines/${deadlineToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setDeadlineToDelete(null);
                },
            });
        }
    };

    const getAppliesToBadge = (appliesTo: string) => {
        const variants: Record<string, { label: string; variant: any }> = {
            all: { label: 'All Students', variant: 'default' },
            new_enrollee: { label: 'New Enrollees', variant: 'secondary' },
            transferee: { label: 'Transferees', variant: 'outline' },
            returning: { label: 'Returning', variant: 'outline' },
        };
        const config = variants[appliesTo] || variants.all;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Deadlines" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Academic Deadlines
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage important academic dates and deadlines
                        </p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Deadline
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <FilterBar>
                            <SearchBar
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search deadlines..."
                            />
                            <FilterDropdown
                                label="Classification"
                                value={classification}
                                onChange={handleClassificationChange}
                                options={[
                                    { value: 'all', label: 'All Classifications' },
                                    { value: 'K-12', label: 'K-12' },
                                    { value: 'College', label: 'College' },
                                ]}
                            />
                            <FilterDropdown
                                label="Applies To"
                                value={appliesTo}
                                onChange={handleAppliesToChange}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'all', label: 'All Students' },
                                    { value: 'new_enrollee', label: 'New Enrollees' },
                                    { value: 'transferee', label: 'Transferees' },
                                    { value: 'returning', label: 'Returning' },
                                ]}
                            />
                            <FilterDropdown
                                label="Status"
                                value={status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'all', label: 'All Status' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left text-sm font-semibold">Name</th>
                                        <th className="p-3 text-left text-sm font-semibold">Classification</th>
                                        <th className="p-3 text-left text-sm font-semibold">Deadline</th>
                                        <th className="p-3 text-left text-sm font-semibold">Applies To</th>
                                        <th className="p-3 text-left text-sm font-semibold">Reminder</th>
                                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                                        <th className="p-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deadlines.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                No deadlines found
                                            </td>
                                        </tr>
                                    ) : (
                                        deadlines.data.map((deadline) => (
                                            <tr key={deadline.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{deadline.name}</p>
                                                        {deadline.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {deadline.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={deadline.classification === 'K-12' ? 'secondary' : 'default'}>
                                                        {deadline.classification}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(deadline.deadline_date)}
                                                        </div>
                                                        {deadline.deadline_time && (
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                {deadline.deadline_time}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {getAppliesToBadge(deadline.applies_to)}
                                                </td>
                                                <td className="p-3">
                                                    {deadline.send_reminder ? (
                                                        <span className="text-sm">
                                                            {deadline.reminder_days_before} days before
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">None</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={deadline.is_active ? 'default' : 'secondary'}>
                                                        {deadline.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(deadline)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => confirmDelete(deadline)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {deadlines.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination data={deadlines} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDeadline ? 'Edit Deadline' : 'Create New Deadline'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="name">Deadline Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., Enrollment Document Submission"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="mt-1 text-sm text-destructive">{form.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Additional details about this deadline..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="classification">Classification *</Label>
                                    <Select
                                        value={form.data.classification}
                                        onValueChange={(value: 'K-12' | 'College') =>
                                            form.setData('classification', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="K-12">K-12</SelectItem>
                                            <SelectItem value="College">College</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="applies_to">Applies To *</Label>
                                    <Select
                                        value={form.data.applies_to}
                                        onValueChange={(value: any) =>
                                            form.setData('applies_to', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Students</SelectItem>
                                            <SelectItem value="new_enrollee">New Enrollees</SelectItem>
                                            <SelectItem value="transferee">Transferees</SelectItem>
                                            <SelectItem value="returning">Returning</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="deadline_date">Deadline Date *</Label>
                                    <Input
                                        id="deadline_date"
                                        type="date"
                                        value={form.data.deadline_date}
                                        onChange={(e) => form.setData('deadline_date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="deadline_time">Deadline Time</Label>
                                    <Input
                                        id="deadline_time"
                                        type="time"
                                        value={form.data.deadline_time}
                                        onChange={(e) => form.setData('deadline_time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="send_reminder">Send Reminder</Label>
                                    <Switch
                                        id="send_reminder"
                                        checked={form.data.send_reminder}
                                        onCheckedChange={(checked) =>
                                            form.setData('send_reminder', checked)
                                        }
                                    />
                                </div>

                                {form.data.send_reminder && (
                                    <div>
                                        <Label htmlFor="reminder_days_before">Days Before Deadline</Label>
                                        <Input
                                            id="reminder_days_before"
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={form.data.reminder_days_before}
                                            onChange={(e) =>
                                                form.setData('reminder_days_before', parseInt(e.target.value))
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <Label htmlFor="is_active">Active Status</Label>
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', checked)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editingDeadline ? 'Update' : 'Create'} Deadline
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Deadline"
                description={`Are you sure you want to delete "${deadlineToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                variant="danger"
            />
        </RegistrarLayout>
    );
}
