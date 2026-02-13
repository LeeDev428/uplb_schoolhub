import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pagination } from '@/components/ui/pagination';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Edit, Trash2, MoreHorizontal, Pin, PinOff, Eye, EyeOff, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    target_audience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
    department_id: number | null;
    created_by: number;
    published_at: string | null;
    expires_at: string | null;
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
    department?: Department | null;
    creator?: User;
}

interface Props {
    announcements: {
        data: Announcement[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    departments: Department[];
    filters: {
        search?: string;
        priority?: string;
        target_audience?: string;
        status?: string;
    };
}

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const audienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'Students' },
    { value: 'teachers', label: 'Teachers' },
    { value: 'parents', label: 'Parents' },
    { value: 'staff', label: 'Staff' },
];

const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        low: { label: 'Low', variant: 'outline' },
        normal: { label: 'Normal', variant: 'secondary' },
        high: { label: 'High', variant: 'default' },
        urgent: { label: 'Urgent', variant: 'destructive' },
    };
    const config = variants[priority] || variants.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getAudienceBadge = (audience: string) => {
    const labels: Record<string, string> = {
        all: 'All Users',
        students: 'Students',
        teachers: 'Teachers',
        parents: 'Parents',
        staff: 'Staff',
    };
    return <Badge variant="outline">{labels[audience] || audience}</Badge>;
};

export default function AnnouncementsIndex({ announcements, departments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [targetAudience, setTargetAudience] = useState(filters.target_audience || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        content: '',
        priority: 'normal' as string,
        target_audience: 'all' as string,
        department_id: '' as string,
        published_at: '',
        expires_at: '',
        is_pinned: false,
        is_active: true,
    });

    const navigate = (params: Record<string, string>) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v && v !== 'all')
        );
        router.get('/owner/announcements', cleanParams, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, priority, target_audience: targetAudience, status });
    };

    const handlePriorityChange = (value: string) => {
        setPriority(value);
        navigate({ search, priority: value, target_audience: targetAudience, status });
    };

    const handleAudienceChange = (value: string) => {
        setTargetAudience(value);
        navigate({ search, priority, target_audience: value, status });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ search, priority, target_audience: targetAudience, status: value });
    };

    const resetFilters = () => {
        setSearch('');
        setPriority('all');
        setTargetAudience('all');
        setStatus('all');
        router.get('/owner/announcements');
    };

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        reset();
        setData({
            title: '',
            content: '',
            priority: 'normal',
            target_audience: 'all',
            department_id: '',
            published_at: '',
            expires_at: '',
            is_pinned: false,
            is_active: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setData({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            target_audience: announcement.target_audience,
            department_id: announcement.department_id?.toString() || '',
            published_at: announcement.published_at ? format(new Date(announcement.published_at), 'yyyy-MM-dd\'T\'HH:mm') : '',
            expires_at: announcement.expires_at ? format(new Date(announcement.expires_at), 'yyyy-MM-dd\'T\'HH:mm') : '',
            is_pinned: announcement.is_pinned,
            is_active: announcement.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingAnnouncement) {
            put(`/owner/announcements/${editingAnnouncement.id}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    toast.success('Announcement updated successfully!');
                },
                onError: () => toast.error('Failed to update announcement.'),
            });
        } else {
            post('/owner/announcements', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                    toast.success('Announcement created successfully!');
                },
                onError: () => toast.error('Failed to create announcement.'),
            });
        }
    };

    const handleDelete = () => {
        if (announcementToDelete) {
            router.delete(`/owner/announcements/${announcementToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setAnnouncementToDelete(null);
                    toast.success('Announcement deleted successfully!');
                },
                onError: () => toast.error('Failed to delete announcement.'),
            });
        }
    };

    const togglePin = (announcement: Announcement) => {
        router.post(`/owner/announcements/${announcement.id}/toggle-pin`);
    };

    const toggleStatus = (announcement: Announcement) => {
        router.post(`/owner/announcements/${announcement.id}/toggle-status`);
    };

    const hasActiveFilters = !!(search || priority !== 'all' || targetAudience !== 'all' || status !== 'all');

    return (
        <OwnerLayout>
            <Head title="Announcements" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                            <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Announcements</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage school-wide announcements
                            </p>
                        </div>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                </div>

                {/* Announcements List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar onReset={resetFilters} showReset={hasActiveFilters}>
                            <SearchBar 
                                value={search} 
                                onChange={handleSearchChange} 
                                placeholder="Search announcements..." 
                            />
                            <FilterDropdown
                                label="Priority"
                                value={priority}
                                onChange={handlePriorityChange}
                                options={priorityOptions}
                                placeholder="All Priorities"
                            />
                            <FilterDropdown
                                label="Audience"
                                value={targetAudience}
                                onChange={handleAudienceChange}
                                options={audienceOptions}
                                placeholder="All Audiences"
                            />
                            <FilterDropdown
                                label="Status"
                                value={status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                                placeholder="All Statuses"
                            />
                        </FilterBar>

                        <div className="mt-6 space-y-4">
                            {announcements.data.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    No announcements found.
                                </div>
                            ) : (
                                announcements.data.map((announcement) => (
                                    <div 
                                        key={announcement.id} 
                                        className={`rounded-lg border p-4 ${announcement.is_pinned ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950' : ''} ${!announcement.is_active ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {announcement.is_pinned && (
                                                        <Pin className="h-4 w-4 text-yellow-600" />
                                                    )}
                                                    <h3 className="font-semibold">{announcement.title}</h3>
                                                    {getPriorityBadge(announcement.priority)}
                                                    {getAudienceBadge(announcement.target_audience)}
                                                    {!announcement.is_active && (
                                                        <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                    {announcement.content}
                                                </p>
                                                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>By {announcement.creator?.name || 'Unknown'}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a')}</span>
                                                    {announcement.department && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{announcement.department.name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(announcement)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => togglePin(announcement)}>
                                                        {announcement.is_pinned ? (
                                                            <>
                                                                <PinOff className="mr-2 h-4 w-4" />
                                                                Unpin
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Pin className="mr-2 h-4 w-4" />
                                                                Pin
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleStatus(announcement)}>
                                                        {announcement.is_active ? (
                                                            <>
                                                                <EyeOff className="mr-2 h-4 w-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setAnnouncementToDelete(announcement);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Pagination data={announcements} />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAnnouncement 
                                ? 'Update the announcement details below.'
                                : 'Fill in the details to create a new announcement.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="Announcement title"
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content *</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    placeholder="Announcement content..."
                                    rows={5}
                                    className={errors.content ? 'border-red-500' : ''}
                                />
                                {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={v => setData('priority', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorityOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target_audience">Target Audience *</Label>
                                    <Select value={data.target_audience} onValueChange={v => setData('target_audience', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {audienceOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department (Optional)</Label>
                                <Select value={data.department_id} onValueChange={v => setData('department_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Departments</SelectItem>
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="published_at">Publish Date (Optional)</Label>
                                    <Input
                                        id="published_at"
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={e => setData('published_at', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Leave empty to publish immediately</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                                    <Input
                                        id="expires_at"
                                        type="datetime-local"
                                        value={data.expires_at}
                                        onChange={e => setData('expires_at', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Leave empty for no expiry</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_pinned"
                                        checked={data.is_pinned}
                                        onCheckedChange={v => setData('is_pinned', v)}
                                    />
                                    <Label htmlFor="is_pinned">Pin announcement</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={v => setData('is_active', v)}
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Announcement</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{announcementToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </OwnerLayout>
    );
}
