import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface StudentOption {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
}

interface GuidanceRecordData {
    id: number;
    student_id: number;
    counselor_id: number | null;
    record_type: string;
    title: string;
    description: string;
    action_taken: string | null;
    recommendations: string | null;
    severity: string;
    status: string;
    incident_date: string | null;
    follow_up_date: string | null;
    is_confidential: boolean;
    created_at: string;
    student?: { first_name: string; last_name: string; lrn: string } | null;
    counselor?: { name: string } | null;
}

interface Props {
    records: {
        data: GuidanceRecordData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    students: StudentOption[];
    filters: {
        search?: string;
        record_type?: string;
        status?: string;
        severity?: string;
    };
}

const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
};

export default function RecordsIndex({ records, students, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<GuidanceRecordData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GuidanceRecordData | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [recordType, setRecordType] = useState(filters.record_type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [severity, setSeverity] = useState(filters.severity || 'all');

    const form = useForm({
        student_id: '',
        record_type: 'counseling',
        title: '',
        description: '',
        action_taken: '',
        recommendations: '',
        severity: 'medium',
        status: 'open',
        incident_date: '',
        follow_up_date: '',
        is_confidential: true,
    });

    const navigate = (params: Record<string, string>) => {
        router.get('/guidance/records', params, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, record_type: recordType, status: statusFilter, severity });
    };

    const handleTypeChange = (value: string) => {
        setRecordType(value);
        navigate({ search, record_type: value, status: statusFilter, severity });
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        navigate({ search, record_type: recordType, status: value, severity });
    };

    const handleSeverityChange = (value: string) => {
        setSeverity(value);
        navigate({ search, record_type: recordType, status: statusFilter, severity: value });
    };

    const resetFilters = () => {
        setSearch('');
        setRecordType('all');
        setStatusFilter('all');
        setSeverity('all');
        router.get('/guidance/records');
    };

    const openCreateModal = () => {
        form.reset();
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record: GuidanceRecordData) => {
        setEditingRecord(record);
        form.setData({
            student_id: String(record.student_id),
            record_type: record.record_type,
            title: record.title,
            description: record.description,
            action_taken: record.action_taken || '',
            recommendations: record.recommendations || '',
            severity: record.severity,
            status: record.status,
            incident_date: record.incident_date || '',
            follow_up_date: record.follow_up_date || '',
            is_confidential: record.is_confidential,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingRecord) {
            form.put(`/guidance/records/${editingRecord.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/guidance/records', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/guidance/records/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <GuidanceLayout>
            <Head title="Guidance Records" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Guidance Records</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage student counseling and behavioral records</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Record
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <FilterBar
                            onReset={resetFilters}
                            showReset={!!(search || recordType !== 'all' || statusFilter !== 'all' || severity !== 'all')}
                        >
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search records..." />
                            <FilterDropdown
                                label="Type"
                                value={recordType}
                                onChange={handleTypeChange}
                                options={[
                                    { value: 'counseling', label: 'Counseling' },
                                    { value: 'behavior', label: 'Behavior' },
                                    { value: 'case', label: 'Case' },
                                    { value: 'referral', label: 'Referral' },
                                    { value: 'other', label: 'Other' },
                                ]}
                            />
                            <FilterDropdown
                                label="Status"
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                options={[
                                    { value: 'open', label: 'Open' },
                                    { value: 'in-progress', label: 'In Progress' },
                                    { value: 'resolved', label: 'Resolved' },
                                    { value: 'closed', label: 'Closed' },
                                ]}
                            />
                            <FilterDropdown
                                label="Severity"
                                value={severity}
                                onChange={handleSeverityChange}
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                    { value: 'critical', label: 'Critical' },
                                ]}
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">Title</th>
                                        <th className="p-3 text-left font-semibold">Student</th>
                                        <th className="p-3 text-center font-semibold">Type</th>
                                        <th className="p-3 text-center font-semibold">Severity</th>
                                        <th className="p-3 text-center font-semibold">Status</th>
                                        <th className="p-3 text-center font-semibold">Date</th>
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">No records found.</td>
                                        </tr>
                                    ) : (
                                        records.data.map((record) => (
                                            <tr key={record.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{record.title}</td>
                                                <td className="p-3 text-sm">
                                                    {record.student
                                                        ? `${record.student.last_name}, ${record.student.first_name}`
                                                        : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs capitalize">{record.record_type}</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${SEVERITY_COLORS[record.severity] || ''}`}>
                                                        {record.severity}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${STATUS_COLORS[record.status] || ''}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm text-gray-500">
                                                    {new Date(record.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => openEditModal(record)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(record)}>
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

                        <Pagination data={records} />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? 'Edit Record' : 'New Record'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Student *</Label>
                                <Select value={form.data.student_id} onValueChange={(v) => form.setData('student_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                                    <SelectContent>
                                        {students.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.last_name}, {s.first_name} ({s.lrn})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.student_id && <p className="text-sm text-red-500">{form.errors.student_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} required />
                                {form.errors.title && <p className="text-sm text-red-500">{form.errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type *</Label>
                                    <Select value={form.data.record_type} onValueChange={(v) => form.setData('record_type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="counseling">Counseling</SelectItem>
                                            <SelectItem value="behavior">Behavior</SelectItem>
                                            <SelectItem value="case">Case</SelectItem>
                                            <SelectItem value="referral">Referral</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Severity *</Label>
                                    <Select value={form.data.severity} onValueChange={(v) => form.setData('severity', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Description *</Label>
                                <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={3} required />
                                {form.errors.description && <p className="text-sm text-red-500">{form.errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Action Taken</Label>
                                <Textarea value={form.data.action_taken} onChange={(e) => form.setData('action_taken', e.target.value)} rows={2} />
                            </div>

                            <div className="space-y-2">
                                <Label>Recommendations</Label>
                                <Textarea value={form.data.recommendations} onChange={(e) => form.setData('recommendations', e.target.value)} rows={2} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Incident Date</Label>
                                    <Input type="date" value={form.data.incident_date} onChange={(e) => form.setData('incident_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Follow-up Date</Label>
                                    <Input type="date" value={form.data.follow_up_date} onChange={(e) => form.setData('follow_up_date', e.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_confidential"
                                    checked={form.data.is_confidential}
                                    onCheckedChange={(checked) => form.setData('is_confidential', checked)}
                                />
                                <Label htmlFor="is_confidential">Confidential</Label>
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
                title="Delete Record"
                description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
            />
        </GuidanceLayout>
    );
}
