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
}

interface Program {
    id: number;
    name: string;
    description: string | null;
    duration_years: number;
    is_active: boolean;
    department: Department;
}

interface Props {
    programs: Program[];
    departments: Department[];
}

export default function ProgramsIndex({ programs, departments }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const form = useForm({
        department_id: '',
        name: '',
        description: '',
        duration_years: 4,
        is_active: true,
    });

    const openCreateModal = () => {
        form.reset();
        setEditingProgram(null);
        setIsModalOpen(true);
    };

    const openEditModal = (program: Program) => {
        setEditingProgram(program);
        form.setData({
            department_id: program.department.id.toString(),
            name: program.name,
            description: program.description || '',
            duration_years: program.duration_years,
            is_active: program.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProgram) {
            form.put(route('owner.programs.update', editingProgram.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('owner.programs.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this program?')) {
            router.delete(route('owner.programs.destroy', id));
        }
    };

    return (
        <OwnerLayout>
            <Head title="Programs" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Programs</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage academic programs</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Program
                    </Button>
                </div>

                {/* Programs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Department</th>
                                        <th className="text-left p-3 font-semibold">Description</th>
                                        <th className="text-center p-3 font-semibold">Duration (Years)</th>
                                        <th className="text-center p-3 font-semibold">Status</th>
                                        <th className="text-center p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-gray-500">
                                                No programs found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        programs.map((program) => (
                                            <tr key={program.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{program.name}</td>
                                                <td className="p-3">
                                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                                        {program.department.name}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {program.description || '-'}
                                                </td>
                                                <td className="p-3 text-center">{program.duration_years}</td>
                                                <td className="p-3 text-center">
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs rounded ${
                                                            program.is_active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {program.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openEditModal(program)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(program.id)}
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
                            {editingProgram ? 'Edit Program' : 'Add New Program'}
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
                                    placeholder="e.g., Bachelor of Science in Computer Science"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-500">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration_years">Duration (Years) *</Label>
                                <Input
                                    id="duration_years"
                                    type="number"
                                    min="1"
                                    value={form.data.duration_years}
                                    onChange={(e) =>
                                        form.setData('duration_years', parseInt(e.target.value))
                                    }
                                    required
                                />
                                {form.errors.duration_years && (
                                    <p className="text-sm text-red-500">{form.errors.duration_years}</p>
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
