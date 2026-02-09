import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

interface Section {
    id: number;
    name: string;
    code: string | null;
    capacity: number | null;
    school_year: string;
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
    strands: Strand[];
    schoolYears: string[];
    filters: {
        search?: string;
        department_id?: string;
        year_level_id?: string;
        strand_id?: string;
        school_year?: string;
        status?: string;
    };
}

export default function SectionsIndex({ sections, yearLevels, departments, strands, schoolYears, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [selectedYearLevel, setSelectedYearLevel] = useState(filters.year_level_id || 'all');
    const [selectedStrand, setSelectedStrand] = useState(filters.strand_id || 'all');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState(filters.school_year || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        department_id: '',
        year_level_id: '',
        strand_id: '',
        name: '',
        code: '',
        capacity: '',
        school_year: new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString(),
        is_active: true,
    });

    const openCreateModal = () => {
        form.reset();
        form.setData('school_year', new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString());
        setEditingSection(null);
        setIsModalOpen(true);
    };

    const openEditModal = (section: Section) => {
        setEditingSection(section);
        form.setData({
            department_id: section.department?.id.toString() || '',
            year_level_id: section.year_level.id.toString(),
            strand_id: section.strand?.id.toString() || '',
            name: section.name,
            code: section.code || '',
            capacity: section.capacity?.toString() || '',
            school_year: section.school_year,
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
        setSelectedDepartment('all');
        setSelectedYearLevel('all');
        setSelectedStrand('all');
        setSelectedSchoolYear('all');
        setStatus('all');
        router.get('/owner/sections');
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/sections', {
            search: value,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            school_year: selectedSchoolYear,
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
            department_id: value,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            school_year: selectedSchoolYear,
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
            department_id: selectedDepartment,
            year_level_id: value,
            strand_id: selectedStrand,
            school_year: selectedSchoolYear,
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
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: value,
            school_year: selectedSchoolYear,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSchoolYearChange = (value: string) => {
        setSelectedSchoolYear(value);
        router.get('/owner/sections', {
            search,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            school_year: value,
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
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            strand_id: selectedStrand,
            school_year: selectedSchoolYear,
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
                        <FilterBar onReset={resetFilters} showReset={!!(search || selectedDepartment !== 'all' || selectedYearLevel !== 'all' || selectedStrand !== 'all' || selectedSchoolYear !== 'all' || status !== 'all')}>
                            <SearchBar 
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search sections..."
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
                                label="School Year"
                                value={selectedSchoolYear}
                                onChange={handleSchoolYearChange}
                                options={schoolYears.map(sy => ({ value: sy, label: sy }))}
                                placeholder="All School Years"
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
                                        <th className="text-left p-3 font-semibold">Department</th>
                                        <th className="text-left p-3 font-semibold">Year Level</th>
                                        <th className="text-left p-3 font-semibold">Strand</th>
                                        <th className="text-center p-3 font-semibold">Capacity</th>
                                        <th className="text-center p-3 font-semibold">School Year</th>
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
                                                <td className="p-3 text-center">{section.school_year}</td>
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSection ? 'Edit Section' : 'Add New Section'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department *</Label>
                                <Select
                                    value={form.data.department_id}
                                    onValueChange={(value) => form.setData('department_id', value)}
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
                                    <p className="text-sm text-red-500">{form.errors.department_id}</p>
                                )}
                            </div>

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
                                        {yearLevels.map((yl) => (
                                            <SelectItem key={yl.id} value={yl.id.toString()}>
                                                {yl.department ? `${yl.department.name} - ${yl.name}` : yl.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.year_level_id && (
                                    <p className="text-sm text-red-500">{form.errors.year_level_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="strand_id">Strand (For SHS Only)</Label>
                                <Select
                                    value={form.data.strand_id}
                                    onValueChange={(value) => form.setData('strand_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select strand (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
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
                                <Label htmlFor="school_year">School Year *</Label>
                                <Input
                                    id="school_year"
                                    value={form.data.school_year}
                                    onChange={(e) => form.setData('school_year', e.target.value)}
                                    placeholder="e.g., 2024-2025"
                                    required
                                />
                                {form.errors.school_year && (
                                    <p className="text-sm text-red-500">{form.errors.school_year}</p>
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
