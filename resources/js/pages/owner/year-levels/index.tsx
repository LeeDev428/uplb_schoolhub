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

interface Department {
    id: number;
    name: string;
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    is_active: boolean;
    department: Department;
}

interface Props {
    yearLevels: YearLevel[];
    departments: Department[];
}

export default function YearLevelsIndex({ yearLevels, departments }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYearLevel, setEditingYearLevel] = useState<YearLevel | null>(null);

    const form = useForm({
        department_id: '',
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
            name: yearLevel.name,
            level_number: yearLevel.level_number,
            is_active: yearLevel.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingYearLevel) {
            form.put(route('owner.year-levels.update', editingYearLevel.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('owner.year-levels.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this year level?')) {
            router.delete(route('owner.year-levels.destroy', id));
        }
    };

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

                {/* Year Levels Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Year Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Department</th>
                                        <th className="text-center p-3 font-semibold">Level Number</th>
                                        <th className="text-center p-3 font-semibold">Status</th>
                                        <th className="text-center p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearLevels.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center p-8 text-gray-500">
                                                No year levels found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        yearLevels.map((yearLevel) => (
                                            <tr key={yearLevel.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{yearLevel.name}</td>
                                                <td className="p-3">
                                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                                        {yearLevel.department.name}
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
