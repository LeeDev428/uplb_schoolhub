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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';

interface Department {
    id: number;
    name: string;
    code: string;
    classification: 'K-12' | 'College';
    description: string | null;
    is_active: boolean;
    year_levels_count?: number;
    sections_count?: number;
    students_count?: number;
}

interface Props {
    departments: Department[];
    filters: {
        search?: string;
        classification?: string;
        status?: string;
    };
}

export default function DepartmentsIndex({ departments, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState(filters.search || '');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        name: '',
        code: '',
        classification: 'K-12' as 'K-12' | 'College',
        description: '',
        is_active: true,
    });

    const openCreateModal = () => {
        form.reset();
        setEditingDepartment(null);
        setIsModalOpen(true);
    };

    const openEditModal = (department: Department) => {
        setEditingDepartment(department);
        form.setData({
            name: department.name,
            code: department.code,
            classification: department.classification,
            description: department.description || '',
            is_active: department.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDepartment) {
            form.put(`/owner/departments/${editingDepartment.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/owner/departments', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this department?')) {
            router.delete(`/owner/departments/${id}`);
        }
    };

    const applyFilters = () => {
        router.get('/owner/departments', {
            search,
            classification,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearch('');
        setClassification('all');
        setStatus('all');
        router.get('/owner/departments');
    };

    // Trigger filter on change
    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/owner/departments', {
            search: value,
            classification,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        router.get('/owner/departments', {
            search,
            classification: value,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/owner/departments', {
            search,
            classification,
            status: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Filter departments based on active tab
    const filteredDepartments = departments.filter(dept => {
        if (activeTab === 'all') return true;
        if (activeTab === 'elementary') {
            return dept.name.toLowerCase().includes('elementary') || 
                   dept.name.toLowerCase().includes('elem') ||
                   dept.code === 'ELEM';
        }
        if (activeTab === 'jhs') {
            return dept.name.toLowerCase().includes('junior') || 
                   dept.code === 'JHS';
        }
        if (activeTab === 'shs') {
            return dept.name.toLowerCase().includes('senior') || 
                   dept.code === 'SHS';
        }
        if (activeTab === 'college') {
            return dept.classification === 'College';
        }
        return true;
    });

    return (
        <OwnerLayout>
            <Head title="Departments" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Departments</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage school departments</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>
                </div>

                {/* Departments Table with Tabs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Departments by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filter Bar */}
                        <FilterBar onReset={resetFilters} showReset={!!(search || classification !== 'all' || status !== 'all')}>
                            <SearchBar 
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search departments..."
                            />
                            <FilterDropdown 
                                label="Classification"
                                value={classification}
                                onChange={handleClassificationChange}
                                options={[
                                    { value: 'K-12', label: 'K-12' },
                                    { value: 'College', label: 'College' }
                                ]}
                                placeholder="All Classifications"
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
                                <TabsTrigger value="elementary">Elementary</TabsTrigger>
                                <TabsTrigger value="jhs">JHS</TabsTrigger>
                                <TabsTrigger value="shs">SHS</TabsTrigger>
                                <TabsTrigger value="college">College</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-semibold">Name</th>
                                                <th className="text-left p-3 font-semibold">Code</th>
                                                <th className="text-left p-3 font-semibold">Classification</th>
                                                <th className="text-left p-3 font-semibold">Description</th>
                                                <th className="text-center p-3 font-semibold">Year Levels</th>
                                                <th className="text-center p-3 font-semibold">Sections</th>
                                                <th className="text-center p-3 font-semibold">Students</th>
                                                <th className="text-center p-3 font-semibold">Status</th>
                                                <th className="text-center p-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDepartments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={9} className="text-center p-8 text-gray-500">
                                                        No departments found for this filter.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredDepartments.map((dept) => (
                                                    <tr key={dept.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 font-medium">{dept.name}</td>
                                                        <td className="p-3">
                                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                                {dept.code}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`inline-block px-2 py-1 text-xs rounded ${
                                                                dept.classification === 'K-12' 
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-indigo-100 text-indigo-700'
                                                            }`}>
                                                                {dept.classification}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-sm text-gray-600">
                                                            {dept.description || '-'}
                                                        </td>
                                                        <td className="p-3 text-center">{dept.year_levels_count || 0}</td>
                                                        <td className="p-3 text-center">{dept.sections_count || 0}</td>
                                                        <td className="p-3 text-center">{dept.students_count || 0}</td>
                                                        <td className="p-3 text-center">
                                                            <span
                                                                className={`inline-block px-2 py-1 text-xs rounded ${
                                                                    dept.is_active
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                }`}
                                                            >
                                                                {dept.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openEditModal(dept)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(dept.id)}
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
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingDepartment ? 'Edit Department' : 'Add New Department'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., Junior High School"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-500">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Code *</Label>
                                <Input
                                    id="code"
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g., JHS, ELEM, BSIT"
                                    required
                                />
                                {form.errors.code && (
                                    <p className="text-sm text-red-500">{form.errors.code}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="classification">Classification *</Label>
                                <Select
                                    value={form.data.classification}
                                    onValueChange={(value) =>
                                        form.setData('classification', value as 'K-12' | 'College')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select classification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="K-12">K-12</SelectItem>
                                        <SelectItem value="College">College</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.classification && (
                                    <p className="text-sm text-red-500">{form.errors.classification}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Optional description"
                                    rows={3}
                                />
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
