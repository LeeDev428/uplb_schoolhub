import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

interface Department {
    id: number;
    name: string;
    classification: 'K-12' | 'College';
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    department_id: number;
    department: {
        id: number;
        name: string;
    };
}

interface Subject {
    id: number;
    department_id: number;
    code: string;
    name: string;
    description: string | null;
    classification: 'K-12' | 'College';
    units: number | null;
    hours_per_week: number | null;
    type: 'core' | 'major' | 'elective' | 'general';
    year_level_id: number | null;
    semester: '1' | '2' | 'summer' | null;
    is_active: boolean;
    department: Department;
    year_level: YearLevel | null;
}

interface Props {
    subjects: {
        data: Subject[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    departments: Department[];
    yearLevels: YearLevel[];
    filters: {
        search?: string;
        classification?: string;
        department_id?: string;
        type?: string;
        status?: string;
    };
}

export default function SubjectsIndex({ subjects, departments, yearLevels, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        department_id: '',
        code: '',
        name: '',
        description: '',
        classification: 'K-12' as 'K-12' | 'College',
        units: '',
        hours_per_week: '',
        type: 'core' as 'core' | 'major' | 'elective' | 'general',
        year_level_id: '',
        semester: 'none',
        is_active: true,
    });

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/subjects', {
            search: value,
            classification,
            department_id: selectedDepartment,
            type,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        router.get('/owner/subjects', {
            search,
            classification: value,
            department_id: selectedDepartment,
            type,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        router.get('/owner/subjects', {
            search,
            classification,
            department_id: value,
            type,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTypeChange = (value: string) => {
        setType(value);
        router.get('/owner/subjects', {
            search,
            classification,
            department_id: selectedDepartment,
            type: value,
            status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/owner/subjects', {
            search,
            classification,
            department_id: selectedDepartment,
            type,
            status: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openCreateModal = () => {
        form.reset();
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        form.setData({
            department_id: subject.department_id.toString(),
            code: subject.code,
            name: subject.name,
            description: subject.description || '',
            classification: subject.classification,
            units: subject.units?.toString() || '',
            hours_per_week: subject.hours_per_week?.toString() || '',
            type: subject.type,
            year_level_id: subject.year_level_id?.toString() || '',
            semester: subject.semester || 'none',
            is_active: subject.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare clean data for submission
        const submitData = {
            code: form.data.code,
            name: form.data.name,
            description: form.data.description,
            classification: form.data.classification,
            department_id: form.data.department_id,
            type: form.data.type,
            units: form.data.units || 3.0,
            hours_per_week: form.data.hours_per_week || null,
            year_level_id: form.data.year_level_id || '',
            semester: form.data.semester === 'none' ? '' : form.data.semester,
            is_active: form.data.is_active,
        };

        if (editingSubject) {
            router.put(`/owner/subjects/${editingSubject.id}`, submitData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            router.post('/owner/subjects', submitData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const confirmDelete = (subject: Subject) => {
        setSubjectToDelete(subject);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (subjectToDelete) {
            router.delete(`/owner/subjects/${subjectToDelete.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSubjectToDelete(null);
                },
            });
        }
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, { label: string; variant: any }> = {
            core: { label: 'Core', variant: 'default' },
            major: { label: 'Major', variant: 'secondary' },
            elective: { label: 'Elective', variant: 'outline' },
            general: { label: 'General', variant: 'outline' },
        };
        const config = variants[type] || variants.core;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const filteredYearLevels = form.data.department_id
        ? yearLevels.filter((yl) => yl.department_id === parseInt(form.data.department_id))
        : [];

    return (
        <OwnerLayout>
            <Head title="Subjects" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Subjects Management
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage academic subjects and curricula
                        </p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subject
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <FilterBar>
                            <SearchBar
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search subjects..."
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
                                label="Department"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                options={[
                                    { value: 'all', label: 'All Departments' },
                                    ...departments.map((dept) => ({
                                        value: dept.id.toString(),
                                        label: dept.name,
                                    })),
                                ]}
                            />
                            <FilterDropdown
                                label="Type"
                                value={type}
                                onChange={handleTypeChange}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'core', label: 'Core' },
                                    { value: 'major', label: 'Major' },
                                    { value: 'elective', label: 'Elective' },
                                    { value: 'general', label: 'General' },
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
                                        <th className="p-3 text-left text-sm font-semibold">Code</th>
                                        <th className="p-3 text-left text-sm font-semibold">Subject Name</th>
                                        <th className="p-3 text-left text-sm font-semibold">Department</th>
                                        <th className="p-3 text-left text-sm font-semibold">Classification</th>
                                        <th className="p-3 text-left text-sm font-semibold">Type</th>
                                        <th className="p-3 text-left text-sm font-semibold">Units</th>
                                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                                        <th className="p-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                                No subjects found
                                            </td>
                                        </tr>
                                    ) : (
                                        subjects.data.map((subject) => (
                                            <tr key={subject.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <span className="font-mono text-sm font-medium">
                                                        {subject.code}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{subject.name}</p>
                                                        {subject.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {subject.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-sm">{subject.department.name}</span>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={subject.classification === 'K-12' ? 'secondary' : 'default'}>
                                                        {subject.classification}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    {getTypeBadge(subject.type)}
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-sm">
                                                        {subject.units ? `${subject.units} units` : '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={subject.is_active ? 'default' : 'secondary'}>
                                                        {subject.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditModal(subject)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => confirmDelete(subject)}
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

                        {subjects.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination data={subjects} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Subject Code *</Label>
                                    <Input
                                        id="code"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        placeholder="e.g., MATH101"
                                        required
                                    />
                                    {form.errors.code && (
                                        <p className="mt-1 text-sm text-destructive">{form.errors.code}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="name">Subject Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g., Introduction to Mathematics"
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="mt-1 text-sm text-destructive">{form.errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Subject description..."
                                    rows={2}
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
                                    <Label htmlFor="department_id">Department *</Label>
                                    <Select
                                        value={form.data.department_id}
                                        onValueChange={(value) => {
                                            form.setData('department_id', value);
                                            form.setData('year_level_id', '');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.department_id && (
                                        <p className="mt-1 text-sm text-destructive">{form.errors.department_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Subject Type *</Label>
                                    <Select
                                        value={form.data.type}
                                        onValueChange={(value: any) => form.setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="core">Core</SelectItem>
                                            <SelectItem value="major">Major</SelectItem>
                                            <SelectItem value="elective">Elective</SelectItem>
                                            <SelectItem value="general">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="year_level_id">Year Level (Optional)</Label>
                                    <Select
                                        value={form.data.year_level_id}
                                        onValueChange={(value) => form.setData('year_level_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredYearLevels.length === 0 ? (
                                                <div className="p-2 text-sm text-muted-foreground">
                                                    Select a department first
                                                </div>
                                            ) : (
                                                filteredYearLevels.map((yl) => (
                                                    <SelectItem key={yl.id} value={yl.id.toString()}>
                                                        {yl.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="units">Units</Label>
                                    <Input
                                        id="units"
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="10"
                                        value={form.data.units}
                                        onChange={(e) => form.setData('units', e.target.value)}
                                        placeholder="3.0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="hours_per_week">Hours/Week</Label>
                                    <Input
                                        id="hours_per_week"
                                        type="number"
                                        min="1"
                                        max="40"
                                        value={form.data.hours_per_week}
                                        onChange={(e) => form.setData('hours_per_week', e.target.value)}
                                        placeholder="3"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="semester">Semester</Label>
                                    <Select
                                        value={form.data.semester}
                                        onValueChange={(value) => form.setData('semester', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="1">1st Semester</SelectItem>
                                            <SelectItem value="2">2nd Semester</SelectItem>
                                            <SelectItem value="summer">Summer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                {editingSubject ? 'Update' : 'Create'} Subject
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Subject"
                description={`Are you sure you want to delete "${subjectToDelete?.code} - ${subjectToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                variant="danger"
            />
        </OwnerLayout>
    );
}
