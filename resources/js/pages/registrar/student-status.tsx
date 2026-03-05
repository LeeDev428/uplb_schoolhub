import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    RotateCcw,
    Trash2,
    UserCheck,
    UserMinus,
    UserX,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar } from '@/components/filters/filter-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { SearchBar } from '@/components/filters/search-bar';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Status', href: '/registrar/student-status' },
];

interface StatusStudent {
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
    is_active: boolean;
    deleted_at: string | null;
}

interface PaginatedStudents {
    data: StatusStudent[];
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
    tab: string;
    filters: {
        search?: string;
        classification?: string;
        department_id?: string;
    };
    departments: DepartmentOption[];
    counts: {
        dropped: number;
        archived: number;
        deactivated: number;
    };
    appSettings: {
        has_k12: boolean;
        has_college: boolean;
    };
}

const BASE_URL = '/registrar/student-status';

export default function StudentStatusPage({
    students,
    tab,
    filters,
    departments,
    counts,
    appSettings,
}: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search ?? '');
    const [confirmStudent, setConfirmStudent] = useState<StatusStudent | null>(null);
    const [confirmAction, setConfirmAction] = useState<'reactivate' | 'activate' | 'restore' | 'force-delete' | null>(null);

    const hasBothClassifications = appSettings.has_k12 && appSettings.has_college;

    const filteredDepts = filters.classification
        ? departments.filter((d) => d.classification === filters.classification)
        : departments;

    const classificationOptions = [
        { value: 'K-12', label: 'K-12' },
        { value: 'College', label: 'College' },
    ];

    const apply = (newFilters: Record<string, string | undefined>) => {
        const merged: Record<string, string | undefined> = { tab, ...filters, ...newFilters, page: undefined };
        Object.keys(merged).forEach((k) => { if (!merged[k]) delete merged[k]; });
        router.get(BASE_URL, merged, { preserveState: true, replace: true });
    };

    const handleTabChange = (newTab: string) => {
        router.get(BASE_URL, { tab: newTab }, { preserveState: false, replace: true });
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        apply({ search: value || undefined });
    };

    const handleReset = () => {
        setSearch('');
        router.get(BASE_URL, { tab }, { replace: true });
    };

    const doAction = () => {
        if (!confirmStudent || !confirmAction) return;
        const { id, first_name, last_name } = confirmStudent;
        const name = `${first_name} ${last_name}`;

        const urls: Record<string, string> = {
            reactivate: `/registrar/students/${id}/reactivate`,
            activate:   `/registrar/students/${id}/activate`,
            restore:    `/registrar/archived/${id}/restore`,
            'force-delete': `/registrar/archived/${id}`,
        };

        const isDelete = confirmAction === 'force-delete';

        const fn = isDelete
            ? () => router.delete(urls[confirmAction], {
                preserveScroll: true,
                onSuccess: () => { toast.success(`${name} permanently deleted.`); },
                onError: () => toast.error('Action failed.'),
              })
            : () => router.post(urls[confirmAction], {}, {
                preserveScroll: true,
                onSuccess: () => { toast.success(`${name} updated successfully.`); },
                onError: () => toast.error('Action failed.'),
              });

        fn();
        setConfirmStudent(null);
        setConfirmAction(null);
    };

    const tabConfig = [
        { value: 'dropped',    label: 'Dropped',    count: counts.dropped,     icon: UserMinus },
        { value: 'archived',   label: 'Archived',   count: counts.archived,    icon: Archive },
        { value: 'deactivated',label: 'Deactivated',count: counts.deactivated, icon: UserX },
    ];

    const tabDescriptions: Record<string, string> = {
        dropped:     'Reactivate to allow them to re-enroll.',
        archived:    'Restore to reinstate or permanently delete.',
        deactivated: 'Activate to restore login access.',
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Status" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Student Status Management
                    </h1>
                    <p className="text-muted-foreground mt-1">{tabDescriptions[tab]}</p>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Status Tabs */}
                <Tabs value={tab} onValueChange={handleTabChange}>
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                        {tabConfig.map(({ value, label, count, icon: Icon }) => (
                            <TabsTrigger key={value} value={value} className="gap-1.5">
                                <Icon className="h-4 w-4" />
                                {label}
                                {count > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                                        {count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Filters */}
                <FilterBar onReset={handleReset} showReset={!!(filters.classification || filters.department_id || filters.search)}>
                    <SearchBar
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search name, LRN, email…"
                    />
                    {hasBothClassifications && (
                        <FilterDropdown
                            label="Classification"
                            value={filters.classification ?? 'all'}
                            options={classificationOptions}
                            onChange={(v) => apply({ classification: v === 'all' ? undefined : v, department_id: undefined })}
                        />
                    )}
                    <FilterDropdown
                        label="Department"
                        value={filters.department_id ?? 'all'}
                        options={filteredDepts.map((d) => ({ value: d.value, label: d.label }))}
                        onChange={(v) => apply({ department_id: v === 'all' ? undefined : v })}
                        placeholder="All Departments"
                    />
                </FilterBar>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {tabConfig.find((t) => t.value === tab)?.label} Students
                            <span className="ml-2 text-muted-foreground font-normal text-sm">({students.total} total)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {students.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>LRN</TableHead>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Year Level</TableHead>
                                                <TableHead>School Year</TableHead>
                                                <TableHead>Status</TableHead>
                                                {tab === 'archived' && <TableHead>Deleted At</TableHead>}
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.data.map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell className="font-mono text-sm">{student.lrn}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={student.student_photo_url ?? ''} />
                                                                <AvatarFallback className="text-xs">
                                                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {student.last_name}, {student.first_name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.department ? (
                                                            <div>
                                                                <p className="text-sm">{student.department}</p>
                                                                {student.classification && (
                                                                    <Badge variant="outline" className="text-xs mt-0.5">
                                                                        {student.classification}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">{student.year_level ?? '—'}</TableCell>
                                                    <TableCell className="text-sm">{student.school_year ?? '—'}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                student.enrollment_status === 'dropped'    ? 'destructive' :
                                                                !student.is_active                        ? 'secondary'   :
                                                                student.deleted_at                        ? 'outline'     :
                                                                'default'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {student.deleted_at
                                                                ? 'archived'
                                                                : !student.is_active
                                                                ? 'deactivated'
                                                                : student.enrollment_status}
                                                        </Badge>
                                                    </TableCell>
                                                    {tab === 'archived' && (
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {student.deleted_at
                                                                ? new Date(student.deleted_at).toLocaleDateString()
                                                                : '—'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right">
                                                        <ActionCell
                                                            student={student}
                                                            tab={tab}
                                                            onAction={(action) => {
                                                                setConfirmStudent(student);
                                                                setConfirmAction(action);
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {students.last_page > 1 && (
                                    <div className="mt-4 flex justify-center">
                                        <Pagination data={students} preserveState />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="font-medium text-lg">No {tabConfig.find(t => t.value === tab)?.label} Students</p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    {filters.search || filters.classification || filters.department_id
                                        ? 'No students match your filters. Try resetting.'
                                        : `There are no ${tab} student records.`}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={!!confirmStudent && !!confirmAction}
                onOpenChange={(open) => { if (!open) { setConfirmStudent(null); setConfirmAction(null); } }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {confirmAction === 'force-delete' ? (
                                <><AlertTriangle className="h-5 w-5 text-red-600" /> Permanently Delete Student?</>
                            ) : confirmAction === 'restore' ? (
                                <><RotateCcw className="h-5 w-5 text-blue-600" /> Restore Student?</>
                            ) : (
                                <><UserCheck className="h-5 w-5 text-green-600" /> Activate / Reactivate Student?</>
                            )}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction === 'force-delete' ? (
                                <>
                                    This will <strong>permanently delete</strong>{' '}
                                    <strong>{confirmStudent?.first_name} {confirmStudent?.last_name}</strong> and all their records.
                                    This action <strong>cannot be undone</strong>.
                                </>
                            ) : confirmAction === 'restore' ? (
                                <>
                                    Restore <strong>{confirmStudent?.first_name} {confirmStudent?.last_name}</strong>?
                                    They will be reinstated as a not-enrolled student.
                                </>
                            ) : confirmAction === 'reactivate' ? (
                                <>
                                    Reactivate <strong>{confirmStudent?.first_name} {confirmStudent?.last_name}</strong>?
                                    Their enrollment status will become <em>not-enrolled</em> and they can log in again.
                                </>
                            ) : (
                                <>
                                    Activate <strong>{confirmStudent?.first_name} {confirmStudent?.last_name}</strong>?
                                    They will be able to log in again.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={doAction}
                            className={confirmAction === 'force-delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                        >
                            {confirmAction === 'force-delete' ? 'Delete Permanently' :
                             confirmAction === 'restore'      ? 'Restore'            :
                             confirmAction === 'reactivate'   ? 'Reactivate'         :
                             'Activate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </RegistrarLayout>
    );
}

/** Per-row action buttons depending on which tab is active */
function ActionCell({
    student,
    tab,
    onAction,
}: {
    student: StatusStudent;
    tab: string;
    onAction: (action: 'reactivate' | 'activate' | 'restore' | 'force-delete') => void;
}) {
    if (tab === 'dropped') {
        return (
            <Button
                variant="outline"
                size="sm"
                className="gap-1 text-green-700 border-green-300 hover:bg-green-50 text-xs"
                onClick={() => onAction('reactivate')}
            >
                <UserCheck className="h-3 w-3" />
                Reactivate
            </Button>
        );
    }

    if (tab === 'archived') {
        return (
            <div className="flex gap-2 justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-50 text-xs"
                    onClick={() => onAction('restore')}
                >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-700 border-red-300 hover:bg-red-50 text-xs"
                    onClick={() => onAction('force-delete')}
                >
                    <Trash2 className="h-3 w-3" />
                    Delete
                </Button>
            </div>
        );
    }

    // deactivated
    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-green-700 border-green-300 hover:bg-green-50 text-xs"
            onClick={() => onAction('activate')}
        >
            <UserCheck className="h-3 w-3" />
            Activate
        </Button>
    );
}
