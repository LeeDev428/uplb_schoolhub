import { Head, router, usePage } from '@inertiajs/react';
import { Plus, CheckCircle2, Circle, Users, List, GraduationCap, UserCheck, UserX, MailCheck, MailWarning, RotateCcw, Archive, Trash2, CalendarDays, BookOpen, ArrowUpCircle, UserCog, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { RegistrarMessages, showSuccess, showError } from '@/components/registrar/registrar-messages';
import { StudentFilters } from '@/components/registrar/student-filters';
import { StudentFormModal } from '@/components/registrar/student-form-modal';
import { StudentStatCard } from '@/components/registrar/student-stat-card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    archived: number;
    deactivated: number;
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
    tab?: string;
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
        tab?: string;
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

export default function StudentsIndex({ students, tab: tabProp = 'active', stats, programs, yearLevels, schoolYears, filters, departments, allPrograms, allYearLevels, sections, flash, classListMale, classListFemale }: Props) {
    const activeTab = tabProp || 'active';
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>();
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [viewMode, setViewMode] = useState<'list' | 'classlist'>('list');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [isArchiving, setIsArchiving] = useState(false);

    // ── Re-Enroll dialog state ──────────────────────────────────────────────────
    const [reEnrollOpen, setReEnrollOpen] = useState(false);
    const [reEnrollStudentId, setReEnrollStudentId] = useState<number | null>(null);
    const [reEnrollStudentName, setReEnrollStudentName] = useState('');
    const [reEnrollYearLevel, setReEnrollYearLevel] = useState('');
    const [reEnrollProgram, setReEnrollProgram] = useState('');
    const [reEnrollAutoClear, setReEnrollAutoClear] = useState(false);

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

    // ── Special Tab Handlers ────────────────────────────────────────────────────
    const handleRestore = (studentId: number, name: string) => {
        if (!confirm(`Restore archived student "${name}"? Their account will be unarchived and re-accessible.`)) return;
        router.post(`/registrar/archived/${studentId}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => showSuccess(`${name} has been restored successfully.`),
            onError: () => showError('Failed to restore student.'),
        });
    };

    const handleActivate = (studentId: number, name: string) => {
        if (!confirm(`Activate "${name}"? They will be able to log in and re-register for enrollment.`)) return;
        router.post(`/registrar/students/${studentId}/activate`, {}, {
            preserveScroll: true,
            onSuccess: () => showSuccess(`${name} has been activated.`),
            onError: () => showError('Failed to activate student.'),
        });
    };

    const openReEnrollDialog = (studentId: number, name: string) => {
        setReEnrollStudentId(studentId);
        setReEnrollStudentName(name);
        setReEnrollYearLevel('');
        setReEnrollProgram('');
        setReEnrollAutoClear(false);
        setReEnrollOpen(true);
    };

    const handleReEnrollSubmit = () => {
        if (!reEnrollStudentId || !reEnrollYearLevel) {
            showError('Please select a Year Level before submitting.');
            return;
        }
        router.post(`/registrar/students/${reEnrollStudentId}/re-enroll`, {
            year_level: reEnrollYearLevel,
            program: reEnrollProgram || null,
            auto_clear: reEnrollAutoClear,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(`${reEnrollStudentName} has been re-enrolled.`);
                setReEnrollOpen(false);
            },
            onError: () => showError('Failed to re-enroll student.'),
        });
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

                {/* ── Status Tabs ─────────────────────────────────────────────────────── */}
                <div className="border-b">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => router.get('/registrar/students', { tab: val === 'active' ? undefined : val }, { replace: true })}
                    >
                        <TabsList className="h-auto bg-transparent p-0 gap-0 border-0">
                            <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium">
                                <Users className="mr-2 h-4 w-4" />
                                Active Students
                                <Badge variant="secondary" className="ml-2 text-xs">{stats.allStudents}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="dropped" className="rounded-none border-b-2 border-transparent data-[state=active]:border-destructive data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium">
                                <UserX className="mr-2 h-4 w-4" />
                                Dropped
                                {stats.dropped > 0 && <Badge variant="destructive" className="ml-2 text-xs">{stats.dropped}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="archived" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium">
                                <Archive className="mr-2 h-4 w-4" />
                                Archived
                                {stats.archived > 0 && <Badge className="ml-2 text-xs bg-orange-100 text-orange-700">{stats.archived}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="deactivated" className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium">
                                <UserCog className="mr-2 h-4 w-4" />
                                Deactivated
                                {stats.deactivated > 0 && <Badge className="ml-2 text-xs bg-yellow-100 text-yellow-700">{stats.deactivated}</Badge>}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Follow Up Sectioning Banner */}
                {activeTab === 'active' && filters.needs_sectioning === '1' && (
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

                {/* Filters (active tab only) */}
                {activeTab === 'active' && <StudentFilters programs={programs} yearLevels={yearLevels} schoolYears={schoolYears} filters={filters} />}

                {/* School Year Tabs (active tab only) + search for special tabs */}
                {activeTab === 'active' && schoolYears.length > 0 && (
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

                {/* Search bar for special tabs */}
                {activeTab !== 'active' && (
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search by name, LRN or email..."
                            defaultValue={filters.search || ''}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.get('/registrar/students', { tab: activeTab, search: (e.target as HTMLInputElement).value }, { replace: true });
                                }
                            }}
                            className="max-w-sm"
                        />
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
                ) : activeTab !== 'active' ? (
                    /* ── Special Tab Tables: Dropped / Archived / Deactivated ── */
                    <div className="rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Student No.</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Year Level / Section</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No {activeTab} students found.
                                        </TableCell>
                                    </TableRow>
                                ) : students.data.map((student) => {
                                    const s = student as any;
                                    const fullName = `${s.first_name}${s.middle_name ? ' ' + s.middle_name : ''} ${s.last_name}${s.suffix ? ' ' + s.suffix : ''}`;
                                    return (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={s.student_photo_url || undefined} />
                                                        <AvatarFallback>{getInitials(s.first_name, s.last_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{fullName}</div>
                                                        <div className="text-xs text-muted-foreground">{s.email}</div>
                                                        {s.department && <div className="text-xs text-muted-foreground">{s.department}</div>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{s.lrn}</TableCell>
                                            <TableCell className="text-sm">{s.program || '—'}</TableCell>
                                            <TableCell className="text-sm">{[s.year_level, s.section].filter(Boolean).join(' · ') || '—'}</TableCell>
                                            <TableCell className="text-sm">{s.school_year || '—'}</TableCell>
                                            <TableCell>
                                                {activeTab === 'archived' ? (
                                                    <Badge className="bg-orange-100 text-orange-700">Archived</Badge>
                                                ) : activeTab === 'deactivated' ? (
                                                    <Badge className="bg-yellow-100 text-yellow-700">Deactivated</Badge>
                                                ) : (
                                                    <Badge className={getEnrollmentStatusColor(s.enrollment_status)}>{formatStatus(s.enrollment_status)}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {activeTab === 'dropped' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-green-400 text-green-700 hover:bg-green-50"
                                                                onClick={() => openReEnrollDialog(s.id, fullName)}
                                                            >
                                                                <RefreshCcw className="mr-1 h-3 w-3" />
                                                                Re-Enroll
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => router.visit(`/registrar/students/${s.id}`)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </>
                                                    )}
                                                    {activeTab === 'archived' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-blue-400 text-blue-700 hover:bg-blue-50"
                                                                onClick={() => handleRestore(s.id, fullName)}
                                                            >
                                                                <RotateCcw className="mr-1 h-3 w-3" />
                                                                Restore
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Permanently Delete Student?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete <strong>{fullName}</strong> and all their records. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            onClick={() => {
                                                                                router.delete(`/registrar/archived/${s.id}`, {
                                                                                    preserveScroll: true,
                                                                                    onSuccess: () => showSuccess(`${fullName} permanently deleted.`),
                                                                                    onError: () => showError('Failed to delete.'),
                                                                                });
                                                                            }}
                                                                        >
                                                                            Delete Permanently
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                    {activeTab === 'deactivated' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-green-400 text-green-700 hover:bg-green-50"
                                                                onClick={() => handleActivate(s.id, fullName)}
                                                            >
                                                                <UserCheck className="mr-1 h-3 w-3" />
                                                                Activate
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => router.visit(`/registrar/students/${s.id}`)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* Pagination */}
                        {students.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {students.data.length} of {students.total} students
                                </div>
                                <div className="flex space-x-2">
                                    {students.links.map((link: any, index: number) => (
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

            {/* ── Re-Enroll Dialog ──────────────────────────────────────────────── */}
            {reEnrollOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-background rounded-lg border shadow-lg w-full max-w-md p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Re-Enroll Student</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Re-enrolling <strong>{reEnrollStudentName}</strong> for the current school year.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="re-enroll-year-level">Year Level <span className="text-destructive">*</span></Label>
                                <Select value={reEnrollYearLevel} onValueChange={setReEnrollYearLevel}>
                                    <SelectTrigger id="re-enroll-year-level" className="mt-1">
                                        <SelectValue placeholder="Select year level..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allYearLevels.map((yl) => (
                                            <SelectItem key={yl.id} value={yl.name}>{yl.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="re-enroll-program">Program (optional)</Label>
                                <Select value={reEnrollProgram} onValueChange={setReEnrollProgram}>
                                    <SelectTrigger id="re-enroll-program" className="mt-1">
                                        <SelectValue placeholder="Select program..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">— No program —</SelectItem>
                                        {allPrograms.map((p) => (
                                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <Checkbox
                                    id="re-enroll-auto-clear"
                                    checked={reEnrollAutoClear}
                                    onCheckedChange={(v) => setReEnrollAutoClear(!!v)}
                                />
                                <Label htmlFor="re-enroll-auto-clear" className="cursor-pointer text-sm">
                                    Auto-grant Registrar clearance (skip to pending-accounting)
                                </Label>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" onClick={() => setReEnrollOpen(false)}>Cancel</Button>
                            <Button onClick={handleReEnrollSubmit} disabled={!reEnrollYearLevel}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Re-Enroll Student
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </RegistrarLayout>
    );
}
