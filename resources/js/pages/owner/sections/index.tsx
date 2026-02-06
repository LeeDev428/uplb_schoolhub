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

interface YearLevel {
    id: number;
    name: string;
}

interface Program {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    capacity: number | null;
    school_year: string;
    is_active: boolean;
    year_level: YearLevel;
    program: Program | null;
}

interface Props {
    sections: Section[];
    yearLevels: YearLevel[];
    programs: Program[];
}

export default function SectionsIndex({ sections, yearLevels, programs }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    const form = useForm({
        year_level_id: '',
        program_id: '',
        name: '',
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
            year_level_id: section.year_level.id.toString(),
            program_id: section.program?.id.toString() || '',
            name: section.name,
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Year Level</th>
                                        <th className="text-left p-3 font-semibold">Program</th>
                                        <th className="text-center p-3 font-semibold">Capacity</th>
                                        <th className="text-center p-3 font-semibold">School Year</th>
                                        <th className="text-center p-3 font-semibold">Status</th>
                                        <th className="text-center p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8 text-gray-500">
                                                No sections found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        sections.map((section) => (
                                            <tr key={section.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{section.name}</td>
                                                <td className="p-3">
                                                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                                                        {section.year_level.name}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {section.program ? (
                                                        <span className="inline-block px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                                                            {section.program.name}
                                                        </span>
                                                    ) : (
                                                        '-'
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
                                                {yl.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.year_level_id && (
                                    <p className="text-sm text-red-500">{form.errors.year_level_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="program_id">Program (Optional)</Label>
                                <Select
                                    value={form.data.program_id}
                                    onValueChange={(value) => form.setData('program_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select program (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {programs.map((prog) => (
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
