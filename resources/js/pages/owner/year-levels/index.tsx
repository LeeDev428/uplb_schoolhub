import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FilterBar } from '@/components/filters/filter-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { SearchBar } from '@/components/filters/search-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OwnerLayout from '@/layouts/owner/owner-layout';

interface Department {
    id: number;
    name: string;
    classification: 'K-12' | 'College';
    code: string;
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
    classification: 'K-12' | 'College';
    is_active: boolean;
    department: Department;
    program_id: number | null;
    sections_count?: number;
}

interface Props {
    yearLevels: {
        data: YearLevel[];
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
    filters: {
        search?: string;
        department_id?: string;
        classification?: string;
        status?: string;
    };
}

export default function YearLevelsIndex({ yearLevels, departments, programs, filters }: Props) {
    const { props } = usePage();
    const hasK12 = (props.appSettings as any)?.has_k12 !== false;
    const hasCollege = (props.appSettings as any)?.has_college !== false;
    const classificationOptions = [
        ...(hasK12 ? [{ value: 'K-12', label: 'K-12' }] : []),
        ...(hasCollege ? [{ value: 'College', label: 'College' }] : []),
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYearLevel, setEditingYearLevel] = useState<YearLevel | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        department_id: '',
        program_id: '' as string,
        classification: (hasK12 ? 'K-12' : 'College') as 'K-12' | 'College',
        name: '',
        level_number: 1,
        is_active: true,
    });

    // Programs available for the currently selected department
    const selectedDeptForForm = departments.find(d => d.id.toString() === form.data.department_id);
    const isCollegeDept = selectedDeptForForm?.classification === 'College';
    const programsForDept = programs.filter(p => p.department_id.toString() === form.data.department_id);

    const openCreateModal = () => {
        form.reset();
        setEditingYearLevel(null);
        setIsModalOpen(true);
    };

    const openEditModal = (yearLevel: YearLevel) => {
        setEditingYearLevel(yearLevel);
        form.setData({
            department_id: yearLevel.department.id.toString(),
            program_id: yearLevel.program_id?.toString() || '',
            classification: yearLevel.classification,
            name: yearLevel.name,
            level_number: yearLevel.level_number,
            is_active: yearLevel.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingYearLevel) {
            form.put(`/owner/year-levels/${editingYearLevel.id}`, {
                onSuccess: () => {
                    toast.success('Changes saved successfully');
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/owner/year-levels', {
                onSuccess: () => {
                    toast.success('Changes saved successfully');
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this year level?')) {
            router.delete(`/owner/year-levels/${id}`);
        }
    };

    const resetFilters = () => {
        setSearch('');
        setSelectedDepartment('all');
        setClassification('all');
        setStatus('all');
        router.get('/owner/year-levels');
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/year-levels', {
            search: value,
            department_id: selectedDepartment,
            classification,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        router.get('/owner/year-levels', {
            search,
            department_id: value,
            classification,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        router.get('/owner/year-levels', {
            search,
            department_id: selectedDepartment,
            classification: value,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/owner/year-levels', {
            search,
            department_id: selectedDepartment,
            classification,
            status: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Group departments by classification
    const k12Departments = departments.filter(d => d.classification === 'K-12');
    const collegeDepartments = departments.filter(d => d.classification === 'College');

    // Filter year levels based on active tab
    const filteredYearLevels = yearLevels.data.filter(yl => {
        if (activeTab === 'all') return true;
        if (activeTab === 'k12') return yl.classification === 'K-12';
        if (activeTab === 'college') return yl.classification === 'College';
        return true;
    });

    return (
        <OwnerLayout>
            <Head title="Year Levels" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Year Levels</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage grade/year levels</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Year Level
                    </Button>
                </div>

                {/* Year Levels with Department Tabs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Year Levels by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Bar */}
                        <FilterBar onReset={resetFilters} showReset={!!(search || classification !== 'all' || selectedDepartment !== 'all' || status !== 'all')}>
                            <SearchBar 
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search year levels..."
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
                        
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">All</TabsTrigger>
                                {hasK12 && <TabsTrigger value="k12">K-12</TabsTrigger>}
                                {hasCollege && <TabsTrigger value="college">College</TabsTrigger>}
                            </TabsList>

                            <TabsContent value={activeTab}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-semibold">Name</th>
                                                <th className="text-left p-3 font-semibold">Department</th>
                                                <th className="text-center p-3 font-semibold">Classification</th>
                                                <th className="text-center p-3 font-semibold">Level #</th>
                                                <th className="text-center p-3 font-semibold">Sections</th>
                                                <th className="text-center p-3 font-semibold">Status</th>
                                                <th className="text-center p-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredYearLevels.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center p-8 text-gray-500">
                                                        No year levels found for this department.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredYearLevels.map((yearLevel) => (
                                                    <tr key={yearLevel.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 font-medium">{yearLevel.name}</td>
                                                        <td className="p-3">
                                                            <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                                                {yearLevel.department.name}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                                                                yearLevel.classification === 'K-12' 
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-indigo-100 text-indigo-700'
                                                            }`}>
                                                                {yearLevel.classification}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">{yearLevel.level_number}</td>
                                                        <td className="p-3 text-center">{yearLevel.sections_count ?? 0}</td>
                                                        <td className="p-3 text-center">
                                                            <span
                                                                className={`inline-block px-2 py-1 text-xs rounded ${
                                                                    yearLevel.is_active
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                }`}
                                                            >
                                                                {yearLevel.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openEditModal(yearLevel)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(yearLevel.id)}
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
                            </TabsContent>
                        </Tabs>
                        
                        {/* Pagination */}
                        <Pagination data={yearLevels} />
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingYearLevel ? 'Edit Year Level' : 'Add New Year Level'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingYearLevel ? 'Update the year level details below.' : 'Fill in the details to create a new year level.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department *</Label>
                                <Select
                                    value={form.data.department_id}
                                    onValueChange={(value) => {
                                        const dept = departments.find(d => d.id.toString() === value);
                                        form.setData({
                                            ...form.data,
                                            department_id: value,
                                            program_id: '',
                                            classification: dept?.classification || 'K-12',
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hasK12 && k12Departments.length > 0 && (
                                            <>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">K-12</div>
                                                {k12Departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                        {hasCollege && collegeDepartments.length > 0 && (
                                            <>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">College</div>
                                                {collegeDepartments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                                {form.errors.department_id && (
                                    <p className="text-sm text-red-500">{form.errors.department_id}</p>
                                )}
                            </div>

                            {isCollegeDept && (
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

                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., Grade 1, 1st Year"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-500">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level_number">Level Number *</Label>
                                <Input
                                    id="level_number"
                                    type="number"
                                    min="1"
                                    value={form.data.level_number}
                                    onChange={(e) =>
                                        form.setData('level_number', parseInt(e.target.value))
                                    }
                                    required
                                />
                                <p className="text-xs text-gray-500">Used for sorting (1-12 for K-12, 1-4 for College)</p>
                                {form.errors.level_number && (
                                    <p className="text-sm text-red-500">{form.errors.level_number}</p>
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
