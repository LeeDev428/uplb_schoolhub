import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { FileViewer } from '@/components/ui/file-viewer';
import { ImageViewer } from '@/components/ui/image-viewer';
import { Megaphone, Pin, FileText, Image as ImageIcon, File, Download } from 'lucide-react';

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
    filters: {
        search?: string;
        priority?: string;
    };
    role: string;
}

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
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

const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
};

export default function AnnouncementsIndex({ announcements, filters, role }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [fileViewerOpen, setFileViewerOpen] = useState(false);
    const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [viewingImageAnnouncement, setViewingImageAnnouncement] = useState<Announcement | null>(null);
    const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<number>>(new Set());

    const navigate = (params: Record<string, string>) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v && v !== 'all')
        );
        router.get(`/${role}/announcements`, cleanParams, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, priority });
    };

    const handlePriorityChange = (value: string) => {
        setPriority(value);
        navigate({ search, priority: value });
    };

    const resetFilters = () => {
        setSearch('');
        setPriority('all');
        router.get(`/${role}/announcements`);
    };

    const openFileViewer = (announcement: Announcement) => {
        setViewingAnnouncement(announcement);
        setFileViewerOpen(true);
    };

    const openImageViewer = (announcement: Announcement) => {
        setViewingImageAnnouncement(announcement);
        setImageViewerOpen(true);
    };

    const toggleExpanded = (id: number) => {
        setExpandedAnnouncements(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const hasActiveFilters = !!(search || priority !== 'all');

    return (
        <>
            <Head title="Announcements" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Announcements</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Stay updated with the latest school announcements
                        </p>
                    </div>
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
                        </FilterBar>

                        <div className="mt-6 space-y-4">
                            {announcements.data.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    No announcements found.
                                </div>
                            ) : (
                                announcements.data.map((announcement) => {
                                    const isExpanded = expandedAnnouncements.has(announcement.id);
                                    const contentPreview = announcement.content.length > 300 && !isExpanded 
                                        ? announcement.content.substring(0, 300) + '...'
                                        : announcement.content;

                                    return (
                                        <div 
                                            key={announcement.id} 
                                            className={`rounded-lg border p-5 transition-colors hover:bg-muted/50 ${announcement.is_pinned ? 'border-yellow-300 bg-yellow-50/50 dark:border-yellow-700 dark:bg-yellow-950/30' : ''}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {announcement.is_pinned && (
                                                            <Pin className="h-4 w-4 text-yellow-600" />
                                                        )}
                                                        <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                                        {getPriorityBadge(announcement.priority)}
                                                    </div>
                                                    <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {contentPreview}
                                                    </p>
                                                    {announcement.content.length > 300 && (
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="px-0 h-auto mt-1"
                                                            onClick={() => toggleExpanded(announcement.id)}
                                                        >
                                                            {isExpanded ? 'Show less' : 'Read more'}
                                                        </Button>
                                                    )}
                                                    {announcement.attachment_path && (
                                                        <div className="mt-3">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => openFileViewer(announcement)}
                                                            >
                                                                {getFileIcon(announcement.attachment_type)}
                                                                <span className="ml-2">{announcement.attachment_name || 'View Attachment'}</span>
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {announcement.image_path && (
                                                        <div className="mt-3">
                                                            <img
                                                                src={announcement.image_path.startsWith('/storage/') ? announcement.image_path : `/storage/${announcement.image_path}`}
                                                                alt={announcement.image_name || announcement.title}
                                                                className="max-h-64 rounded-lg border object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => openImageViewer(announcement)}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span>Posted by {announcement.creator?.name || 'Admin'}</span>
                                                        <span>•</span>
                                                        <span>{format(new Date(announcement.created_at), 'MMMM d, yyyy \'at\' h:mm a')}</span>
                                                        {announcement.department && (
                                                            <>
                                                                <span>•</span>
                                                                <Badge variant="outline" className="text-xs">{announcement.department.name}</Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <Pagination data={announcements} />
                    </CardContent>
                </Card>
            </div>

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

            {/* Image Viewer */}
            {viewingImageAnnouncement && viewingImageAnnouncement.image_path && (
                <ImageViewer
                    open={imageViewerOpen}
                    onOpenChange={setImageViewerOpen}
                    title={viewingImageAnnouncement.image_name || viewingImageAnnouncement.title}
                    imagePath={viewingImageAnnouncement.image_path}
                />
            )}
        </>
    );
}
