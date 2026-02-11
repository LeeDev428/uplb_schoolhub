import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schedules', href: '/owner/schedules' },
];

interface Department {
    id: number;
    name: string;
}

interface Program {
    id: number;
    name: string;
    department_id: number;
    department: Department;
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    department_id: number;
    department: Department;
}

interface Section {
    id: number;
    name: string;
    department_id: number;
    year_level_id: number;
    department: Department;
    year_level: YearLevel;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    suffix: string | null;
    department_id: number;
    full_name?: string;
}

interface Schedule {
    id: number;
    title: string;
    department_id: number;
    program_id: number | null;
    year_level_id: number | null;
    section_id: number | null;
    teacher_id: number | null;
    file_path: string;
    file_name: string;
    is_active: boolean;
    department: Department;
    program: Program | null;
    year_level: YearLevel | null;
    section: Section | null;
    teacher: Teacher | null;
    created_at: string;
}

interface Props {
    schedules: {
        data: Schedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevel[];
    sections: Section[];
    teachers: Teacher[];
    filters: {
        search?: string;
        department_id?: string;
        status?: string;
    };
}

export default function SchedulesIndex({ schedules, departments, programs, yearLevels, sections, teachers, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
    const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    // Form state
    const [title, setTitle] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [programId, setProgramId] = useState('');
    const [yearLevelId, setYearLevelId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredPrograms = departmentId ? programs.filter(p => p.department_id === parseInt(departmentId)) : [];
    const filteredYearLevels = departmentId ? yearLevels.filter(yl => yl.department_id === parseInt(departmentId)) : [];
    const filteredSections = (departmentId && yearLevelId)
        ? sections.filter(s => s.department_id === parseInt(departmentId) && s.year_level_id === parseInt(yearLevelId))
        : [];
    const filteredTeachers = departmentId ? teachers.filter(t => t.department_id === parseInt(departmentId)) : teachers;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/schedules', { search: value, department_id: selectedDepartment, status }, { preserveState: true, replace: true });
    };

    const handleDepartmentFilterChange = (value: string) => {
        setSelectedDepartment(value);
        router.get('/owner/schedules', { search, department_id: value, status }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/owner/schedules', { search, department_id: selectedDepartment, status: value }, { preserveState: true, replace: true });
    };

    const resetForm = () => {
        setTitle('');
        setDepartmentId('');
        setProgramId('');
        setYearLevelId('');
        setSectionId('');
        setTeacherId('');
        setIsActive(true);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openCreateModal = () => {
        resetForm();
        setEditingSchedule(null);
        setIsModalOpen(true);
    };

    const openEditModal = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setTitle(schedule.title);
        setDepartmentId(schedule.department_id.toString());
        setProgramId(schedule.program_id?.toString() || '');
        setYearLevelId(schedule.year_level_id?.toString() || '');
        setSectionId(schedule.section_id?.toString() || '');
        setTeacherId(schedule.teacher_id?.toString() || '');
        setIsActive(schedule.is_active);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('department_id', departmentId);
        if (programId) formData.append('program_id', programId);
        if (yearLevelId) formData.append('year_level_id', yearLevelId);
        if (sectionId) formData.append('section_id', sectionId);
        if (teacherId) formData.append('teacher_id', teacherId);
        formData.append('is_active', isActive ? '1' : '0');
        if (file) formData.append('file', file);

        if (editingSchedule) {
            formData.append('_method', 'PUT');
            router.post(`/owner/schedules/${editingSchedule.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    resetForm();
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/owner/schedules', formData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    resetForm();
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const confirmDelete = (schedule: Schedule) => {
        setScheduleToDelete(schedule);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (scheduleToDelete) {
            router.delete(`/owner/schedules/${scheduleToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setScheduleToDelete(null);
                },
            });
        }
    };

    return (
        <OwnerLayout>
            <Head title="Schedules" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Schedules</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Upload and manage class schedules (PDF)</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Schedule
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <FilterBar>
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search schedules..." />
                            <FilterDropdown
                                label="Department"
                                value={selectedDepartment}
                                onChange={handleDepartmentFilterChange}
                                options={[
                                    { value: 'all', label: 'All Departments' },
                                    ...departments.map(d => ({ value: d.id.toString(), label: d.name })),
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
                                        <th className="p-3 text-left text-sm font-semibold">Title</th>
                                        <th className="p-3 text-left text-sm font-semibold">Department</th>
                                        <th className="p-3 text-left text-sm font-semibold">Program</th>
                                        <th className="p-3 text-left text-sm font-semibold">Year Level</th>
                                        <th className="p-3 text-left text-sm font-semibold">Section</th>
                                        <th className="p-3 text-left text-sm font-semibold">Teacher</th>
                                        <th className="p-3 text-left text-sm font-semibold">File</th>
                                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                                        <th className="p-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-muted-foreground">
                                                No schedules found
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3 font-medium">{schedule.title}</td>
                                                <td className="p-3 text-sm">{schedule.department.name}</td>
                                                <td className="p-3 text-sm">{schedule.program?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.year_level?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.section?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.teacher ? `${schedule.teacher.last_name}, ${schedule.teacher.first_name}${schedule.teacher.suffix ? ' ' + schedule.teacher.suffix : ''}` : 'N/A'}</td>
                                                <td className="p-3 text-sm">{schedule.file_name}</td>
                                                <td className="p-3">
                                                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                                                        {schedule.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => setViewingSchedule(schedule)} title="View PDF">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(schedule)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(schedule)}>
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

                        {schedules.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination data={schedules} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create / Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Upload Schedule'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 1st Semester Schedule" required />
                        </div>

                        <div>
                            <Label htmlFor="department_id">Department *</Label>
                            <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setProgramId(''); setYearLevelId(''); setSectionId(''); setTeacherId(''); }}>
                                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                <SelectContent>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="program_id">Program (Optional)</Label>
                            <Select value={programId || 'all'} onValueChange={(v) => { setProgramId(v === 'all' ? '' : v); setSectionId(''); }}>
                                <SelectTrigger><SelectValue placeholder="All programs" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {filteredPrograms.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="year_level_id">Year Level (Optional)</Label>
                                <Select value={yearLevelId || 'all'} onValueChange={(v) => { setYearLevelId(v === 'all' ? '' : v); setSectionId(''); }}>
                                    <SelectTrigger><SelectValue placeholder="All year levels" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Year Levels</SelectItem>
                                        {filteredYearLevels.map(yl => (
                                            <SelectItem key={yl.id} value={yl.id.toString()}>{yl.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="section_id">Section (Optional)</Label>
                                <Select value={sectionId || 'all'} onValueChange={(v) => setSectionId(v === 'all' ? '' : v)} disabled={!departmentId || !yearLevelId}>
                                    <SelectTrigger><SelectValue placeholder={(!departmentId || !yearLevelId) ? 'Select department & year level first' : 'All sections'} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sections</SelectItem>
                                        {filteredSections.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="teacher_id">Assigned Teacher (Optional)</Label>
                            <Select value={teacherId || 'none'} onValueChange={(v) => setTeacherId(v === 'none' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Teacher</SelectItem>
                                    {filteredTeachers.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.last_name}, {t.first_name}{t.suffix ? ' ' + t.suffix : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="file">
                                PDF File {editingSchedule ? '(leave blank to keep current)' : '*'}
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".pdf"
                                ref={fileInputRef}
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required={!editingSchedule}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">Max 10MB, PDF only</p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="is_active">Active Status</Label>
                            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {editingSchedule ? 'Update' : 'Upload'} Schedule
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View PDF Modal */}
            <Dialog open={!!viewingSchedule} onOpenChange={() => setViewingSchedule(null)}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh]">
                    <DialogHeader>
                        <DialogTitle>{viewingSchedule?.title}</DialogTitle>
                    </DialogHeader>
                    {viewingSchedule && (
                        <iframe
                            src={`/storage/${viewingSchedule.file_path}`}
                            className="w-full h-full rounded-lg border"
                            title={viewingSchedule.title}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Schedule"
                description={`Are you sure you want to delete "${scheduleToDelete?.title}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                variant="danger"
            />
        </OwnerLayout>
    );
}
