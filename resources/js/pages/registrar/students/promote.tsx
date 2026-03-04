import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowUpCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    GraduationCap,
    Info,
    Search,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Students', href: '/registrar/students' },
    { title: 'Promote Students', href: '/registrar/promote-students' },
];

/* ─── Data types ─────────────────────────────────────────────────────────── */

interface StudentRow {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    year_level_id: number | null;
    section: string | null;
    section_id: number | null;
    department_id: number | null;
    enrollment_status: string;
    school_year: string | null;
    student_photo_url: string | null;
    is_archived: boolean;
    is_inactive: boolean;
}

interface PaginatedStudents {
    data: StudentRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Department {
    id: number;
    name: string;
    classification: string;
}

interface YearLevel {
    id: number;
    name: string;
    department_id: number;
    level_number: number;
    department: { id: number; name: string };
}

interface Program {
    id: number;
    name: string;
    department_id: number;
}

interface SectionItem {
    id: number;
    name: string;
    year_level_id: number | null;
    year_level: { id: number; name: string } | null;
    program_id: number | null;
    program: { id: number; name: string } | null;
    department_id: number | null;
    department: { id: number; name: string } | null;
    capacity: number | null;
}

interface Props {
    students: PaginatedStudents;
    departments: Department[];
    yearLevels: YearLevel[];
    programs: Program[];
    sections: SectionItem[];
    schoolYears: string[];
    activeSchoolYear: string;
    filters: {
        search?: string;
        department_id?: string;
        year_level_id?: string;
        program?: string;
        section_id?: string;
        enrollment_status?: string;
        school_year?: string;
    };
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getInitials(first: string, last: string) {
    return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function enrollmentBadge(status: string) {
    const map: Record<string, string> = {
        enrolled: 'bg-green-100 text-green-700',
        'pending-registrar': 'bg-yellow-100 text-yellow-700',
        'pending-accounting': 'bg-purple-100 text-purple-700',
        'pending-enrollment': 'bg-orange-100 text-orange-700',
        'not-enrolled': 'bg-gray-100 text-gray-600',
        graduated: 'bg-blue-100 text-blue-700',
        dropped: 'bg-red-100 text-red-700',
    };
    const label = status
        .split('-')
        .map(w => w[0].toUpperCase() + w.slice(1))
        .join(' ');
    return (
        <Badge className={`${map[status] ?? 'bg-gray-100 text-gray-600'} text-xs`}>
            {label}
        </Badge>
    );
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function PromoteStudents({
    students,
    departments,
    yearLevels,
    programs,
    sections,
    schoolYears,
    activeSchoolYear,
    filters,
}: Props) {
    /* ── Filter state ── */
    const [search, setSearch] = useState(filters.search ?? '');
    const [departmentId, setDepartmentId] = useState(filters.department_id ?? 'all');
    const [yearLevelId, setYearLevelId] = useState(filters.year_level_id ?? 'all');
    const [programFilter, setProgramFilter] = useState(filters.program ?? 'all');
    const [sectionFilter, setSectionFilter] = useState(filters.section_id ?? 'all');
    const [enrollStatus, setEnrollStatus] = useState(filters.enrollment_status ?? 'all');
    const [schoolYearTab, setSchoolYearTab] = useState(filters.school_year ?? 'all');

    /* ── Selection state ── */
    const [selected, setSelected] = useState<number[]>([]);

    /* ── Promotion target state ── */
    const [targetSectionId, setTargetSectionId] = useState<string>('');   // section id | 'TBA' | ''
    const [targetYearLevelId, setTargetYearLevelId] = useState<string>(''); // used when TBA

    /* ── Submitting state ── */
    const [isPromoting, setIsPromoting] = useState(false);

    // Clear selection when page/filters change
    useEffect(() => {
        setSelected([]);
    }, [students.current_page, filters.search, filters.department_id]);

    /* ── Derived filtered sections for the department/year-level context ── */
    const filteredSections = useMemo(() => {
        return sections.filter(s => {
            if (departmentId !== 'all' && s.department_id !== Number(departmentId)) return false;
            return true;
        });
    }, [sections, departmentId]);

    /* ── Sections for target selector (scoped to dept if chosen) ── */
    const targetSections = useMemo(() => {
        if (departmentId !== 'all') {
            return sections.filter(s => s.department_id === Number(departmentId));
        }
        return sections;
    }, [sections, departmentId]);

    /* ── Year levels for target selector (scoped to dept if chosen) ── */
    const targetYearLevels = useMemo(() => {
        if (departmentId !== 'all') {
            return yearLevels.filter(yl => yl.department_id === Number(departmentId));
        }
        return yearLevels;
    }, [yearLevels, departmentId]);

    /* ── Is college department active? ── */
    const isCollegeContext = useMemo(() => {
        if (departmentId === 'all') return departments.some(d => d.classification === 'college');
        const dept = departments.find(d => d.id === Number(departmentId));
        return dept?.classification === 'college';
    }, [departments, departmentId]);

    /* ── Programs to show in filter (college-only feature) ── */
    const filteredPrograms = useMemo(() => {
        if (departmentId === 'all') return programs;
        return programs.filter(p => p.department_id === Number(departmentId));
    }, [programs, departmentId]);

    /* ── Sections for filter (current section filter) ── */
    const currentSectionOptions = useMemo(() => {
        let list = sections;
        if (departmentId !== 'all') list = list.filter(s => s.department_id === Number(departmentId));
        if (yearLevelId !== 'all') list = list.filter(s => s.year_level_id === Number(yearLevelId));
        return list;
    }, [sections, departmentId, yearLevelId]);

    /* ── Selection helpers ── */
    const allIds = students.data.map(s => s.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
    const someSelected = selected.length > 0;

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelected(prev => Array.from(new Set([...prev, ...allIds])));
        } else {
            setSelected(prev => prev.filter(id => !allIds.includes(id)));
        }
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelected(prev =>
            checked ? [...prev, id] : prev.filter(x => x !== id),
        );
    };

    /* ── Apply filters (server-side) ── */
    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (departmentId !== 'all') params.department_id = departmentId;
        if (yearLevelId !== 'all') params.year_level_id = yearLevelId;
        if (programFilter !== 'all') params.program = programFilter;
        if (sectionFilter !== 'all') params.section_id = sectionFilter;
        if (enrollStatus !== 'all') params.enrollment_status = enrollStatus;
        if (schoolYearTab !== 'all') params.school_year = schoolYearTab;

        router.get('/registrar/promote-students', { ...params, ...overrides }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setDepartmentId('all');
        setYearLevelId('all');
        setProgramFilter('all');
        setSectionFilter('all');
        setEnrollStatus('all');
        setSchoolYearTab('all');
        router.get('/registrar/promote-students', {}, { preserveScroll: true });
    };

    /* ── Submit promotion ── */
    const handlePromote = () => {
        if (selected.length === 0) {
            toast.error('Select at least one student to promote.');
            return;
        }
        if (!targetSectionId) {
            toast.error('Choose a target section (or TBA) before promoting.');
            return;
        }
        if (targetSectionId === 'TBA' && !targetYearLevelId) {
            toast.error('Select a year level for TBA sectioning.');
            return;
        }

        const sectionLabel =
            targetSectionId === 'TBA'
                ? `TBA (${targetYearLevels.find(yl => yl.id === Number(targetYearLevelId))?.name ?? ''})`
                : sections.find(s => s.id === Number(targetSectionId))?.name ?? targetSectionId;

        if (
            !confirm(
                `Promote ${selected.length} student(s) to "${sectionLabel}" for school year ${activeSchoolYear}?\n\nTheir school year, section, and year level will be updated.`,
            )
        ) {
            return;
        }

        setIsPromoting(true);
        router.post(
            '/registrar/promote-students',
            {
                student_ids: selected,
                target_section_id: targetSectionId,
                target_year_level_id: targetSectionId === 'TBA' ? targetYearLevelId : undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${selected.length} student(s) promoted to ${sectionLabel}.`);
                    setSelected([]);
                    setTargetSectionId('');
                    setTargetYearLevelId('');
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string;
                    toast.error(msg ?? 'Promotion failed.');
                },
                onFinish: () => setIsPromoting(false),
            },
        );
    };

    /* ─── Render ─────────────────────────────────────────────────────────── */
    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Promote Students" />

            <div className="space-y-5 p-6">
                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get('/registrar/students')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <ArrowUpCircle className="h-6 w-6 text-primary" />
                                Promote Students
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Bulk-promote students to a new section or year level for{' '}
                                <span className="font-semibold text-primary">{activeSchoolYear}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                        <span>
                            Active School Year:{' '}
                            <strong className="text-primary">{activeSchoolYear}</strong>
                        </span>
                    </div>
                </div>

                {/* ── School Year Tabs ── */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground mr-1">School Year:</span>
                    {['all', ...schoolYears].map((sy) => (
                        <button
                            key={sy}
                            type="button"
                            onClick={() => {
                                setSchoolYearTab(sy);
                                const params: Record<string, string> = {};
                                if (search) params.search = search;
                                if (departmentId !== 'all') params.department_id = departmentId;
                                if (yearLevelId !== 'all') params.year_level_id = yearLevelId;
                                if (programFilter !== 'all') params.program = programFilter;
                                if (sectionFilter !== 'all') params.section_id = sectionFilter;
                                if (enrollStatus !== 'all') params.enrollment_status = enrollStatus;
                                if (sy !== 'all') params.school_year = sy;
                                router.get('/registrar/promote-students', params, { preserveScroll: true, preserveState: true });
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                schoolYearTab === sy
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-muted-foreground border-border hover:border-primary/60 hover:text-foreground'
                            }`}
                        >
                            {sy === 'all' ? 'All Years' : sy}
                        </button>
                    ))}
                </div>

                {/* ── Filter Panel ── */}
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-3 border-b">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters</span>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            <X className="h-3 w-3" />
                            Clear all
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
                        {/* Search */}
                        <div className="col-span-2 sm:col-span-2 lg:col-span-2">
                            <Label className="text-xs text-muted-foreground mb-1 block">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="pl-8 h-9 text-sm"
                                    placeholder="Name, LRN, or email…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Department</Label>
                            <Select value={departmentId} onValueChange={v => { setDepartmentId(v); setYearLevelId('all'); setProgramFilter('all'); setSectionFilter('all'); }}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year Level */}
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Year Level</Label>
                            <Select value={yearLevelId} onValueChange={v => { setYearLevelId(v); setSectionFilter('all'); }}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Year Levels</SelectItem>
                                    {(departmentId !== 'all'
                                        ? yearLevels.filter(yl => yl.department_id === Number(departmentId))
                                        : yearLevels
                                    ).map(yl => (
                                        <SelectItem key={yl.id} value={String(yl.id)}>{yl.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Program (college) */}
                        {isCollegeContext && (
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Program</Label>
                                <Select value={programFilter} onValueChange={setProgramFilter}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Programs</SelectItem>
                                        {filteredPrograms.map(p => (
                                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Current Section */}
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Current Section</Label>
                            <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sections</SelectItem>
                                    <SelectItem value="__none__">No Section</SelectItem>
                                    {currentSectionOptions.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Enrollment Status */}
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Enrollment Status</Label>
                            <Select value={enrollStatus} onValueChange={setEnrollStatus}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="not-enrolled">Not Enrolled</SelectItem>
                                    <SelectItem value="pending-registrar">Pending Registrar</SelectItem>
                                    <SelectItem value="pending-accounting">Pending Accounting</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="px-4 pb-3 flex justify-end">
                        <Button size="sm" onClick={() => applyFilters()}>
                            <Search className="h-3.5 w-3.5 mr-1.5" />
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* ── Promotion Action Bar ── */}
                <div className="rounded-lg border bg-primary/5 border-primary/20 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                            <ArrowUpCircle className="h-4 w-4" />
                            Promote selected students to:
                        </div>

                        {/* Target Section Selector */}
                        <div className="flex-1 min-w-[220px]">
                            <Label className="text-xs text-muted-foreground mb-1 block">Target Section</Label>
                            <Select value={targetSectionId} onValueChange={v => { setTargetSectionId(v); setTargetYearLevelId(''); }}>
                                <SelectTrigger className="h-9 bg-background text-sm">
                                    <SelectValue placeholder="Choose target section…" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TBA">
                                        <span className="flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                                            TBA (To Be Announced)
                                        </span>
                                    </SelectItem>
                                    {/* Group by year level */}
                                    {Array.from(
                                        targetSections.reduce((map, s) => {
                                            const key = s.year_level?.name ?? 'Other';
                                            if (!map.has(key)) map.set(key, []);
                                            map.get(key)!.push(s);
                                            return map;
                                        }, new Map<string, typeof targetSections>()),
                                    ).map(([ylName, secs]) => (
                                        <SelectGroup key={ylName}>
                                            <SelectLabel className="text-xs">{ylName}</SelectLabel>
                                            {secs.map(s => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                    {s.program && (
                                                        <span className="text-muted-foreground ml-1 text-xs">
                                                            – {s.program.name}
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year level selector — only shown for TBA */}
                        {targetSectionId === 'TBA' && (
                            <div className="min-w-[180px]">
                                <Label className="text-xs text-muted-foreground mb-1 block">Year Level (for TBA)</Label>
                                <Select value={targetYearLevelId} onValueChange={setTargetYearLevelId}>
                                    <SelectTrigger className="h-9 bg-background text-sm">
                                        <SelectValue placeholder="Select year level…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetYearLevels.map(yl => (
                                            <SelectItem key={yl.id} value={String(yl.id)}>{yl.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button
                            onClick={handlePromote}
                            disabled={isPromoting || selected.length === 0 || !targetSectionId}
                            className="shrink-0 bg-primary"
                        >
                            <ArrowUpCircle className="h-4 w-4 mr-1.5" />
                            {isPromoting
                                ? 'Promoting…'
                                : `Promote ${selected.length > 0 ? `(${selected.length})` : ''} Students`}
                        </Button>
                    </div>

                    {selected.length > 0 && (
                        <p className="text-xs text-primary/80 mt-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {selected.length} student(s) selected. Their school year will be updated to{' '}
                            <strong>{activeSchoolYear}</strong>.
                        </p>
                    )}
                </div>

                {/* ── Student Table ── */}
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                                {students.total} student{students.total !== 1 ? 's' : ''} found
                                {someSelected && (
                                    <span className="ml-2 text-primary font-medium">
                                        · {selected.length} selected
                                    </span>
                                )}
                            </span>
                        </div>
                        {someSelected && (
                            <button
                                type="button"
                                className="text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setSelected([])}
                            >
                                Clear selection
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={toggleAll}
                                            aria-label="Select all on this page"
                                        />
                                    </TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Student No.</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Year Level</TableHead>
                                    <TableHead>Current Section</TableHead>
                                    <TableHead>School Year</TableHead>
                                    <TableHead>Enrollment Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                            No students match the current filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.data.map(student => {
                                        const isChecked = selected.includes(student.id);
                                        return (
                                            <TableRow
                                                key={student.id}
                                                className={isChecked ? 'bg-primary/5' : 'hover:bg-muted/30'}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={v => toggleOne(student.id, !!v)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5 min-w-[180px]">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarImage src={student.student_photo_url ?? undefined} />
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(student.first_name, student.last_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-tight">
                                                                {student.last_name}, {student.first_name}
                                                                {student.middle_name ? ` ${student.middle_name[0]}.` : ''}
                                                                {student.suffix ? ` ${student.suffix}` : ''}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{student.email}</p>
                                                            {(student.is_archived || student.is_inactive) && (
                                                                <div className="flex gap-1 mt-0.5">
                                                                    {student.is_archived && (
                                                                        <span className="text-[10px] font-medium px-1.5 py-0 rounded bg-red-100 text-red-700">Archived</span>
                                                                    )}
                                                                    {student.is_inactive && (
                                                                        <span className="text-[10px] font-medium px-1.5 py-0 rounded bg-gray-100 text-gray-600">Inactive</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{student.lrn}</TableCell>
                                                <TableCell className="text-sm max-w-[160px] truncate">
                                                    {student.program ?? <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {student.year_level ?? <span className="text-muted-foreground">—</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {student.section ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                student.section === 'TBA'
                                                                    ? 'border-amber-300 text-amber-700 bg-amber-50'
                                                                    : ''
                                                            }
                                                        >
                                                            {student.section}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">No section</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {student.school_year ?? '—'}
                                                </TableCell>
                                                <TableCell>{enrollmentBadge(student.enrollment_status)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ── Pagination ── */}
                    {students.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                            <span>
                                Page {students.current_page} of {students.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={students.current_page <= 1}
                                    onClick={() =>
                                        router.get(
                                            '/registrar/promote-students',
                                            { ...filters, page: students.current_page - 1 },
                                            { preserveScroll: true, preserveState: true },
                                        )
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={students.current_page >= students.last_page}
                                    onClick={() =>
                                        router.get(
                                            '/registrar/promote-students',
                                            { ...filters, page: students.current_page + 1 },
                                            { preserveScroll: true, preserveState: true },
                                        )
                                    }
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RegistrarLayout>
    );
}
