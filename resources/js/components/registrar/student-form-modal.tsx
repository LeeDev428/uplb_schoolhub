import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState, useMemo, useRef, useEffect } from 'react';
import { store as storeStudent, update as updateStudent } from '@/routes/registrar/students';
import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X, User } from 'lucide-react';

interface Department {
    id: number;
    name: string;
    level: string;
}

interface Program {
    id: number;
    name: string;
    department_id: number;
    department: { id: number; name: string };
}

interface YearLevelData {
    id: number;
    name: string;
    department_id: number;
    level_number: number;
    department: { id: number; name: string };
}

interface Section {
    id: number;
    name: string;
    year_level_id: number;
    program_id: number | null;
    school_year: string;
    year_level: { id: number; name: string };
    program: { id: number; name: string } | null;
}

interface StudentFormModalProps {
    open: boolean;
    onClose: () => void;
    student?: any;
    mode?: 'create' | 'edit';
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevelData[];
    sections: Section[];
}

export function StudentFormModal({
    open,
    onClose,
    student,
    mode = 'create',
    departments,
    programs,
    yearLevels,
    sections,
}: StudentFormModalProps) {
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [selectedYearLevelId, setSelectedYearLevelId] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize photo preview when student data is available
    useEffect(() => {
        if (student?.student_photo_url) {
            setPhotoPreview(student.student_photo_url);
        } else {
            setPhotoPreview(null);
        }
    }, [student]);

    // Initialize selection states when editing a student
    useEffect(() => {
        if (student) {
            setSelectedDepartmentId(student.department_id?.toString() || '');
            setSelectedYearLevelId(student.year_level_id?.toString() || '');
            // Find program ID by name if program exists
            const matchedProgram = programs.find(p => p.name === student.program);
            setSelectedProgramId(matchedProgram?.id?.toString() || '');
        } else {
            setSelectedDepartmentId('');
            setSelectedYearLevelId('');
            setSelectedProgramId('');
        }
    }, [student, programs]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: student?.first_name || '',
        last_name: student?.last_name || '',
        middle_name: student?.middle_name || '',
        suffix: (student?.suffix && student.suffix !== 'none' && student.suffix !== 'None') ? student.suffix : '',
        lrn: student?.lrn || '',
        email: student?.email || '',
        phone: student?.phone || '',
        date_of_birth: student?.date_of_birth || '',
        gender: student?.gender || '',
        religion: student?.religion || '',
        mother_tongue: student?.mother_tongue || '',
        dialects: student?.dialects || '',
        ethnicities: student?.ethnicities || '',
        complete_address: student?.complete_address || '',
        city_municipality: student?.city_municipality || '',
        zip_code: student?.zip_code || '',
        student_type: student?.student_type || 'new',
        school_year: student?.school_year || '',
        department_id: student?.department_id?.toString() || '',
        program: student?.program || '',
        year_level: student?.year_level || '',
        year_level_id: student?.year_level_id?.toString() || '',
        section: student?.section || '',
        section_id: student?.section_id?.toString() || '',
        enrollment_status: student?.enrollment_status || 'pending-registrar',
        requirements_status: student?.requirements_status || 'incomplete',
        requirements_percentage: student?.requirements_percentage || 0,
        guardian_name: student?.guardian_name || '',
        guardian_relationship: student?.guardian_relationship || '',
        guardian_contact: student?.guardian_contact || '',
        guardian_email: student?.guardian_email || '',
        student_photo: null as File | null,
        remarks: student?.remarks || '',
    });

    // Filter programs based on selected department
    const filteredPrograms = useMemo(() => {
        if (!selectedDepartmentId) return [];
        const filtered = programs.filter(p => p.department_id.toString() === selectedDepartmentId);
        // Remove duplicates by program name
        const uniquePrograms = Array.from(
            new Map(filtered.map(p => [p.name, p])).values()
        );
        return uniquePrograms;
    }, [selectedDepartmentId, programs]);

    // Filter year levels based on selected department
    const filteredYearLevels = useMemo(() => {
        if (!selectedDepartmentId) return [];
        const filtered = yearLevels.filter(yl => yl.department_id.toString() === selectedDepartmentId);
        // Remove duplicates by year level name
        const uniqueYearLevels = Array.from(
            new Map(filtered.map(yl => [yl.name, yl])).values()
        );
        return uniqueYearLevels;
    }, [selectedDepartmentId, yearLevels]);

    // Filter sections based on selected year level and program
    const filteredSections = useMemo(() => {
        if (!selectedYearLevelId) return [];
        
        let filtered = sections.filter(s => s.year_level_id.toString() === selectedYearLevelId);
        
        // If a program is selected, only show sections for that program or sections without a program
        if (selectedProgramId) {
            filtered = filtered.filter(s => 
                s.program_id === null || s.program_id.toString() === selectedProgramId
            );
        }
        
        // Remove duplicates by section name - keep unique sections
        const uniqueSections = Array.from(
            new Map(filtered.map(s => [s.name, s])).values()
        );
        
        return uniqueSections;
    }, [selectedYearLevelId, selectedProgramId, sections]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Photo must be less than 2MB');
                return;
            }
            setData('student_photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setData('student_photo', null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post(storeStudent.url(), {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Student added successfully!');
                    reset();
                    setPhotoPreview(null);
                    onClose();
                },
                onError: () => {
                    toast.error('Failed to add student. Please check the form.');
                },
            });
        } else {
            post(updateStudent.url({ student: student.id }), {
                forceFormData: true,
                headers: {
                    'X-HTTP-Method-Override': 'PUT',
                },
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
            <DialogContent className="max-h-[95vh] max-w-4xl overflow-hidden p-0">
                <div className="flex max-h-[95vh] flex-col">
                    <DialogHeader className="shrink-0 border-b px-6 py-4">
                        <DialogTitle>
                            {mode === 'create' ? 'Add New Student' : 'Edit Student'}
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the student information below. Fields marked with * are required.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
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
                                <Select value={data.suffix || 'none'} onValueChange={value => setData('suffix', value === 'none' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select suffix" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
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
                                <Label htmlFor="department">Department *</Label>
                                <Select 
                                    value={selectedDepartmentId} 
                                    onValueChange={(value) => {
                                        setSelectedDepartmentId(value);
                                        setSelectedProgramId('');
                                        setSelectedYearLevelId('');
                                        setData('department_id', value);
                                        setData('program', '');
                                        setData('year_level', '');
                                        setData('year_level_id', '');
                                        setData('section', '');
                                        setData('section_id', '');
                                    }}
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
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="year_level">Year Level *</Label>
                                <Select 
                                    value={selectedYearLevelId} 
                                    onValueChange={(value) => {
                                        setSelectedYearLevelId(value);
                                        const yearLevel = yearLevels.find(yl => yl.id.toString() === value);
                                        setData('year_level', yearLevel?.name || '');
                                        setData('year_level_id', value);
                                        setData('section', '');
                                        setData('section_id', '');
                                    }}
                                    disabled={!selectedDepartmentId}
                                >
                                    <SelectTrigger className={errors.year_level ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={selectedDepartmentId ? "Select year level" : "Select department first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredYearLevels.map((yl) => (
                                            <SelectItem key={yl.id} value={yl.id.toString()}>
                                                {yl.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.year_level && (
                                    <p className="text-xs text-red-500">{errors.year_level}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="program">Program {filteredPrograms.length > 0 && '*'}</Label>
                                <Select 
                                    value={selectedProgramId} 
                                    onValueChange={(value) => {
                                        setSelectedProgramId(value);
                                        const program = programs.find(p => p.id.toString() === value);
                                        setData('program', program?.name || '');
                                        setData('section', '');
                                    }}
                                    disabled={filteredPrograms.length === 0}
                                >
                                    <SelectTrigger className={errors.program ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={filteredPrograms.length > 0 ? "Select program" : "Not applicable"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredPrograms.map((prog) => (
                                            <SelectItem key={prog.id} value={prog.id.toString()}>
                                                {prog.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filteredPrograms.length > 0 && errors.program && (
                                    <p className="text-xs text-red-500">{errors.program}</p>
                                )}
                                {filteredPrograms.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Programs only apply to college departments
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="section">Section *</Label>
                                <Select 
                                    value={data.section} 
                                    onValueChange={(value) => {
                                        const section = filteredSections.find(s => s.name === value);
                                        setData('section', value);
                                        setData('section_id', section?.id?.toString() || '');
                                    }}
                                    disabled={!selectedYearLevelId}
                                >
                                    <SelectTrigger className={errors.section ? 'border-red-500' : ''}>
                                        <SelectValue placeholder={selectedYearLevelId ? "Select section" : "Select year level first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredSections.map((sec) => (
                                            <SelectItem key={sec.id} value={sec.name}>
                                                {sec.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.section && (
                                    <p className="text-xs text-red-500">{errors.section}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="enrollment_status">Enrollment Status *</Label>
                                <Select value={data.enrollment_status} onValueChange={value => setData('enrollment_status', value)}>
                                    <SelectTrigger className={errors.enrollment_status ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
                                        <SelectItem value="pending-registrar">Pending - Registrar</SelectItem>
                                        <SelectItem value="pending-accounting">Pending - Accounting</SelectItem>
                                        <SelectItem value="enrolled">Officially Enrolled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.enrollment_status && (
                                    <p className="text-xs text-red-500">{errors.enrollment_status}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Additional Information</h3>
                        
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="remarks">Remarks</Label>
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
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    max={format(new Date(), 'yyyy-MM-dd')}
                                    className={errors.date_of_birth ? 'border-red-500' : ''}
                                />
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

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="religion">Religion</Label>
                                <Input
                                    id="religion"
                                    value={data.religion}
                                    onChange={e => setData('religion', e.target.value)}
                                    placeholder="Enter religion"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mother_tongue">Mother Tongue</Label>
                                <Input
                                    id="mother_tongue"
                                    value={data.mother_tongue}
                                    onChange={e => setData('mother_tongue', e.target.value)}
                                    placeholder="Enter mother tongue"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dialects">Dialects</Label>
                                <Input
                                    id="dialects"
                                    value={data.dialects}
                                    onChange={e => setData('dialects', e.target.value)}
                                    placeholder="Enter dialects"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ethnicities">Ethnicities</Label>
                                <Input
                                    id="ethnicities"
                                    value={data.ethnicities}
                                    onChange={e => setData('ethnicities', e.target.value)}
                                    placeholder="Enter ethnicities"
                                />
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
                                        <SelectItem value="Aunt">Aunt</SelectItem>
                                        <SelectItem value="Uncle">Uncle</SelectItem>
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
                            <Label>Student Photo (Optional)</Label>
                            <div className="flex items-start gap-4">
                                {/* Photo Preview */}
                                <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                                    {photoPreview ? (
                                        <>
                                            <img
                                                src={photoPreview}
                                                alt="Student photo preview"
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <User className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Upload Button */}
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="student_photo"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        JPEG, PNG, GIF or WebP.<br />Max 2MB.
                                    </p>
                                    {errors.student_photo && (
                                        <p className="text-xs text-red-500">{errors.student_photo}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                        </div>

                        <DialogFooter className="shrink-0 border-t px-6 py-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : mode === 'create' ? 'Save Student' : 'Update Student'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
