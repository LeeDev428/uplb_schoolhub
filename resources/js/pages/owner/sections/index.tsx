import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';

interface Department {
    id: number;
    name: string;
    classification: 'K-12' | 'College';
    code: string;
}

interface YearLevel {
    id: number;
    name: string;
    department?: Department;
}

interface Strand {
    id: number;
    name: string;
    code: string;
}

interface Program {
    id: number;
    name: string;
    department_id: number;
}

interface Section {
    id: number;
    name: string;
    code: string | null;
    capacity: number | null;
    room_number: string | null;
    is_active: boolean;
    year_level: YearLevel;
    department?: Department;
    strand?: Strand | null;
}

interface Props {
    sections: {
        data: Section[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    yearLevels: YearLevel[];
    departments: Department[];
    programs: Program[];
    strands: Strand[];
    filters: {
        search?: string;
        classification?: string;
        department_id?: string;
        year_level_id?: string;
        strand_id?: string;
        status?: string;
    };
}

export default function SectionsIndex({ sections, yearLevels, departments, programs, strands, filters }: Props) {
    const { props } = usePage();
    const hasK12 = (props.appSettings as any)?.has_k12 !== false;
    const hasCollege = (props.appSettings as any)?.has_college !== false;
    const classificationOptions = [
        ...(hasK12 ? [{ value: 'K-12', label: 'K-12' }] : []),
        ...(hasCollege ? [{ value: 'College', label: 'College' }] : []),
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [selectedYearLevel, setSelectedYearLevel] = useState(filters.year_level_id || 'all');
    const [selectedStrand, setSelectedStrand] = useState(filters.strand_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        department_id: '',
        program_id: '',
        year_level_id: '',
        strand_id: '',
        name: '',
        code: '',
        capacity: '',
        room_number: '',
        is_active: true,
    });

    // Derived values based on selected department in the form
    const selectedDeptForForm = departments.find(d => d.id.toString() === form.data.department_id);
    const isCollegeDeptForForm = selectedDeptForForm?.classification === 'College';
    const programsForDept = programs.filter(p => p.department_id.toString() === form.data.department_id);
    const yearLevelsForDept = form.data.department_id
        ? yearLevels.filter(yl => yl.department?.id.toString() === form.data.department_id)
        : yearLevels;

    const openCreateModal = () => {
        form.reset();
        setEditingSection(null);
        setIsModalOpen(true);
    };

    const openEditModal = (section: Section) => {
        setEditingSection(section);
        form.setData({
            department_id: section.department?.id.toString() || '',
            program_id: (section as any).program_id?.toString() || '',
            year_level_id: section.year_level.id.toString(),
            strand_id: section.strand?.id.toString() || '',
            name: section.name,
            code: section.code || '',
            capacity: section.capacity?.toString() || '',
            room_number: section.room_number || '',
            is_active: section.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSection) {
            form.put(`/owner/sections/${editingSection.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/owner/sections', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this section?')) {
            router.delete(`/owner/sections/${id}`);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setClassification('all');
        setSelectedDepartment('all');
        setSelectedYearLevel('all');
        setSelectedStrand('all');
        setStatus('all');
        router.get('/owner/sections');
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/sections', {
            search: value,
            classification,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        router.get('/owner/sections', {
            search,
            classification: value,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        router.get('/owner/sections', {
            search,
            classification,
            department_id: value,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleYearLevelChange = (value: string) => {
        setSelectedYearLevel(value);
        router.get('/owner/sections', {
            search,
            classification,
            department_id: selectedDepartment,
            year_level_id: value,
            strand_id: selectedStrand,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStrandChange = (value: string) => {
        setSelectedStrand(value);
        router.get('/owner/sections', {
            search,
            classification,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: value,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/owner/sections', {
            search,
            classification,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            status: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <OwnerLayout>
            <Head title="Sections" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Sections</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage class sections</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                    </Button>
                </div>

                {/* Sections Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Bar */}
                        <FilterBar onReset={resetFilters} showReset={!!(search || classification !== 'all' || selectedDepartment !== 'all' || selectedYearLevel !== 'all' || selectedStrand !== 'all' || status !== 'all')}>
                            <SearchBar 
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search sections..."
                            />
                            <FilterDropdown 
                                label="Classification"
                                value={classification}
                                onChange={handleClassificationChange}
                                options={classificationOptions}
                                placeholder="All Classifications"
                            />
                            <FilterDropdown 
                                label="Department"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                                placeholder="All Departments"
                            />
                            <FilterDropdown 
                                label="Year Level"
                                value={selectedYearLevel}
                                onChange={handleYearLevelChange}
                                options={yearLevels.map(yl => ({ value: yl.id.toString(), label: yl.name }))}
                                placeholder="All Year Levels"
                            />
                            <FilterDropdown 
                                label="Strand"
                                value={selectedStrand}
                                onChange={handleStrandChange}
                                options={strands.map(s => ({ value: s.id.toString(), label: s.name }))}
                                placeholder="All Strands"
                            />
                            <FilterDropdown 
                                label="Status"
                                value={status}
                                onChange={handleStatusChange}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' }
                                ]}
                                placeholder="All Status"
                            />
                        </FilterBar>
                        
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Code</th>
                                        <th className="text-left p-3 font-semibold">Department</th>
                                        <th className="text-left p-3 font-semibold">Year Level</th>
                                        <th className="text-left p-3 font-semibold">Strand</th>
                                        <th className="text-center p-3 font-semibold">Capacity</th>
                                        <th className="text-center p-3 font-semibold">Status</th>
                                        <th className="text-center p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-8 text-gray-500">
                                                No sections found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        sections.data.map((section) => (
                                            <tr key={section.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{section.name}</td>
                                                <td className="p-3">
                                                    {section.code ? (
                                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                            {section.code}
                                                        </span>
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="p-3">
                                                    {section.department ? (
                                                        <span className="inline-block px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">
                                                            {section.department.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                                        {section.year_level.name}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {section.strand ? (
                                                        <span className="inline-block px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                                                            {section.strand.code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {section.capacity || '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs rounded ${
                                                            section.is_active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {section.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openEditModal(section)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(section.id)}
                                                        >
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
                        
                        {/* Pagination */}
                        <Pagination data={sections} />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSection ? 'Edit Section' : 'Add New Section'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSection ? 'Update the section details below.' : 'Fill in the details to create a new section.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department *</Label>
                                <Select
                                    value={form.data.department_id}
                                    onValueChange={(value) => {
                                        form.setData({
                                            ...form.data,
                                            department_id: value,
                                            program_id: '',
                                            year_level_id: '',
                                            strand_id: '',
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                                {' '}
                                                <span className="text-xs text-muted-foreground">({dept.classification})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.department_id && (
                                    <p className="text-sm text-red-500">{form.errors.department_id}</p>
                                )}
                            </div>

                            {/* Programs dropdown — College only */}
                            {isCollegeDeptForForm && (
                                <div className="space-y-2">
                                    <Label htmlFor="program_id">Program (Optional)</Label>
                                    <Select
                                        value={form.data.program_id || 'none'}
                                        onValueChange={(value) => form.setData('program_id', value === 'none' ? '' : value)}
                                        disabled={programsForDept.length === 0}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={programsForDept.length === 0 ? 'No programs available' : 'Select program (optional)'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {programsForDept.map((prog) => (
                                                <SelectItem key={prog.id} value={prog.id.toString()}>
                                                    {prog.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.program_id && (
                                        <p className="text-sm text-red-500">{form.errors.program_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Year Level */}
                            <div className="space-y-2">
                                <Label htmlFor="year_level_id">Year Level *</Label>
                                <Select
                                    value={form.data.year_level_id}
                                    onValueChange={(value) => form.setData('year_level_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearLevelsForDept.map((yl) => (
                                            <SelectItem key={yl.id} value={yl.id.toString()}>
                                                {yl.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.year_level_id && (
                                    <p className="text-sm text-red-500">{form.errors.year_level_id}</p>
                                )}
                            </div>

                            {/* Strand — K-12 only */}
                            {!isCollegeDeptForForm && (
                                <div className="space-y-2">
                                    <Label htmlFor="strand_id">Strand (For SHS Only)</Label>
                                    <Select
                                        value={form.data.strand_id || 'none'}
                                        onValueChange={(value) => form.setData('strand_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select strand (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {strands.map((strand) => (
                                                <SelectItem key={strand.id} value={strand.id.toString()}>
                                                    {strand.name} ({strand.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.strand_id && (
                                        <p className="text-sm text-red-500">{form.errors.strand_id}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., Section A, Rose, Einstein"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-500">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Code (Optional)</Label>
                                <Input
                                    id="code"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value)}
                                    placeholder="e.g., A, B, STEM-A"
                                />
                                {form.errors.code && (
                                    <p className="text-sm text-red-500">{form.errors.code}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity (Optional)</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={form.data.capacity}
                                    onChange={(e) => form.setData('capacity', e.target.value)}
                                    placeholder="e.g., 40"
                                />
                                {form.errors.capacity && (
                                    <p className="text-sm text-red-500">{form.errors.capacity}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="room_number">Room Number (Optional)</Label>
                                <Input
                                    id="room_number"
                                    value={form.data.room_number}
                                    onChange={(e) => form.setData('room_number', e.target.value)}
                                    placeholder="e.g., Room 101"
                                />
                                {form.errors.room_number && (
                                    <p className="text-sm text-red-500">{form.errors.room_number}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
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
                                {form.processing ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </OwnerLayout>
    );
}
