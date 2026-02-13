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
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { FileViewer } from '@/components/ui/file-viewer';
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
import { Plus, Edit, Trash2, MoreHorizontal, Pin, PinOff, Eye, EyeOff, Megaphone, X, FileText, Image as ImageIcon, File } from 'lucide-react';
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
    target_audience: string;
    target_roles: string[] | null;
    department_id: number | null;
    created_by: number;
    published_at: string | null;
    expires_at: string | null;
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_type: string | null;
    image_path: string | null;
    image_name: string | null;
    image_type: string | null;
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
    availableRoles: string[];
    filters: {
        search?: string;
        priority?: string;
        target_role?: string;
        status?: string;
    };
}

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const roleLabels: Record<string, string> = {
    registrar: 'Registrar',
    accounting: 'Accounting',
    student: 'Students',
    teacher: 'Teachers',
    parent: 'Parents',
    guidance: 'Guidance',
    librarian: 'Librarian',
    clinic: 'Clinic',
    canteen: 'Canteen',
};

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

const getRoleBadges = (roles: string[] | null) => {
    if (!roles || roles.length === 0) return null;
    if (roles.length === 9) {
        return <Badge variant="outline">All Roles</Badge>;
    }
    if (roles.length > 3) {
        return <Badge variant="outline">{roles.length} Roles</Badge>;
    }
    return roles.map(role => (
        <Badge key={role} variant="outline" className="text-xs">
            {roleLabels[role] || role}
        </Badge>
    ));
};

const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
};

export default function AnnouncementsIndex({ announcements, departments, availableRoles = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [targetRole, setTargetRole] = useState(filters.target_role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const [fileViewerOpen, setFileViewerOpen] = useState(false);
    const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [viewingImageAnnouncement, setViewingImageAnnouncement] = useState<Announcement | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        content: string;
        priority: string;
        target_roles: string[];
        published_at: string;
        expires_at: string;
        is_pinned: boolean;
        is_active: boolean;
        attachment: File | null;
        remove_attachment: boolean;
        image: File | null;
        remove_image: boolean;
    }>({
        title: '',
        content: '',
        priority: 'normal',
        target_roles: [],
        published_at: '',
        expires_at: '',
        is_pinned: false,
        is_active: true,
        attachment: null,
        remove_attachment: false,
        image: null,
        remove_image: false,
    });

    const navigate = (params: Record<string, string>) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v && v !== 'all')
        );
        router.get('/owner/announcements', cleanParams, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, priority, target_role: targetRole, status });
    };

    const handlePriorityChange = (value: string) => {
        setPriority(value);
        navigate({ search, priority: value, target_role: targetRole, status });
    };

    const handleRoleChange = (value: string) => {
        setTargetRole(value);
        navigate({ search, priority, target_role: value, status });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        navigate({ search, priority, target_role: targetRole, status: value });
    };

    const resetFilters = () => {
        setSearch('');
        setPriority('all');
        setTargetRole('all');
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
            target_roles: [],
            published_at: '',
            expires_at: '',
            is_pinned: false,
            is_active: true,
            attachment: null,
            remove_attachment: false,
            image: null,
            remove_image: false,
        });
        setModalOpen(true);
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setData({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            target_roles: announcement.target_roles || [],
            published_at: announcement.published_at ? format(new Date(announcement.published_at), 'yyyy-MM-dd\'T\'HH:mm') : '',
            expires_at: announcement.expires_at ? format(new Date(announcement.expires_at), 'yyyy-MM-dd\'T\'HH:mm') : '',
            is_pinned: announcement.is_pinned,
            is_active: announcement.is_active,
            attachment: null,
            remove_attachment: false,
            image: null,
            remove_image: false,
        });
        setModalOpen(true);
    };

    const handleRoleToggle = (role: string) => {
        const currentRoles = data.target_roles;
        if (currentRoles.includes(role)) {
            setData('target_roles', currentRoles.filter(r => r !== role));
        } else {
            setData('target_roles', [...currentRoles, role]);
        }
    };

    const selectAllRoles = () => {
        setData('target_roles', [...availableRoles]);
    };

    const clearAllRoles = () => {
        setData('target_roles', []);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('priority', data.priority);
        data.target_roles.forEach((role, index) => {
            formData.append(`target_roles[${index}]`, role);
        });
        if (data.published_at) formData.append('published_at', data.published_at);
        if (data.expires_at) formData.append('expires_at', data.expires_at);
        formData.append('is_pinned', data.is_pinned ? '1' : '0');
        formData.append('is_active', data.is_active ? '1' : '0');
        if (data.attachment) formData.append('attachment', data.attachment);
        if (editingAnnouncement && data.remove_attachment) formData.append('remove_attachment', '1');
        if (data.image) formData.append('image', data.image);
        if (editingAnnouncement && data.remove_image) formData.append('remove_image', '1');
        
        if (editingAnnouncement) {
            formData.append('_method', 'PUT');
            router.post(`/owner/announcements/${editingAnnouncement.id}`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    setModalOpen(false);
                    toast.success('Announcement updated successfully!');
                },
                onError: () => toast.error('Failed to update announcement.'),
            });
        } else {
            router.post('/owner/announcements', formData, {
                forceFormData: true,
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

    const openFileViewer = (announcement: Announcement) => {
        setViewingAnnouncement(announcement);
        setFileViewerOpen(true);
    };

    const openImageViewer = (announcement: Announcement) => {
        setViewingImageAnnouncement(announcement);
        setImageViewerOpen(true);
    };

    const hasActiveFilters = !!(search || priority !== 'all' || targetRole !== 'all' || status !== 'all');

    const roleFilterOptions = availableRoles.map(role => ({
        value: role,
        label: roleLabels[role] || role,
    }));

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
                                label="Target Role"
                                value={targetRole}
                                onChange={handleRoleChange}
                                options={roleFilterOptions}
                                placeholder="All Roles"
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
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {announcement.is_pinned && (
                                                        <Pin className="h-4 w-4 text-yellow-600" />
                                                    )}
                                                    <h3 className="font-semibold">{announcement.title}</h3>
                                                    {getPriorityBadge(announcement.priority)}
                                                    {getRoleBadges(announcement.target_roles)}
                                                    {!announcement.is_active && (
                                                        <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                                                    )}
                                                    {announcement.attachment_path && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-6 px-2"
                                                            onClick={() => openFileViewer(announcement)}
                                                        >
                                                            {getFileIcon(announcement.attachment_type)}
                                                            <span className="ml-1 text-xs">{announcement.attachment_name || 'Attachment'}</span>
                                                        </Button>
                                                    )}
                                                    {announcement.image_path && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-6 px-2"
                                                            onClick={() => openImageViewer(announcement)}
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                            <span className="ml-1 text-xs">Image</span>
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                    {announcement.content}
                                                </p>
                                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span>By {announcement.creator?.name || 'Unknown'}</span>
                                                    <span>•</span>
                                                    <span>Created: {format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a')}</span>
                                                    {announcement.published_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-600 dark:text-green-400">Published: {format(new Date(announcement.published_at), 'MMM d, yyyy h:mm a')}</span>
                                                        </>
                                                    )}
                                                    {announcement.expires_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-orange-600 dark:text-orange-400">Expires: {format(new Date(announcement.expires_at), 'MMM d, yyyy h:mm a')}</span>
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                            </div>

                            {/* Target Roles Multi-Select */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Target Roles * <span className="text-muted-foreground text-xs">({data.target_roles.length} selected)</span></Label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="sm" onClick={selectAllRoles}>
                                            Select All
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={clearAllRoles}>
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/50">
                                    {availableRoles.map(role => (
                                        <div key={role} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role}`}
                                                checked={data.target_roles.includes(role)}
                                                onCheckedChange={() => handleRoleToggle(role)}
                                            />
                                            <Label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
                                                {roleLabels[role] || role}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.target_roles && <p className="text-xs text-red-500">{errors.target_roles}</p>}
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

                            {/* Attachment Upload */}
                            <div className="space-y-2">
                                <Label>Attachment (Optional)</Label>
                                {editingAnnouncement?.attachment_path && !data.remove_attachment && (
                                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                                        {getFileIcon(editingAnnouncement.attachment_type)}
                                        <span className="flex-1 text-sm">{editingAnnouncement.attachment_name}</span>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setData('remove_attachment', true)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        setData('attachment', file || null);
                                        if (file) setData('remove_attachment', false);
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Supported: PDF, Images (JPG, PNG, GIF), Documents (DOC, DOCX). Max 10MB.
                                </p>
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
                            <Button type="submit" disabled={processing || data.target_roles.length === 0}>
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

            {/* File Viewer */}
            {viewingAnnouncement && (
                <FileViewer
                    open={fileViewerOpen}
                    onOpenChange={setFileViewerOpen}
                    title={viewingAnnouncement.attachment_name || viewingAnnouncement.title}
                    filePath={viewingAnnouncement.attachment_path || ''}
                    fileType={viewingAnnouncement.attachment_type || undefined}
                    fileName={viewingAnnouncement.attachment_name || undefined}
                />
            )}
        </OwnerLayout>
    );
}
