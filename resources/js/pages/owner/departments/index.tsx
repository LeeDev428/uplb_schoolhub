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

interface Department {
    id: number;
    name: string;
    description: string | null;
    level: 'elementary' | 'junior_high' | 'senior_high' | 'college';
    is_active: boolean;
    programs_count?: number;
    year_levels_count?: number;
}

interface Props {
    departments: Department[];
}

export default function DepartmentsIndex({ departments }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

    const form = useForm({
        name: '',
        description: '',
        level: 'elementary' as 'elementary' | 'junior_high' | 'senior_high' | 'college',
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
            description: department.description || '',
            level: department.level,
            is_active: department.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDepartment) {
            form.put(route('owner.departments.update', editingDepartment.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('owner.departments.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this department?')) {
            router.delete(route('owner.departments.destroy', id));
        }
    };

    const getLevelLabel = (level: string) => {
        const labels: Record<string, string> = {
            elementary: 'Elementary',
            junior_high: 'Junior High',
            senior_high: 'Senior High',
            college: 'College',
        };
        return labels[level] || level;
    };

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

                {/* Departments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Departments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Level</th>
                                        <th className="text-left p-3 font-semibold">Description</th>
                                        <th className="text-center p-3 font-semibold">Programs</th>
                                        <th className="text-center p-3 font-semibold">Year Levels</th>
                                        <th className="text-center p-3 font-semibold">Status</th>
                                        <th className="text-center p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8 text-gray-500">
                                                No departments found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        departments.map((dept) => (
                                            <tr key={dept.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{dept.name}</td>
                                                <td className="p-3">
                                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                                        {getLevelLabel(dept.level)}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {dept.description || '-'}
                                                </td>
                                                <td className="p-3 text-center">{dept.programs_count || 0}</td>
                                                <td className="p-3 text-center">{dept.year_levels_count || 0}</td>
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
                                    placeholder="e.g., College of Engineering"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-500">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">Level *</Label>
                                <Select
                                    value={form.data.level}
                                    onValueChange={(value) =>
                                        form.setData('level', value as any)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="elementary">Elementary</SelectItem>
                                        <SelectItem value="junior_high">Junior High</SelectItem>
                                        <SelectItem value="senior_high">Senior High</SelectItem>
                                        <SelectItem value="college">College</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.level && (
                                    <p className="text-sm text-red-500">{form.errors.level}</p>
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
