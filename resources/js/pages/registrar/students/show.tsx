import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/registrar/students',
    },
    {
        title: 'Student Details',
        href: '#',
    },
];

interface Student {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    lrn: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    complete_address: string;
    city_municipality: string;
    zip_code: string;
    student_type: string;
    school_year: string;
    program: string;
    year_level: string;
    section: string | null;
    enrollment_status: string;
    requirements_status: string;
    requirements_percentage: number;
    guardian_name: string;
    guardian_relationship: string;
    guardian_contact: string;
    guardian_email: string | null;
    student_photo_url: string | null;
    remarks: string | null;
}

interface Props {
    student: Student;
}

export default function ShowStudent({ student }: Props) {
    const fullName = `${student.first_name}${student.middle_name ? ' ' + student.middle_name : ''} ${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`;
    const getInitials = () => {
        return `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`.toUpperCase();
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Student: ${fullName}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Button variant="outline" asChild>
                        <Link href={route('registrar.students.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Students
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Card */}
                    <div className="md:col-span-1">
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={student.student_photo_url || undefined} />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="mt-4 text-2xl font-bold">{fullName}</h2>
                                <p className="text-sm text-muted-foreground">{student.lrn}</p>
                                
                                <div className="mt-4 flex flex-col space-y-2 w-full">
                                    <div className="flex items-center justify-center space-x-2 text-sm">
                                        <Mail className="h-4 w-4" />
                                        <span>{student.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center space-x-2 text-sm">
                                        <Phone className="h-4 w-4" />
                                        <span>{student.phone}</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col w-full space-y-2">
                                    <Badge className="justify-center py-2">
                                        {student.student_type.toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="justify-center py-2">
                                        {student.enrollment_status.replace('-', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Academic Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">School Year</p>
                                    <p className="font-medium">{student.school_year}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Program</p>
                                    <p className="font-medium">{student.program}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Year Level</p>
                                    <p className="font-medium">{student.year_level}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Section</p>
                                    <p className="font-medium">{student.section || 'TBD'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{student.date_of_birth}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium capitalize">{student.gender}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Complete Address</p>
                                    <p className="font-medium">{student.complete_address}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">City/Municipality</p>
                                    <p className="font-medium">{student.city_municipality}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">ZIP Code</p>
                                    <p className="font-medium">{student.zip_code}</p>
                                </div>
                            </div>
                        </div>

                        {/* Guardian Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Guardian Information</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Guardian Name</p>
                                    <p className="font-medium">{student.guardian_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Relationship</p>
                                    <p className="font-medium">{student.guardian_relationship}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Contact Number</p>
                                    <p className="font-medium">{student.guardian_contact}</p>
                                </div>
                                {student.guardian_email && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{student.guardian_email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Requirements Status */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="text-lg font-semibold mb-4">Requirements Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <p className="text-sm font-medium">Completion Progress</p>
                                        <p className="text-sm font-medium">{student.requirements_percentage}%</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${student.requirements_percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className="mt-1">
                                        {student.requirements_status.toUpperCase()}
                                    </Badge>
                                </div>
                                {student.remarks && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Remarks</p>
                                        <p className="font-medium">{student.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RegistrarLayout>
    );
}
