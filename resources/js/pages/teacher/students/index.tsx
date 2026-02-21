import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { StudentPhoto } from '@/components/ui/student-photo';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { Eye, GraduationCap, Users, BookOpen, Layers, List } from 'lucide-react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
    lrn: string;
    email?: string;
    program?: string;
    year_level?: string;
    section?: string;
    enrollment_status: string;
    student_photo_url?: string | null;
    department?: {
        id: number;
        name: string;
        classification: string;
    } | null;
}

interface Props {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    programs: string[];
    yearLevels: string[];
    sections: string[];
    stats: {
        total: number;
        enrolled: number;
        programs: number;
        sections: number;
    };
    filters: {
        search?: string;
        program?: string;
        year_level?: string;
        section?: string;
    };
    teacherDepartment: string;
    classListMale: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string | null;
        suffix?: string | null;
        lrn: string;
        program?: string;
        year_level?: string;
        section?: string;
        enrollment_status: string;
        student_photo_url?: string | null;
    }[];
    classListFemale: {
        id: number;
        first_name: string;
        last_name: string;
        middle_name?: string | null;
        suffix?: string | null;
        lrn: string;
        program?: string;
        year_level?: string;
        section?: string;
        enrollment_status: string;
        student_photo_url?: string | null;
    }[];
}

const getEnrollmentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        enrolled: { label: 'Enrolled', variant: 'default' },
        'pending-registrar': { label: 'Pending (Registrar)', variant: 'secondary' },
        'pending-accounting': { label: 'Pending (Accounting)', variant: 'secondary' },
        'not-enrolled': { label: 'Not Enrolled', variant: 'outline' },
        graduated: { label: 'Graduated', variant: 'default' },
        dropped: { label: 'Dropped', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getFullName = (student: Student) => {
    const parts = [student.last_name, student.first_name];
    if (student.middle_name) parts.push(student.middle_name);
    if (student.suffix) parts.push(student.suffix);
    return `${student.last_name}, ${student.first_name}${student.middle_name ? ` ${student.middle_name}` : ''}${student.suffix ? ` ${student.suffix}` : ''}`;
};

export default function StudentsIndex({ 
    students, 
    programs, 
    yearLevels, 
    sections, 
    stats, 
    filters, 
    teacherDepartment,
    classListMale,
    classListFemale,
}: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'classlist'>('list');
    const [search, setSearch] = useState(filters.search || '');
    const [program, setProgram] = useState(filters.program || 'all');
    const [yearLevel, setYearLevel] = useState(filters.year_level || 'all');
    const [section, setSection] = useState(filters.section || 'all');

    const navigate = (params: Record<string, string>) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v && v !== 'all')
        );
        router.get('/teacher/students', cleanParams, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, program, year_level: yearLevel, section });
    };

    const handleProgramChange = (value: string) => {
        setProgram(value);
        navigate({ search, program: value, year_level: yearLevel, section });
    };

    const handleYearLevelChange = (value: string) => {
        setYearLevel(value);
        navigate({ search, program, year_level: value, section });
    };

    const handleSectionChange = (value: string) => {
        setSection(value);
        navigate({ search, program, year_level: yearLevel, section: value });
    };

    const resetFilters = () => {
        setSearch('');
        setProgram('all');
        setYearLevel('all');
        setSection('all');
        router.get('/teacher/students');
    };

    const hasActiveFilters = !!(search || program !== 'all' || yearLevel !== 'all' || section !== 'all');

    return (
        <TeacherLayout>
            <Head title="My Students" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">My Students</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Students enrolled in {teacherDepartment}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Enrolled</p>
                                <p className="text-2xl font-bold">{stats.enrolled}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Programs</p>
                                <p className="text-2xl font-bold">{stats.programs}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sections</p>
                                <p className="text-2xl font-bold">{stats.sections}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Students Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Students List</CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(v => v === 'list' ? 'classlist' : 'list')}
                        >
                            {viewMode === 'classlist' ? <><List className="mr-1 h-4 w-4" />Table View</> : <><Users className="mr-1 h-4 w-4" />Class List</>}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {viewMode === 'classlist' ? (
                            <div className="space-y-6">
                                {/* Male */}
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="bg-sky-600 px-4 py-3 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-white" />
                                        <span className="font-semibold text-white">Male Students — {classListMale.length}</span>
                                    </div>
                                    <table className="w-full">
                                        <thead><tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-medium w-8">#</th>
                                            <th className="p-3 text-left text-sm font-medium">Name (Last, First)</th>
                                            <th className="p-3 text-left text-sm font-medium">Student No.</th>
                                            <th className="p-3 text-left text-sm font-medium">Program</th>
                                            <th className="p-3 text-left text-sm font-medium">Year / Section</th>
                                            <th className="p-3 text-left text-sm font-medium">Status</th>
                                        </tr></thead>
                                        <tbody>
                                            {classListMale.length === 0 ? (
                                                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No male students.</td></tr>
                                            ) : classListMale.map((s, i) => (
                                                <tr key={s.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.visit(`/teacher/students/${s.id}`)}>
                                                    <td className="p-3 text-sm text-muted-foreground">{i + 1}</td>
                                                    <td className="p-3 font-medium">{s.last_name}, {s.first_name}{s.middle_name ? ` ${s.middle_name}` : ''}{s.suffix ? ` ${s.suffix}` : ''}</td>
                                                    <td className="p-3 font-mono text-sm">{s.lrn}</td>
                                                    <td className="p-3 text-sm">{s.program || '—'}</td>
                                                    <td className="p-3 text-sm">{[s.year_level, s.section].filter(Boolean).join(' · ') || '—'}</td>
                                                    <td className="p-3">{getEnrollmentStatusBadge(s.enrollment_status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Female */}
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="bg-pink-500 px-4 py-3 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-white" />
                                        <span className="font-semibold text-white">Female Students — {classListFemale.length}</span>
                                    </div>
                                    <table className="w-full">
                                        <thead><tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-medium w-8">#</th>
                                            <th className="p-3 text-left text-sm font-medium">Name (Last, First)</th>
                                            <th className="p-3 text-left text-sm font-medium">Student No.</th>
                                            <th className="p-3 text-left text-sm font-medium">Program</th>
                                            <th className="p-3 text-left text-sm font-medium">Year / Section</th>
                                            <th className="p-3 text-left text-sm font-medium">Status</th>
                                        </tr></thead>
                                        <tbody>
                                            {classListFemale.length === 0 ? (
                                                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No female students.</td></tr>
                                            ) : classListFemale.map((s, i) => (
                                                <tr key={s.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => router.visit(`/teacher/students/${s.id}`)}>
                                                    <td className="p-3 text-sm text-muted-foreground">{i + 1}</td>
                                                    <td className="p-3 font-medium">{s.last_name}, {s.first_name}{s.middle_name ? ` ${s.middle_name}` : ''}{s.suffix ? ` ${s.suffix}` : ''}</td>
                                                    <td className="p-3 font-mono text-sm">{s.lrn}</td>
                                                    <td className="p-3 text-sm">{s.program || '—'}</td>
                                                    <td className="p-3 text-sm">{[s.year_level, s.section].filter(Boolean).join(' · ') || '—'}</td>
                                                    <td className="p-3">{getEnrollmentStatusBadge(s.enrollment_status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (<>
                        <FilterBar onReset={resetFilters} showReset={hasActiveFilters}>
                            <SearchBar 
                                value={search} 
                                onChange={handleSearchChange} 
                                placeholder="Search by name, LRN, or email..." 
                            />
                            <FilterDropdown
                                label="Program"
                                value={program}
                                onChange={handleProgramChange}
                                options={programs.map(p => ({ value: p, label: p }))}
                                placeholder="All Programs"
                            />
                            <FilterDropdown
                                label="Year Level"
                                value={yearLevel}
                                onChange={handleYearLevelChange}
                                options={yearLevels.map(y => ({ value: y, label: y }))}
                                placeholder="All Year Levels"
                            />
                            <FilterDropdown
                                label="Section"
                                value={section}
                                onChange={handleSectionChange}
                                options={sections.map(s => ({ value: s, label: s }))}
                                placeholder="All Sections"
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">Student</th>
                                        <th className="p-3 text-left font-semibold">Student No.</th>
                                        <th className="p-3 text-left font-semibold">Program</th>
                                        <th className="p-3 text-left font-semibold">Year Level</th>
                                        <th className="p-3 text-left font-semibold">Section</th>
                                        <th className="p-3 text-center font-semibold">Status</th>
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.data.map((student) => (
                                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <StudentPhoto 
                                                            src={student.student_photo_url}
                                                            firstName={student.first_name}
                                                            lastName={student.last_name}
                                                            size="md"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{getFullName(student)}</p>
                                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="font-mono text-sm">{student.lrn}</span>
                                                </td>
                                                <td className="p-3 text-sm">{student.program || '-'}</td>
                                                <td className="p-3 text-sm">{student.year_level || '-'}</td>
                                                <td className="p-3 text-sm">{student.section || '-'}</td>
                                                <td className="p-3 text-center">
                                                    {getEnrollmentStatusBadge(student.enrollment_status)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => router.visit(`/teacher/students/${student.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination data={students} />
                        </>)}
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
