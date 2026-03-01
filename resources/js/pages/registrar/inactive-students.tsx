import { Head, router, usePage } from '@inertiajs/react';
import { UserX, UserCheck, Users, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pagination } from '@/components/ui/pagination';
import type { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inactive Students',
        href: '/registrar/inactive-students',
    },
];

interface InactiveStudent {
    id: number;
    lrn: string;
    first_name: string;
    last_name: string;
    email: string;
    student_photo_url: string | null;
    department: string | null;
    classification: string | null;
    year_level: string | null;
    school_year: string | null;
    enrollment_status: string;
}

interface PaginatedStudents {
    data: InactiveStudent[];
    links: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface DepartmentOption {
    value: string;
    label: string;
    classification: string;
}

interface Props {
    students: PaginatedStudents;
    filters: {
        search?: string;
        classification?: string;
        department_id?: string;
        year_level?: string;
        school_year?: string;
    };
    schoolYears: string[];
    departments: DepartmentOption[];
    appSettings: {
        has_k12: boolean;
        has_college: boolean;
    };
}

export default function InactiveStudentsIndex({ students, filters, schoolYears, departments, appSettings }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [studentToActivate, setStudentToActivate] = useState<InactiveStudent | null>(null);

    const hasBothClassifications = appSettings.has_k12 && appSettings.has_college;
    const activeClassification = filters.classification || '';

    const filteredDepartments = activeClassification
        ? departments.filter(d => d.classification === activeClassification)
        : departments;

    const applyFilter = (newFilters: Record<string, string | undefined>) => {
        const merged: Record<string, string | undefined> = { ...filters, ...newFilters, page: undefined };
        Object.keys(merged).forEach(k => {
            if (!merged[k]) delete merged[k];
        });
        router.get('/registrar/inactive-students', merged, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilter({ search: value || undefined });
    };

    const handleClassificationChange = (value: string) => {
        applyFilter({
            classification: value || undefined,
            department_id: undefined,
        });
    };

    const handleSchoolYearChange = (value: string) => {
        applyFilter({ school_year: value === '_all' ? undefined : value });
    };

    const handleDepartmentChange = (value: string) => {
        applyFilter({ department_id: value === '_all' ? undefined : value });
    };

    const handleActivate = () => {
        if (!studentToActivate) return;
        router.post(`/registrar/students/${studentToActivate.id}/activate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${studentToActivate.first_name} ${studentToActivate.last_name} has been activated.`);
                setStudentToActivate(null);
            },
            onError: () => {
                toast.error('Failed to activate student.');
            },
        });
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Inactive Students" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <UserX className="h-6 w-6" />
                            Inactive Students
                        </h1>
                        <p className="text-muted-foreground">
                            Students that have been deactivated and must re-register to enroll again.
                        </p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Stats Card */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Inactive</p>
                                <p className="text-2xl font-bold">{students.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classification Tabs & Filters */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {hasBothClassifications && (
                            <Tabs value={activeClassification || 'all'} onValueChange={(v) => handleClassificationChange(v === 'all' ? '' : v)}>
                                <TabsList>
                                    <TabsTrigger value="all">All Students</TabsTrigger>
                                    <TabsTrigger value="K-12">K-12</TabsTrigger>
                                    <TabsTrigger value="College">College</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <Filter className="h-4 w-4 text-muted-foreground" />

                            {/* School Year */}
                            <Select value={filters.school_year || '_all'} onValueChange={handleSchoolYearChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="School Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_all">All School Years</SelectItem>
                                    {schoolYears.map((sy) => (
                                        <SelectItem key={sy} value={sy}>{sy}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Department */}
                            <Select value={filters.department_id || '_all'} onValueChange={handleDepartmentChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_all">All Departments</SelectItem>
                                    {filteredDepartments.map((d) => (
                                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {(filters.classification || filters.school_year || filters.department_id) && (
                                <Button variant="ghost" size="sm" onClick={() => applyFilter({
                                    classification: undefined,
                                    school_year: undefined,
                                    department_id: undefined,
                                })}>
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, LRN, or email..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Inactive Student Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {students.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>LRN</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Year Level</TableHead>
                                                <TableHead>Last School Year</TableHead>
                                                <TableHead>Last Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.data.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {student.lrn}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={student.student_photo_url || ''} alt={`${student.first_name} ${student.last_name}`} />
                                                                <AvatarFallback className="text-xs">
                                                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{student.last_name}, {student.first_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {student.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.department ? (
                                                            <div>
                                                                <p className="text-sm">{student.department}</p>
                                                                {student.classification && (
                                                                    <Badge variant="outline" className="text-xs mt-1">
                                                                        {student.classification}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>{student.year_level || '-'}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {student.school_year || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {student.enrollment_status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-2">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                                                                        onClick={() => setStudentToActivate(student)}
                                                                    >
                                                                        <UserCheck className="h-3 w-3" />
                                                                        Activate
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="flex items-center gap-2">
                                                                            <UserCheck className="h-5 w-5 text-green-600" />
                                                                            Activate Student?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will reactivate{' '}
                                                                            <strong>
                                                                                {student.first_name} {student.last_name}
                                                                            </strong>
                                                                            {' '}and allow them to log in again. Their enrollment status will remain{' '}
                                                                            <em>not-enrolled</em> — they must go through the full registration process to enroll.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel onClick={() => setStudentToActivate(null)}>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction onClick={handleActivate} className="bg-green-600 hover:bg-green-700">
                                                                            Activate
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {students.last_page > 1 && (
                                    <div className="mt-4 flex justify-center">
                                        <Pagination data={students} preserveState={true} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Inactive Students</h3>
                                <p className="text-muted-foreground text-center">
                                    {(filters.search || filters.classification || filters.school_year || filters.department_id)
                                        ? 'No inactive students match your filter criteria.'
                                        : 'There are no deactivated student records.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RegistrarLayout>
    );
}
