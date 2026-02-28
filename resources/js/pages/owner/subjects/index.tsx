import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2, UserPlus, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { toast } from 'sonner';

interface Department {
    id: number;
    name: string;
    classification: 'K-12' | 'College';
}

interface Program {
    id: number;
    name: string;
    department_id: number;
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    department_id: number;
    classification: 'K-12' | 'College';
    department: {
        id: number;
        name: string;
    };
}

interface Section {
    id: number;
    name: string;
    department_id: number;
    year_level_id: number;
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
    semester: '1' | '2' | 'summer' | null;
    is_active: boolean;
    department: Department;
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevel[];
    assignedSections: Section[];
    teachers?: TeacherSummary[];
}

interface TeacherSummary {
    id: number;
    full_name: string;
    photo_url: string | null;
    department_id: number | null;
    department?: string | null;
    specialization?: string | null;
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
    programs: Program[];
    yearLevels: YearLevel[];
    sections: Section[];
    teachers: TeacherSummary[];
    filters: {
        search?: string;
        classification?: string;
        department_id?: string;
        type?: string;
        status?: string;
    };
}

interface AppSettingsData {
    has_k12?: boolean;
    has_college?: boolean;
    [key: string]: unknown;
}

export default function SubjectsIndex({ subjects, departments, programs, yearLevels, sections, teachers, filters }: Props) {
    const { props } = usePage();
    const appSettings = props.appSettings as AppSettingsData | undefined;
    const hasK12 = appSettings?.has_k12 !== false;
    const hasCollege = appSettings?.has_college !== false;

    // Available classification options based on app settings
    const classificationOptions = [
        ...(hasK12 ? [{ value: 'K-12', label: 'K-12' }] : []),
        ...(hasCollege ? [{ value: 'College', label: 'College' }] : []),
    ];

    // Smart default: use the first available classification
    const defaultClassification = (hasK12 ? 'K-12' : hasCollege ? 'College' : 'K-12') as 'K-12' | 'College';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    // Teacher assignment state
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
    const [subjectForTeacher, setSubjectForTeacher] = useState<Subject | null>(null);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search || '');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        department_ids: [] as string[],
        program_ids: [] as string[],
        year_level_ids: [] as string[],
        section_ids: [] as string[],
        code: '',
        name: '',
        description: '',
        classification: defaultClassification,
        units: '',
        hours_per_week: '',
        type: 'core' as 'core' | 'major' | 'elective' | 'general',
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
        form.setData({
            department_ids: [],
            program_ids: [],
            year_level_ids: [],
            section_ids: [],
            code: '',
            name: '',
            description: '',
            classification: defaultClassification,
            units: '',
            hours_per_week: '',
            type: 'core',
            semester: 'none',
            is_active: true,
        });
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setEditingSubject(subject);
        form.setData({
            department_ids: (subject.departments ?? []).map(d => d.id.toString()),
            program_ids: (subject.programs ?? []).map(p => p.id.toString()),
            year_level_ids: (subject.yearLevels ?? []).map(y => y.id.toString()),
            section_ids: (subject.assignedSections ?? []).map(s => s.id.toString()),
            code: subject.code,
            name: subject.name,
            description: subject.description || '',
            classification: subject.classification,
            units: subject.units?.toString() || '',
            hours_per_week: subject.hours_per_week?.toString() || '',
            type: subject.type,
            semester: subject.semester || 'none',
            is_active: subject.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isCollege = form.data.classification === 'College';

        const submitData = {
            code: form.data.code,
            name: form.data.name,
            description: form.data.description,
            classification: form.data.classification,
            department_ids: form.data.department_ids,
            program_ids: form.data.program_ids,
            year_level_ids: form.data.year_level_ids,
            section_ids: form.data.section_ids,
            type: form.data.type,
            units: isCollege && form.data.units !== '' ? form.data.units : null,
            hours_per_week: isCollege && form.data.hours_per_week !== '' ? form.data.hours_per_week : null,
            semester: form.data.semester === 'none' ? null : (form.data.semester || null),
            is_active: form.data.is_active,
        };

        if (editingSubject) {
            router.put(`/owner/subjects/${editingSubject.id}`, submitData, {
                onSuccess: () => {
                    toast.success('Changes saved successfully');
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            router.post('/owner/subjects', submitData, {
                onSuccess: () => {
                    toast.success('Changes saved successfully');
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
                    toast.success('Changes saved successfully');
                    setDeleteDialogOpen(false);
                    setSubjectToDelete(null);
                },
            });
        }
    };

    const openTeacherAssignment = (subject: Subject) => {
        setSubjectForTeacher(subject);
        setSelectedTeacherIds((subject.teachers ?? []).map((t) => t.id));
        setTeacherDialogOpen(true);
    };

    const handleAssignTeachers = () => {
        if (!subjectForTeacher) return;
        router.post(`/owner/subjects/${subjectForTeacher.id}/assign-teachers`, {
            teacher_ids: selectedTeacherIds,
        }, {
            onSuccess: () => {
                toast.success('Changes saved successfully');
                setTeacherDialogOpen(false);
                setSubjectForTeacher(null);
            },
        });
    };

    const toggleTeacher = (teacherId: number) => {
        setSelectedTeacherIds((prev) =>
            prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
        );
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

    const filteredDepartments = form.data.classification
        ? departments.filter((d) => d.classification === form.data.classification)
        : departments;

    // For multi-select helpers
    // Programs available for selected college departments
    const programsForSelectedDepts = programs.filter(p =>
        form.data.department_ids.includes(p.department_id.toString())
    );
    // Year levels available based on selected departments
    const yearLevelsForSelectedDepts = yearLevels.filter(yl =>
        form.data.department_ids.includes(yl.department_id.toString())
    );
    // Sections available based on selected year levels
    const sectionsForSelectedYearLevels = sections.filter(s =>
        form.data.year_level_ids.includes(s.year_level_id.toString())
    );

    const toggleMultiSelect = (field: 'department_ids' | 'program_ids' | 'year_level_ids' | 'section_ids', value: string) => {
        const current = form.data[field] as string[];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        form.setData(field, updated);
    };

    // Dynamic period options based on classification
    const isK12 = form.data.classification === 'K-12';
    const isCollegeForm = form.data.classification === 'College';
    const periodLabel = isK12 ? 'Quarter' : 'Semester';
    const periodOptions = isK12
        ? [
            { value: 'none', label: 'None' },
            { value: 'q1', label: 'Q1 - 1st Quarter' },
            { value: 'q2', label: 'Q2 - 2nd Quarter' },
            { value: 'q3', label: 'Q3 - 3rd Quarter' },
            { value: 'q4', label: 'Q4 - 4th Quarter' },
          ]
        : [
            { value: 'none', label: 'None' },
            { value: '1', label: '1st Semester' },
            { value: '2', label: '2nd Semester' },
            { value: 'summer', label: 'Summer' },
          ];

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
                                        <th className="p-3 text-left text-sm font-semibold">Teacher(s)</th>
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
                                                    <span className="text-sm">{subject.department?.name ?? subject.departments?.[0]?.name ?? '—'}</span>
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
                                                    {(subject.teachers ?? []).length === 0 ? (
                                                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            {(subject.teachers ?? []).map((t) => (
                                                                <span key={t.id} className="text-sm font-medium">{t.full_name}</span>
                                                            ))}
                                                        </div>
                                                    )}
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
                                                            onClick={() => openTeacherAssignment(subject)}
                                                            title="Assign Teachers"
                                                        >
                                                            <UserPlus className="h-4 w-4 text-primary" />
                                                        </Button>
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
                        <DialogDescription>
                            {editingSubject ? 'Update the subject details below.' : 'Fill in the details to create a new subject.'}
                        </DialogDescription>
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
                                        onValueChange={(value: 'K-12' | 'College') => {
                                            form.setData({
                                                ...form.data,
                                                classification: value,
                                                department_ids: [],
                                                program_ids: [],
                                                year_level_ids: [],
                                                section_ids: [],
                                                semester: 'none',
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classificationOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

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
                            </div>

                            {/* Departments multi-select */}
                            <div>
                                <Label>Departments</Label>
                                <div className="mt-1 max-h-36 overflow-y-auto rounded-md border p-2 space-y-1">
                                    {filteredDepartments.length === 0 ? (
                                        <p className="text-xs text-muted-foreground p-1">No departments available</p>
                                    ) : (
                                        filteredDepartments.map((dept) => (
                                            <label key={dept.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.department_ids.includes(dept.id.toString())}
                                                    onChange={() => toggleMultiSelect('department_ids', dept.id.toString())}
                                                    className="h-3.5 w-3.5"
                                                />
                                                <span className="text-sm">{dept.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {form.errors.department_ids && (
                                    <p className="mt-1 text-sm text-destructive">{form.errors.department_ids}</p>
                                )}
                            </div>

                            {/* Programs multi-select (College only, when college depts selected) */}
                            {isCollegeForm && programsForSelectedDepts.length > 0 && (
                                <div>
                                    <Label>Programs</Label>
                                    <div className="mt-1 max-h-32 overflow-y-auto rounded-md border p-2 space-y-1">
                                        {programsForSelectedDepts.map((prog) => (
                                            <label key={prog.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.program_ids.includes(prog.id.toString())}
                                                    onChange={() => toggleMultiSelect('program_ids', prog.id.toString())}
                                                    className="h-3.5 w-3.5"
                                                />
                                                <span className="text-sm">{prog.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Year Levels multi-select */}
                            {yearLevelsForSelectedDepts.length > 0 && (
                                <div>
                                    <Label>Year Levels</Label>
                                    <div className="mt-1 max-h-32 overflow-y-auto rounded-md border p-2 space-y-1">
                                        {yearLevelsForSelectedDepts.map((yl) => (
                                            <label key={yl.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.year_level_ids.includes(yl.id.toString())}
                                                    onChange={() => toggleMultiSelect('year_level_ids', yl.id.toString())}
                                                    className="h-3.5 w-3.5"
                                                />
                                                <span className="text-sm">{yl.name} <span className="text-xs text-muted-foreground">({yl.department?.name})</span></span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sections multi-select */}
                            {sectionsForSelectedYearLevels.length > 0 && (
                                <div>
                                    <Label>Sections</Label>
                                    <div className="mt-1 max-h-32 overflow-y-auto rounded-md border p-2 space-y-1">
                                        {sectionsForSelectedYearLevels.map((sec) => (
                                            <label key={sec.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.section_ids.includes(sec.id.toString())}
                                                    onChange={() => toggleMultiSelect('section_ids', sec.id.toString())}
                                                    className="h-3.5 w-3.5"
                                                />
                                                <span className="text-sm">{sec.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Units & Hours — College only */}
                            {isCollegeForm && (
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                            )}

                            {/* Period: Semester (College) or Quarter (K-12) */}
                            <div>
                                <Label htmlFor="semester">{periodLabel}</Label>
                                <Select
                                    value={form.data.semester}
                                    onValueChange={(value) => form.setData('semester', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

            {/* Teacher Assignment Dialog */}
            <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Assign Teachers — {subjectForTeacher?.code}
                        </DialogTitle>
                        <DialogDescription>
                            Select one or more teachers to assign to this subject.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <p className="text-sm text-muted-foreground">Select one or more teachers to assign to this subject.</p>
                        {teachers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No active teachers found.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                {teachers.map((teacher) => (
                                    <label
                                        key={teacher.id}
                                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                            selectedTeacherIds.includes(teacher.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:bg-muted/50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTeacherIds.includes(teacher.id)}
                                            onChange={() => toggleTeacher(teacher.id)}
                                            className="h-4 w-4 rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{teacher.full_name}</p>
                                            {teacher.department && (
                                                <p className="text-xs text-muted-foreground">{teacher.department}{teacher.specialization ? ` · ${teacher.specialization}` : ''}</p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTeacherDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssignTeachers}>Save Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </OwnerLayout>
    );
}
