import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';

interface Requirement {
    id: number;
    name: string;
    description: string;
    deadline_type: string;
    deadline_text: string;
    applies_to_new_enrollee: boolean;
    applies_to_transferee: boolean;
    applies_to_returning: boolean;
    applies_to_text: string;
    is_required: boolean;
    is_active: boolean;
}

interface RequirementCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    requirements: Requirement[];
}

interface Props {
    categories: RequirementCategory[];
}

export default function RequirementsIndex({ categories }: Props) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.slug || 'new-enrollee');

    const handleDeleteRequirement = (requirementId: number, requirementName: string) => {
        if (window.confirm(`Are you sure you want to delete "${requirementName}"?`)) {
            router.delete(`/registrar/requirements/${requirementId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Requirement deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete requirement');
                },
            });
        }
    };

    const getCategoryColor = (slug: string) => {
        const colors = {
            'new-enrollee': 'bg-blue-100 text-blue-800',
            'transferee': 'bg-purple-100 text-purple-800',
            'common': 'bg-green-100 text-green-800',
        };
        return colors[slug as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getDeadlineColor = (deadlineType: string) => {
        const colors = {
            'during_enrollment': 'bg-yellow-100 text-yellow-800',
            'before_classes': 'bg-orange-100 text-orange-800',
            'custom': 'bg-blue-100 text-blue-800',
        };
        return colors[deadlineType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <RegistrarLayout>
            <Head title="Requirements Manager" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Requirements Manager</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage enrollment requirements by category
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Requirement
                    </Button>
                </div>

                {/* Category Tabs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Requirements by Category</CardTitle>
                        <CardDescription>
                            Organize requirements for different student types
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                            <TabsList className="grid w-full grid-cols-3">
                                {categories.map((category) => (
                                    <TabsTrigger key={category.id} value={category.slug}>
                                        {category.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {categories.map((category) => (
                                <TabsContent key={category.id} value={category.slug} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">Requirements for {category.name}</h3>
                                            <p className="text-sm text-muted-foreground">{category.description}</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Requirement
                                        </Button>
                                    </div>

                                    {/* Requirements Table */}
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Requirement</TableHead>
                                                    <TableHead>Applies To</TableHead>
                                                    <TableHead>Deadline</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {category.requirements.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8">
                                                            <p className="text-muted-foreground">
                                                                No requirements yet. Add your first requirement to get started.
                                                            </p>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    category.requirements.map((requirement) => (
                                                        <TableRow key={requirement.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <div className="font-medium">{requirement.name}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {requirement.description}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {requirement.applies_to_new_enrollee && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            New Enrollee
                                                                        </Badge>
                                                                    )}
                                                                    {requirement.applies_to_transferee && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            Transferee
                                                                        </Badge>
                                                                    )}
                                                                    {requirement.applies_to_returning && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            Returning
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getDeadlineColor(requirement.deadline_type)}>
                                                                    {requirement.deadline_text}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={requirement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                                    {requirement.is_active ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex justify-end space-x-2">
                                                                    <Button variant="ghost" size="icon">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon"
                                                                        onClick={() => handleDeleteRequirement(requirement.id, requirement.name)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Assignment Table - Showing how requirements map to student types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assign Requirements to Student Types</CardTitle>
                        <CardDescription>
                            Configure which requirements apply to each student type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Requirement</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-center">New Enrollee</TableHead>
                                        <TableHead className="text-center">Transferee</TableHead>
                                        <TableHead className="text-center">Returning</TableHead>
                                        <TableHead>Deadline</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.flatMap(category => category.requirements).map((requirement) => (
                                        <TableRow key={requirement.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{requirement.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {requirement.description}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getCategoryColor(categories.find(c => c.requirements.some(r => r.id === requirement.id))?.slug || '')}>
                                                    {categories.find(c => c.requirements.some(r => r.id === requirement.id))?.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={requirement.applies_to_new_enrollee}
                                                        readOnly
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={requirement.applies_to_transferee}
                                                        readOnly
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={requirement.applies_to_returning}
                                                        readOnly
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{requirement.deadline_text}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleDeleteRequirement(requirement.id, requirement.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </RegistrarLayout>
    );
}
