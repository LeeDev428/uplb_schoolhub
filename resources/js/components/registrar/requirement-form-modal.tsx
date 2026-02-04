import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { showSuccess, showError } from './registrar-messages';

interface RequirementCategory {
    id: number;
    name: string;
    slug: string;
}

interface Requirement {
    id: number;
    name: string;
    description: string;
    requirement_category_id: number;
    deadline_type: string;
    custom_deadline?: string;
    applies_to_new_enrollee: boolean;
    applies_to_transferee: boolean;
    applies_to_returning: boolean;
    is_required: boolean;
}

interface RequirementFormModalProps {
    open: boolean;
    onClose: () => void;
    categories: RequirementCategory[];
    requirement?: Requirement;
    mode: 'create' | 'edit';
}

export function RequirementFormModal({ open, onClose, categories, requirement, mode }: RequirementFormModalProps) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        requirement_category_id: categories[0]?.id || 0,
        deadline_type: 'during_enrollment',
        custom_deadline: '',
        applies_to_new_enrollee: true,
        applies_to_transferee: false,
        applies_to_returning: false,
        is_required: true,
    });

    // Simple local state for checkboxes
    const [newEnrollee, setNewEnrollee] = useState(true);
    const [transferee, setTransferee] = useState(false);
    const [returning, setReturning] = useState(false);
    const [required, setRequired] = useState(true);

    useEffect(() => {
        if (open) {
            if (requirement && mode === 'edit') {
                setData({
                    name: requirement.name,
                    description: requirement.description,
                    requirement_category_id: requirement.requirement_category_id,
                    deadline_type: requirement.deadline_type,
                    custom_deadline: requirement.custom_deadline || '',
                    applies_to_new_enrollee: requirement.applies_to_new_enrollee,
                    applies_to_transferee: requirement.applies_to_transferee,
                    applies_to_returning: requirement.applies_to_returning,
                    is_required: requirement.is_required,
                });
                setNewEnrollee(requirement.applies_to_new_enrollee);
                setTransferee(requirement.applies_to_transferee);
                setReturning(requirement.applies_to_returning);
                setRequired(requirement.is_required);
            } else {
                reset();
                setNewEnrollee(true);
                setTransferee(false);
                setReturning(false);
                setRequired(true);
            }
        }
    }, [open, requirement, mode]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Update form data with checkbox values before submitting
        setData({
            ...data,
            applies_to_new_enrollee: newEnrollee,
            applies_to_transferee: transferee,
            applies_to_returning: returning,
            is_required: required,
        });

        if (mode === 'create') {
            post('/registrar/documents/requirements', {
                onSuccess: () => {
                    showSuccess('Requirement created successfully!');
                    reset();
                    setNewEnrollee(true);
                    setTransferee(false);
                    setReturning(false);
                    setRequired(true);
                    onClose();
                },
                onError: () => {
                    showError('Failed to create requirement. Please check the form.');
                },
            });
        } else if (requirement) {
            put(`/registrar/documents/requirements/${requirement.id}`, {
                onSuccess: () => {
                    showSuccess('Requirement updated successfully!');
                    onClose();
                },
                onError: () => {
                    showError('Failed to update requirement. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Add New Requirement' : 'Edit Requirement'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* Requirement Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Requirement Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Form 138 (Report Card)"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of the requirement"
                            rows={3}
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={data.requirement_category_id.toString()}
                            onValueChange={(value) => setData('requirement_category_id', parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.requirement_category_id && (
                            <p className="text-sm text-red-500">{errors.requirement_category_id}</p>
                        )}
                    </div>

                    {/* Deadline */}
                    <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Select
                            value={data.deadline_type}
                            onValueChange={(value) => setData('deadline_type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select deadline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="during_enrollment">During Enrollment</SelectItem>
                                <SelectItem value="before_classes">Before Classes Start</SelectItem>
                                <SelectItem value="custom">Custom Date</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.deadline_type && <p className="text-sm text-red-500">{errors.deadline_type}</p>}
                    </div>

                    {/* Custom Deadline Date (if custom selected) */}
                    {data.deadline_type === 'custom' && (
                        <div className="space-y-2">
                            <Label htmlFor="custom_deadline">Custom Deadline Date</Label>
                            <Input
                                id="custom_deadline"
                                type="date"
                                value={data.custom_deadline}
                                onChange={(e) => setData('custom_deadline', e.target.value)}
                            />
                            {errors.custom_deadline && (
                                <p className="text-sm text-red-500">{errors.custom_deadline}</p>
                            )}
                        </div>
                    )}

                    {/* Required For Student Types */}
                    <div className="space-y-3">
                        <Label>Required For Student Types</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="new_enrollee"
                                    checked={newEnrollee}
                                    onChange={(e) => setNewEnrollee(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label
                                    htmlFor="new_enrollee"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    New Enrollee
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="transferee"
                                    checked={transferee}
                                    onChange={(e) => setTransferee(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label
                                    htmlFor="transferee"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    Transferee
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="returning"
                                    checked={returning}
                                    onChange={(e) => setReturning(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label
                                    htmlFor="returning"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    Returning Student
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Mandatory Requirement */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_required"
                            checked={required}
                            onChange={(e) => setRequired(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                            htmlFor="is_required"
                            className="text-sm font-medium leading-none cursor-pointer"
                        >
                            Mandatory Requirement
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {mode === 'create' ? 'Save Requirement' : 'Update Requirement'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
