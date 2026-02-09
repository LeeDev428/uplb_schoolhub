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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';

interface Department {
    id: number;
    name: string;
    classification: 'K-12' | 'College';
    code: string;
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    classification: 'K-12' | 'College';
    is_active: boolean;
    department: Department;
}

interface Props {
    yearLevels: YearLevel[];
    departments: Department[];
    filters: {
        search?: string;
        department_id?: string;
        classification?: string;
        status?: string;
    };
}

export default function YearLevelsIndex({ yearLevels, departments, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYearLevel, setEditingYearLevel] = useState<YearLevel | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const form = useForm({
        department_id: '',
        classification: 'K-12' as 'K-12' | 'College',
        name: '',
        level_number: 1,
        is_active: true,
    });

    const openCreateModal = () => {
        form.reset();
        setEditingYearLevel(null);
        setIsModalOpen(true);
    };

    const openEditModal = (yearLevel: YearLevel) => {
        setEditingYearLevel(yearLevel);
        form.setData({
            department_id: yearLevel.department.id.toString(),
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
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/owner/year-levels', {
                onSuccess: () => {
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

    // Group departments by classification
    const k12Departments = departments.filter(d => d.classification === 'K-12');
    const collegeDepartments = departments.filter(d => d.classification === 'College');

    // Filter year levels based on active tab
    const filteredYearLevels = yearLevels.filter(yl => {
        if (activeTab === 'all') return true;
        if (activeTab === 'elementary') {
            return yl.department.name.toLowerCase().includes('elementary') || 
                   yl.department.name.toLowerCase().includes('elem') ||
                   yl.department.code === 'ELEM';
        }
        if (activeTab === 'jhs') {
            return yl.department.name.toLowerCase().includes('junior') || 
                   yl.department.code === 'JHS';
        }
        if (activeTab === 'shs') {
            return yl.department.name.toLowerCase().includes('senior') || 
                   yl.department.code === 'SHS';
        }
        if (activeTab === 'college') {
            return yl.classification === 'College';
        }
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
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                                                <th className="text-left p-3 font-semibold">Department</th>
                                                <th className="text-center p-3 font-semibold">Classification</th>
                                                <th className="text-center p-3 font-semibold">Level #</th>
                                                <th className="text-center p-3 font-semibold">Status</th>
                                                <th className="text-center p-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredYearLevels.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center p-8 text-gray-500">
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
                                            classification: dept?.classification || 'K-12',
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">K-12</div>
                                        {k12Departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">College</div>
                                        {collegeDepartments.map((dept) => (
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
                                <Label>Classification</Label>
                                <Input
                                    value={form.data.classification}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="text-xs text-gray-500">Auto-selected based on department</p>
                            </div>

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
