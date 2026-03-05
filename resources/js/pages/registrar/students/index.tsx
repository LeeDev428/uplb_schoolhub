import { Head, router, usePage } from '@inertiajs/react';
import { Plus, CheckCircle2, Circle, Users, List, GraduationCap, UserCheck, UserX, MailCheck, MailWarning, RotateCcw, Archive, Trash2, CalendarDays, BookOpen, ArrowUpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { RegistrarMessages, showSuccess, showError } from '@/components/registrar/registrar-messages';
import { StudentFilters } from '@/components/registrar/student-filters';
import { StudentFormModal } from '@/components/registrar/student-form-modal';
import { StudentStatCard } from '@/components/registrar/student-stat-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { show as showStudent, destroy as destroyStudent } from '@/routes/registrar/students';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/registrar/students',
    },
];

interface Requirement {
    id: number;
    name: string;
}

interface StudentRequirement {
    id: number;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue';
    requirement: Requirement;
}

interface EnrollmentClearance {
    id: number;
    registrar_clearance: boolean;
    accounting_clearance: boolean;
    official_enrollment: boolean;
}

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
    enrollment_status: 'not-enrolled' | 'pending-registrar' | 'pending-accounting' | 'pending-enrollment' | 'enrolled' | 'graduated' | 'dropped';
    requirements_status: 'incomplete' | 'pending' | 'complete';
    requirements_percentage: number;
    student_photo_url: string | null;
    remarks: string | null;
    email_verified: boolean;
    requirements: StudentRequirement[];
    enrollment_clearance: EnrollmentClearance | null;
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

interface Props {
    students: PaginatedStudents;
    stats: Stats;
    programs: string[];
    yearLevels: string[];
    schoolYears: string[];
    filters: {
        search?: string;
        type?: string;
        program?: string;
        year_level?: string;
        enrollment_status?: string;
        requirements_status?: string;
        needs_sectioning?: string;
        school_year?: string;
    };    departments: Department[];
    allPrograms: Program[];
    allYearLevels: YearLevelData[];
    sections: Section[];
    flash?: { success?: string };
    classListMale: Array<{
        id: number; first_name: string; last_name: string;
        middle_name: string | null; suffix: string | null;
        lrn: string; gender: string; program: string | null;
        year_level: string | null; section: string | null;
        enrollment_status: string; student_photo_url: string | null;
    }>;
    classListFemale: Array<{
        id: number; first_name: string; last_name: string;
        middle_name: string | null; suffix: string | null;
        lrn: string; gender: string; program: string | null;
        year_level: string | null; section: string | null;
        enrollment_status: string; student_photo_url: string | null;
    }>;
}

export default function StudentsIndex({ students, stats, programs, yearLevels, schoolYears, filters, departments, allPrograms, allYearLevels, sections, flash, classListMale, classListFemale }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>();
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [viewMode, setViewMode] = useState<'list' | 'classlist'>('list');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [isArchiving, setIsArchiving] = useState(false);

    // ── Global Active School Year ───────────────────────────────────────────────────
    const defaultSyStart = new Date().getMonth() < 5 ? new Date().getFullYear() - 1 : new Date().getFullYear();
    const [syStart, setSyStart] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('registrar_sy_start');
            return stored ? parseInt(stored) : defaultSyStart;
        }
        return defaultSyStart;
    });
    const syEnd = syStart + 1;
    const activeSchoolYear = `${syStart}-${syEnd}`;

    useEffect(() => {
        localStorage.setItem('registrar_sy_start', syStart.toString());
    }, [syStart]);

    // ── Active Semester ─────────────────────────────────────────────────────────────
    const { props: sharedProps } = usePage<{ appSettings?: { active_semester?: number } }>();
    const [activeSemester, setActiveSemester] = useState<string>(
        String(sharedProps.appSettings?.active_semester ?? 1)
    );

    const handleSemesterChange = (value: string) => {
        setActiveSemester(value);
        router.patch('/registrar/active-semester', { active_semester: Number(value) }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Active semester updated.'),
            onError: () => toast.error('Failed to update active semester.'),
        });
    };

    // Clear selection when page changes
    useEffect(() => {
        setSelectedStudents([]);
    }, [students.current_page]);

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

    const handleBulkDeactivate = () => {
        if (selectedStudents.length === 0) return;
        if (confirm(`Deactivate ${selectedStudents.length} student(s)? This will reset them to "not-enrolled" and they must re-register to enroll again.`)) {
            router.post('/registrar/students/bulk-deactivate', { student_ids: selectedStudents }, {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccess(`Successfully deactivated ${selectedStudents.length} student(s).`);
                    setSelectedStudents([]);
                },
                onError: () => showError('Failed to deactivate students.'),
            });
        }
    };

    const handleBulkArchive = () => {
        if (selectedStudents.length === 0) return;
        
        if (confirm(`Are you sure you want to archive ${selectedStudents.length} student(s)? This will set their status to "dropped" and deactivate their accounts.`)) {
            setIsArchiving(true);
            router.post('/registrar/students/archive', { student_ids: selectedStudents }, {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccess(`Successfully archived ${selectedStudents.length} student(s).`);
                    setSelectedStudents([]);
                    setIsArchiving(false);
                },
                onError: () => {
                    showError('Failed to archive students.');
                    setIsArchiving(false);
                },
            });
        }
    };

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
            router.delete(destroyStudent.url({ student: studentId }), {
                onSuccess: () => {
                    showSuccess('Student deleted successfully!');
                },
                onError: () => {
                    showError('Failed to delete student.');
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
            'pending-enrollment': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
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
            <RegistrarMessages />

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
                        {selectedStudents.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleBulkDeactivate}
                                    className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                                >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate ({selectedStudents.length})
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleBulkArchive}
                                    disabled={isArchiving}
                                >
                                    <Archive className="mr-2 h-4 w-4" />
                                    {isArchiving ? 'Archiving...' : `Archive (${selectedStudents.length})`}
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => router.get('/registrar/promote-students')}
                            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                            Promote Students
                        </Button>
                        <Button
                            variant={viewMode === 'classlist' ? 'default' : 'outline'}
                            onClick={() => setViewMode(viewMode === 'list' ? 'classlist' : 'list')}
                        >
                            <Users className="mr-2 h-4 w-4" />
                            {viewMode === 'classlist' ? 'Table View' : 'Class List'}
                        </Button>
                        <Button variant="outline"
                            onClick={() => router.get('/registrar/students', { needs_sectioning: filters.needs_sectioning === '1' ? undefined : '1' })}
                            className={filters.needs_sectioning === '1' ? 'border-primary text-primary bg-primary/5' : ''}
                        >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Follow Up Sectioning
                        </Button>
                        <Button onClick={handleAddStudent}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Student
                        </Button>
                    </div>
                </div>

                {/* ── Active School Year & Semester Banner ─────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-primary/5 px-4 py-3">
                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-primary">Active School Year:</span>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            value={syStart}
                            onChange={e => setSyStart(Number(e.target.value))}
                            min={2000} max={2099}
                            className="w-[4.5rem] rounded border border-input bg-background px-2 py-1 text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <span className="text-muted-foreground font-medium">–</span>
                        <input
                            type="number"
                            value={syEnd}
                            readOnly
                            className="w-[4.5rem] rounded border border-input bg-muted px-2 py-1 text-center text-sm font-bold text-muted-foreground"
                        />
                    </div>

                    <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-semibold text-primary">Semester:</span>
                        <Select value={activeSemester} onValueChange={handleSemesterChange}>
                            <SelectTrigger className="h-8 w-[9rem] text-sm font-bold bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1st Semester</SelectItem>
                                <SelectItem value="2">2nd Semester</SelectItem>
                                <SelectItem value="3">Summer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <span className="text-xs text-muted-foreground ml-1">New students will be assigned to <strong>{activeSchoolYear}</strong> automatically.</span>
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

                {/* Follow Up Sectioning Banner */}
                {filters.needs_sectioning === '1' && (
                    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Follow Up Sectioning Mode — showing students without a section assigned</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => router.get('/registrar/students')}>
                            Exit
                        </Button>
                    </div>
                )}

                {/* Filters */}
                <StudentFilters programs={programs} yearLevels={yearLevels} schoolYears={schoolYears} filters={filters} />

                {/* School Year Tabs */}
                {schoolYears.length > 0 && (
                    <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Tabs
                            value={filters.school_year || 'all'}
                            onValueChange={(val) => router.get('/registrar/students', { ...filters, school_year: val }, { preserveState: true, replace: true })}
                            className="w-full"
                        >
                            <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
                                <TabsTrigger value="all" className="text-xs px-3 py-1.5">All Years</TabsTrigger>
                                {schoolYears.map((sy) => (
                                    <TabsTrigger key={sy} value={sy} className="text-xs px-3 py-1.5">{sy}</TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                {viewMode === 'classlist' ? (
                    /* ── Class List: Male / Female split A-Z ── */
                    <div className="space-y-6">
                        {/* Male */}
                        <div className="rounded-lg border overflow-hidden">
                            <div className="bg-sky-600 px-4 py-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-white" />
                                <span className="font-semibold text-white">Male Students — {classListMale.length}</span>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-8">#</TableHead>
                                        <TableHead>Name (Last, First)</TableHead>
                                        <TableHead>Student No.</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Year / Section</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classListMale.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No male students.</TableCell></TableRow>
                                    ) : classListMale.map((s, i) => (
                                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.visit(`/registrar/students/${s.id}`)}>
                                            <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {s.last_name}, {s.first_name}{s.middle_name ? ` ${s.middle_name}` : ''}{s.suffix ? ` ${s.suffix}` : ''}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{s.lrn}</TableCell>
                                            <TableCell className="text-sm">{s.program || '—'}</TableCell>
                                            <TableCell className="text-sm">{[s.year_level, s.section].filter(Boolean).join(' · ') || '—'}</TableCell>
                                            <TableCell><Badge className={getEnrollmentStatusColor(s.enrollment_status)}>{formatStatus(s.enrollment_status)}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {/* Female */}
                        <div className="rounded-lg border overflow-hidden">
                            <div className="bg-pink-500 px-4 py-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-white" />
                                <span className="font-semibold text-white">Female Students — {classListFemale.length}</span>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-8">#</TableHead>
                                        <TableHead>Name (Last, First)</TableHead>
                                        <TableHead>Student No.</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Year / Section</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classListFemale.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No female students.</TableCell></TableRow>
                                    ) : classListFemale.map((s, i) => (
                                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.visit(`/registrar/students/${s.id}`)}>
                                            <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {s.last_name}, {s.first_name}{s.middle_name ? ` ${s.middle_name}` : ''}{s.suffix ? ` ${s.suffix}` : ''}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{s.lrn}</TableCell>
                                            <TableCell className="text-sm">{s.program || '—'}</TableCell>
                                            <TableCell className="text-sm">{[s.year_level, s.section].filter(Boolean).join(' · ') || '—'}</TableCell>
                                            <TableCell><Badge className={getEnrollmentStatusColor(s.enrollment_status)}>{formatStatus(s.enrollment_status)}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectedStudents.length === students.data.length && students.data.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Student No.</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Year & Section</TableHead>
                                <TableHead>Requirements</TableHead>
                                <TableHead>Registrar</TableHead>
                                <TableHead>Accounting</TableHead>
                                <TableHead>Official</TableHead>
                                <TableHead>Enrollment Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-8">
                                        <p className="text-muted-foreground">No students found. Add your first student to get started.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.data.map((student) => {
                                    const fullName = `${student.first_name}${student.middle_name ? ' ' + student.middle_name : ''} ${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`;
                                    const yearSection = `${student.year_level}${student.section ? ' - ' + student.section : ''}`;
                                    
                                    return (
                                        <TableRow 
                                            key={student.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => router.visit(showStudent.url({ student: student.id }))}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                                                    aria-label={`Select ${fullName}`}
                                                />
                                            </TableCell>
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
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            {student.email_verified ? (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                                                                    <MailCheck className="h-3 w-3" /> Verified
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                                                                        <MailWarning className="h-3 w-3" /> Unverified
                                                                    </span>
                                                                    <button
                                                                        className="inline-flex items-center gap-0.5 text-[11px] text-primary underline hover:no-underline"
                                                                        onClick={e => { e.stopPropagation(); router.post(`/registrar/students/${student.id}/resend-verification`, {}, { preserveScroll: true, onSuccess: () => showSuccess('Verification email resent.'), onError: () => showError('Failed to resend.') }); }}
                                                                    >
                                                                        <RotateCcw className="h-3 w-3" /> Resend
                                                                    </button>
                                                                </>
                                                            )}
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
                                                <div className="flex items-center gap-1.5">
                                                    {student.requirements && student.requirements.length > 0 ? (
                                                        student.requirements.slice(0, 6).map((req) => (
                                                            req.status === 'approved' ? (
                                                                <CheckCircle2 key={req.id} className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                                            ) : (
                                                                <Circle key={req.id} className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                                                            )
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No requirements</span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        {student.requirements_percentage}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {student.enrollment_clearance?.registrar_clearance ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {student.enrollment_clearance?.accounting_clearance ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {student.enrollment_clearance?.official_enrollment ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getEnrollmentStatusColor(student.enrollment_status)}>
                                                    {formatStatus(student.enrollment_status)}
                                                </Badge>
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
                )}
            </div>

            {/* Student Form Modal */}
            <StudentFormModal
                key={editingStudent?.id ?? 'new'}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                student={editingStudent}
                mode={modalMode}
                departments={departments}
                programs={allPrograms}
                yearLevels={allYearLevels}
                sections={sections}
                schoolYear={activeSchoolYear}
            />
        </RegistrarLayout>
    );
}
