import { Head, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StudentFilters } from '@/components/registrar/student-filters';
import { StudentFormModal } from '@/components/registrar/student-form-modal';
import { StudentStatCard } from '@/components/registrar/student-stat-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/registrar/students',
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
    student_type: 'new' | 'transferee' | 'returnee';
    program: string;
    year_level: string;
    section: string | null;
    enrollment_status: 'not-enrolled' | 'pending-registrar' | 'pending-accounting' | 'enrolled' | 'graduated' | 'dropped';
    requirements_status: 'incomplete' | 'pending' | 'complete';
    requirements_percentage: number;
    student_photo_url: string | null;
    remarks: string | null;
}

interface PaginatedStudents {
    data: Student[];
    links: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    allStudents: number;
    officiallyEnrolled: number;
    notEnrolled: number;
    registrarPending: number;
    accountingPending: number;
    graduated: number;
    dropped: number;
}

interface Props {
    students: PaginatedStudents;
    stats: Stats;
    programs: string[];
    yearLevels: string[];
    filters: any;
    flash?: {
        success?: string;
    };
}

export default function StudentsIndex({ students, stats, programs, yearLevels, filters, flash }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>();
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const handleAddStudent = () => {
        setEditingStudent(undefined);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleDeleteStudent = (studentId: number) => {
        if (confirm('Are you sure you want to delete this student?')) {
            router.delete(route('registrar.students.destroy', studentId), {
                onSuccess: () => {
                    toast.success('Student deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete student.');
                },
            });
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getTypeColor = (type: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            transferee: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            returnee: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        };
        return colors[type as keyof typeof colors] || colors.new;
    };

    const getEnrollmentStatusColor = (status: string) => {
        const colors = {
            'not-enrolled': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            'pending-registrar': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            'pending-accounting': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            'enrolled': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            'graduated': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            'dropped': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        };
        return colors[status as keyof typeof colors] || colors['not-enrolled'];
    };

    const getRequirementsStatusColor = (status: string) => {
        const colors = {
            incomplete: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            complete: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        };
        return colors[status as keyof typeof colors] || colors.incomplete;
    };

    const formatStatus = (status: string) => {
        return status
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Student Management
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage and monitor all student records and enrollments
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline">Follow Up Sectioning</Button>
                        <Button onClick={handleAddStudent}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Student
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    <StudentStatCard
                        title="All Students"
                        value={stats.allStudents}
                        color="blue"
                        label="Total"
                    />
                    <StudentStatCard
                        title="Officially Enrolled"
                        value={stats.officiallyEnrolled}
                        color="green"
                        label="Enrolled"
                    />
                    <StudentStatCard
                        title="Not Enrolled"
                        value={stats.notEnrolled}
                        color="orange"
                        label="Pending"
                    />
                    <StudentStatCard
                        title="Registrar Pending"
                        value={stats.registrarPending}
                        color="sky"
                        label="Documents"
                    />
                    <StudentStatCard
                        title="Accounting Pending"
                        value={stats.accountingPending}
                        color="purple"
                        label="Payment"
                    />
                    <StudentStatCard
                        title="Graduated"
                        value={stats.graduated}
                        color="green"
                        label="Alumni"
                    />
                    <StudentStatCard
                        title="Dropped"
                        value={stats.dropped}
                        color="red"
                        label="Inactive"
                    />
                </div>

                {/* Filters */}
                <StudentFilters programs={programs} yearLevels={yearLevels} filters={filters} />

                {/* Student Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>LRN/ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Year & Section</TableHead>
                                <TableHead>Requirements</TableHead>
                                <TableHead>Enrollment Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <p className="text-muted-foreground">No students found. Add your first student to get started.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.data.map((student) => {
                                    const fullName = `${student.first_name}${student.middle_name ? ' ' + student.middle_name : ''} ${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`;
                                    const yearSection = `${student.year_level}${student.section ? ' - ' + student.section : ''}`;
                                    
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={student.student_photo_url || undefined} />
                                                        <AvatarFallback>
                                                            {getInitials(student.first_name, student.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{fullName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {student.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{student.lrn}</TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(student.student_type)}>
                                                    {formatStatus(student.student_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {student.program}
                                            </TableCell>
                                            <TableCell>{yearSection}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={getRequirementsStatusColor(student.requirements_status)}>
                                                        {formatStatus(student.requirements_status)}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {student.requirements_percentage}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getEnrollmentStatusColor(student.enrollment_status)}>
                                                    {formatStatus(student.enrollment_status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.visit(route('registrar.students.show', student.id))}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditStudent(student)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteStudent(student.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {students.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {students.data.length} of {students.total} students
                            </div>
                            <div className="flex space-x-2">
                                {students.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Form Modal */}
            <StudentFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                student={editingStudent}
                mode={modalMode}
            />
        </RegistrarLayout>
    );
}
