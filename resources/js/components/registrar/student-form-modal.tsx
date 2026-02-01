import { useForm } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StudentFormModalProps {
    open: boolean;
    onClose: () => void;
    student?: any;
    mode?: 'create' | 'edit';
}

export function StudentFormModal({
    open,
    onClose,
    student,
    mode = 'create',
}: StudentFormModalProps) {
    const [date, setDate] = useState<Date | undefined>(
        student?.date_of_birth ? new Date(student.date_of_birth) : undefined,
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: student?.first_name || '',
        last_name: student?.last_name || '',
        middle_name: student?.middle_name || '',
        suffix: student?.suffix || '',
        lrn: student?.lrn || '',
        email: student?.email || '',
        phone: student?.phone || '',
        date_of_birth: student?.date_of_birth || '',
        gender: student?.gender || '',
        complete_address: student?.complete_address || '',
        city_municipality: student?.city_municipality || '',
        zip_code: student?.zip_code || '',
        student_type: student?.student_type || 'new',
        school_year: student?.school_year || '',
        program: student?.program || '',
        year_level: student?.year_level || '',
        section: student?.section || '',
        enrollment_status: student?.enrollment_status || 'not-enrolled',
        requirements_status: student?.requirements_status || 'incomplete',
        requirements_percentage: student?.requirements_percentage || 0,
        guardian_name: student?.guardian_name || '',
        guardian_relationship: student?.guardian_relationship || '',
        guardian_contact: student?.guardian_contact || '',
        guardian_email: student?.guardian_email || '',
        student_photo_url: student?.student_photo_url || '',
        remarks: student?.remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
            date_of_birth: date ? format(date, 'yyyy-MM-dd') : '',
        };

        if (mode === 'create') {
            post(route('registrar.students.store'), {
                onSuccess: () => {
                    toast.success('Student added successfully!');
                    reset();
                    setDate(undefined);
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to add student. Please check the form.');
                },
            });
        } else {
            put(route('registrar.students.update', student.id), {
                onSuccess: () => {
                    toast.success('Student updated successfully!');
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to update student. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Add New Student' : 'Edit Student'}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the student information below. Fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    placeholder="Enter first name"
                                    className={errors.first_name ? 'border-red-500' : ''}
                                />
                                {errors.first_name && (
                                    <p className="text-xs text-red-500">{errors.first_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    placeholder="Enter last name"
                                    className={errors.last_name ? 'border-red-500' : ''}
                                />
                                {errors.last_name && (
                                    <p className="text-xs text-red-500">{errors.last_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={e => setData('middle_name', e.target.value)}
                                    placeholder="Enter middle name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Select value={data.suffix} onValueChange={value => setData('suffix', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select suffix" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                        <SelectItem value="II">II</SelectItem>
                                        <SelectItem value="III">III</SelectItem>
                                        <SelectItem value="IV">IV</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="student@example.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="+63 912 345 6789"
                                    className={errors.phone ? 'border-red-500' : ''}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Student Classification */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Student Classification</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="student_type">Student Type *</Label>
                                <Select value={data.student_type} onValueChange={value => setData('student_type', value)}>
                                    <SelectTrigger className={errors.student_type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="transferee">Transferee</SelectItem>
                                        <SelectItem value="returnee">Returnee</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.student_type && (
                                    <p className="text-xs text-red-500">{errors.student_type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lrn">Student ID / LRN *</Label>
                                <Input
                                    id="lrn"
                                    value={data.lrn}
                                    onChange={e => setData('lrn', e.target.value)}
                                    placeholder="Enter LRN or Student ID"
                                    className={errors.lrn ? 'border-red-500' : ''}
                                />
                                {errors.lrn && (
                                    <p className="text-xs text-red-500">{errors.lrn}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Academic Information</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="school_year">School Year *</Label>
                                <Input
                                    id="school_year"
                                    value={data.school_year}
                                    onChange={e => setData('school_year', e.target.value)}
                                    placeholder="2024-2025"
                                    className={errors.school_year ? 'border-red-500' : ''}
                                />
                                {errors.school_year && (
                                    <p className="text-xs text-red-500">{errors.school_year}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="program">Program *</Label>
                                <Select value={data.program} onValueChange={value => setData('program', value)}>
                                    <SelectTrigger className={errors.program ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BS Information Technology">BS Information Technology</SelectItem>
                                        <SelectItem value="BS Computer Science">BS Computer Science</SelectItem>
                                        <SelectItem value="BS Business Administration">BS Business Administration</SelectItem>
                                        <SelectItem value="BS Accountancy">BS Accountancy</SelectItem>
                                        <SelectItem value="BS Psychology">BS Psychology</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.program && (
                                    <p className="text-xs text-red-500">{errors.program}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year_level">Year Level *</Label>
                                <Select value={data.year_level} onValueChange={value => setData('year_level', value)}>
                                    <SelectTrigger className={errors.year_level ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select year level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1st Year">1st Year</SelectItem>
                                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                                        <SelectItem value="4th Year">4th Year</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.year_level && (
                                    <p className="text-xs text-red-500">{errors.year_level}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="section">Section *</Label>
                                <Input
                                    id="section"
                                    value={data.section}
                                    onChange={e => setData('section', e.target.value)}
                                    placeholder="TBD (To Be Determined)"
                                    className={errors.section ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-muted-foreground">
                                    TBD if section not yet finalized
                                </p>
                                {errors.section && (
                                    <p className="text-xs text-red-500">{errors.section}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Enrollment & Requirements Status */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Status Information</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="enrollment_status">Initial Enrollment Status</Label>
                                <Select value={data.enrollment_status} onValueChange={value => setData('enrollment_status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Not Enrolled (Default)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not-enrolled">Not Enrolled (Default)</SelectItem>
                                        <SelectItem value="pending-registrar">Pending Registrar</SelectItem>
                                        <SelectItem value="pending-accounting">Pending Accounting</SelectItem>
                                        <SelectItem value="enrolled">Enrolled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requirements_status">Initial Requirement Status</Label>
                                <Select value={data.requirements_status} onValueChange={value => setData('requirements_status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Incomplete (Default)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incomplete">Incomplete</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="complete">Complete</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="remarks">No Remark</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={e => setData('remarks', e.target.value)}
                                    placeholder="Enter any additional remarks or notes"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Details</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !date && 'text-muted-foreground',
                                                errors.date_of_birth && 'border-red-500',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, 'MM/dd/yyyy') : <span>mm/dd/yyyy</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.date_of_birth && (
                                    <p className="text-xs text-red-500">{errors.date_of_birth}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <Select value={data.gender} onValueChange={value => setData('gender', value)}>
                                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && (
                                    <p className="text-xs text-red-500">{errors.gender}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Address Information</h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="complete_address">Complete Address *</Label>
                            <Textarea
                                id="complete_address"
                                value={data.complete_address}
                                onChange={e => setData('complete_address', e.target.value)}
                                placeholder="Enter complete address"
                                rows={3}
                                className={errors.complete_address ? 'border-red-500' : ''}
                            />
                            {errors.complete_address && (
                                <p className="text-xs text-red-500">{errors.complete_address}</p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="city_municipality">City/Municipality *</Label>
                                <Input
                                    id="city_municipality"
                                    value={data.city_municipality}
                                    onChange={e => setData('city_municipality', e.target.value)}
                                    placeholder="Enter city or municipality"
                                    className={errors.city_municipality ? 'border-red-500' : ''}
                                />
                                {errors.city_municipality && (
                                    <p className="text-xs text-red-500">{errors.city_municipality}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="zip_code">ZIP Code *</Label>
                                <Input
                                    id="zip_code"
                                    value={data.zip_code}
                                    onChange={e => setData('zip_code', e.target.value)}
                                    placeholder="Enter ZIP code"
                                    className={errors.zip_code ? 'border-red-500' : ''}
                                />
                                {errors.zip_code && (
                                    <p className="text-xs text-red-500">{errors.zip_code}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Guardian Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Guardian Information</h3>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="guardian_name">Guardian Name *</Label>
                                <Input
                                    id="guardian_name"
                                    value={data.guardian_name}
                                    onChange={e => setData('guardian_name', e.target.value)}
                                    placeholder="Enter guardian name"
                                    className={errors.guardian_name ? 'border-red-500' : ''}
                                />
                                {errors.guardian_name && (
                                    <p className="text-xs text-red-500">{errors.guardian_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guardian_relationship">Relationship *</Label>
                                <Select value={data.guardian_relationship} onValueChange={value => setData('guardian_relationship', value)}>
                                    <SelectTrigger className={errors.guardian_relationship ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mother">Mother</SelectItem>
                                        <SelectItem value="Father">Father</SelectItem>
                                        <SelectItem value="Sibling">Sibling</SelectItem>
                                        <SelectItem value="Grandparent">Grandparent</SelectItem>
                                        <SelectItem value="Aunt/Uncle">Aunt/Uncle</SelectItem>
                                        <SelectItem value="Legal Guardian">Legal Guardian</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.guardian_relationship && (
                                    <p className="text-xs text-red-500">{errors.guardian_relationship}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guardian_contact">Guardian Contact *</Label>
                                <Input
                                    id="guardian_contact"
                                    value={data.guardian_contact}
                                    onChange={e => setData('guardian_contact', e.target.value)}
                                    placeholder="+63 912 345 6789"
                                    className={errors.guardian_contact ? 'border-red-500' : ''}
                                />
                                {errors.guardian_contact && (
                                    <p className="text-xs text-red-500">{errors.guardian_contact}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guardian_email">Guardian Email</Label>
                                <Input
                                    id="guardian_email"
                                    type="email"
                                    value={data.guardian_email}
                                    onChange={e => setData('guardian_email', e.target.value)}
                                    placeholder="guardian@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Optional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Optional Information</h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="student_photo_url">Student Photo URL (Optional)</Label>
                            <Input
                                id="student_photo_url"
                                type="url"
                                value={data.student_photo_url}
                                onChange={e => setData('student_photo_url', e.target.value)}
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : mode === 'create' ? 'Save Student' : 'Update Student'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
