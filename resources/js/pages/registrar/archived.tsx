import { Head, router, usePage } from '@inertiajs/react';
import { Archive, RotateCcw, Trash2, Users, Search, AlertTriangle, Filter } from 'lucide-react';
import { useState } from 'react';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archived Students',
        href: '/registrar/archived',
    },
];

interface ArchivedStudent {
    id: number;
    lrn: string;
    first_name: string;
    last_name: string;
    email: string;
    department: string | null;
    classification: string | null;
    year_level: string | null;
    school_year: string | null;
    enrollment_status: string;
    deleted_at: string;
}

interface PaginatedStudents {
    data: ArchivedStudent[];
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
        semester?: string;
    };
    schoolYears: string[];
    departments: DepartmentOption[];
    appSettings: {
        has_k12: boolean;
        has_college: boolean;
    };
}

export default function ArchivedStudentsIndex({ students, filters, schoolYears, departments, appSettings }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [isRestoring, setIsRestoring] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<ArchivedStudent | null>(null);

    const hasBothClassifications = appSettings.has_k12 && appSettings.has_college;
    const activeClassification = filters.classification || '';

    // Filter departments based on selected classification
    const filteredDepartments = activeClassification
        ? departments.filter(d => d.classification === activeClassification)
        : departments;

    const applyFilter = (newFilters: Record<string, string | undefined>) => {
        const merged = { ...filters, ...newFilters, page: undefined };
        // Remove empty values
        Object.keys(merged).forEach(k => {
            if (!merged[k]) delete merged[k];
        });
        router.get('/registrar/archived', merged, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        applyFilter({ search: value || undefined });
    };

    const handleClassificationChange = (value: string) => {
        // Reset dependent filters when classification changes
        applyFilter({
            classification: value || undefined,
            department_id: undefined,
            semester: undefined,
        });
    };

    const handleSchoolYearChange = (value: string) => {
        applyFilter({ school_year: value === '_all' ? undefined : value });
    };

    const handleSemesterChange = (value: string) => {
        applyFilter({ semester: value === '_all' ? undefined : value });
    };

    const handleDepartmentChange = (value: string) => {
        applyFilter({ department_id: value === '_all' ? undefined : value });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(students.data.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        }
    };

    const handleRestore = (studentId: number) => {
        router.post(`/registrar/archived/${studentId}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStudents(prev => prev.filter(id => id !== studentId));
            }
        });
    };

    const handleBulkRestore = () => {
        if (selectedStudents.length === 0) return;
        setIsRestoring(true);
        router.post('/registrar/archived/bulk-restore', {
            student_ids: selectedStudents,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsRestoring(false);
                setSelectedStudents([]);
            }
        });
    };

    const handlePermanentDelete = () => {
        if (!studentToDelete) return;
        router.delete(`/registrar/archived/${studentToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setStudentToDelete(null),
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Archived Students" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Archive className="h-6 w-6" />
                            Archived Students
                        </h1>
                        <p className="text-muted-foreground">
                            Students that have been archived (soft deleted). Restore or permanently remove them here.
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
                            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Archived</p>
                                <p className="text-2xl font-bold">{students.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classification Tabs & Filters */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Classification Tabs */}
                        {hasBothClassifications && (
                            <Tabs value={activeClassification || 'all'} onValueChange={(v) => handleClassificationChange(v === 'all' ? '' : v)}>
                                <TabsList>
                                    <TabsTrigger value="all">All Students</TabsTrigger>
                                    <TabsTrigger value="K-12">K-12</TabsTrigger>
                                    <TabsTrigger value="College">College</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}

                        {/* Filter Row */}
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

                            {/* Semester - only for college */}
                            {(activeClassification === 'College' || (!hasBothClassifications && appSettings.has_college)) && (
                                <Select value={filters.semester || '_all'} onValueChange={handleSemesterChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All Semesters</SelectItem>
                                        <SelectItem value="1">1st Semester</SelectItem>
                                        <SelectItem value="2">2nd Semester</SelectItem>
                                        <SelectItem value="3">Summer</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

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
                            {(filters.classification || filters.school_year || filters.semester || filters.department_id) && (
                                <Button variant="ghost" size="sm" onClick={() => applyFilter({
                                    classification: undefined,
                                    school_year: undefined,
                                    semester: undefined,
                                    department_id: undefined,
                                })}>
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Search & Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, LRN, or email..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {selectedStudents.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleBulkRestore}
                            disabled={isRestoring}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Restore ({selectedStudents.length})
                        </Button>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Archived Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {students.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={
                                                            selectedStudents.length === students.data.length &&
                                                            students.data.length > 0
                                                        }
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>LRN</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Year Level</TableHead>
                                                <TableHead>School Year</TableHead>
                                                <TableHead>Last Status</TableHead>
                                                <TableHead>Archived On</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.data.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedStudents.includes(student.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleSelectStudent(student.id, !!checked)
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {student.lrn}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {student.last_name}, {student.first_name}
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
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {formatDate(student.deleted_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRestore(student.id)}
                                                                className="gap-1"
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                                Restore
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => setStudentToDelete(student)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="flex items-center gap-2">
                                                                            <AlertTriangle className="h-5 w-5 text-destructive" />
                                                                            Permanently Delete Student?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete
                                                                            <strong className="mx-1">
                                                                                {student.first_name} {student.last_name}
                                                                            </strong>
                                                                            and all associated records from the database.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel onClick={() => setStudentToDelete(null)}>
                                                                            Cancel
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={handlePermanentDelete}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Delete Permanently
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
                                        <Pagination
                                            currentPage={students.current_page}
                                            totalPages={students.last_page}
                                            onPageChange={(page) => {
                                                router.get('/registrar/archived', { ...filters, page }, {
                                                    preserveState: true,
                                                });
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Archived Students</h3>
                                <p className="text-muted-foreground text-center">
                                    {(filters.search || filters.classification || filters.school_year || filters.semester || filters.department_id)
                                        ? 'No archived students match your filter criteria.'
                                        : 'There are no archived student records.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RegistrarLayout>
    );
}
