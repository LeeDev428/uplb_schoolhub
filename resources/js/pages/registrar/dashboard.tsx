import { Head } from '@inertiajs/react';
import { StudentFilters } from '@/components/registrar/student-filters';
import { StudentStatCard } from '@/components/registrar/student-stat-card';
import { StudentTable } from '@/components/registrar/student-table';
import { Button } from '@/components/ui/button';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/registrar/dashboard',
    },
];

// Mock data - replace with actual data from backend
const mockStudents = [
    {
        id: '2023-001',
        lrn: '123456789012',
        name: 'John Michael Doe Jr.',
        email: 'john.doe@student.edu',
        avatar: undefined,
        type: 'new' as const,
        program: 'BS Information Technology',
        yearSection: '3rd Year - Section A',
        requirementsStatus: 'complete' as const,
        requirementsPercentage: 100,
        enrollmentStatus: 'enrolled' as const,
        remarks: 'graduating',
    },
    {
        id: '2023-002',
        lrn: '234567890123',
        name: 'Maria Cristina Santos',
        email: 'maria.santos@student.edu',
        avatar: undefined,
        type: 'transferee' as const,
        program: 'BS Computer Science',
        yearSection: '2nd Year - Section B',
        requirementsStatus: 'pending' as const,
        requirementsPercentage: 75,
        enrollmentStatus: 'pending-accounting' as const,
        remarks: 'part-time',
    },
    {
        id: '2023-003',
        lrn: '345678901234',
        name: 'Carlos Antonio Reyes',
        email: 'carlos.reyes@student.edu',
        avatar: undefined,
        type: 'returnee' as const,
        program: 'BS Business Administration',
        yearSection: '4th Year - Section A',
        requirementsStatus: 'incomplete' as const,
        requirementsPercentage: 45,
        enrollmentStatus: 'pending-registrar' as const,
        remarks: 'full-time',
    },
    {
        id: '2023-004',
        lrn: '456789012345',
        name: 'Ana Marie Cruz',
        email: 'ana.cruz@student.edu',
        avatar: undefined,
        type: 'new' as const,
        program: 'BS Information Technology',
        yearSection: '1st Year - Section C',
        requirementsStatus: 'pending' as const,
        requirementsPercentage: 60,
        enrollmentStatus: 'not-enrolled' as const,
    },
];

export default function Students() {
    const stats = {
        allStudents: 4,
        officiallyEnrolled: 1,
        notEnrolled: 1,
        registrarPending: 1,
        accountingPending: 1,
        graduated: 0,
        dropped: 0,
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
                            Manage and monitor all student records and
                            enrollments
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline">Follow Up Sectioning</Button>
                        <Button>+ Add New Student</Button>
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
                <StudentFilters />

                {/* Student Table */}
                <StudentTable students={mockStudents} />
            </div>
        </RegistrarLayout>
    );
}
