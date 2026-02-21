import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { StudentPhoto } from '@/components/ui/student-photo';
import { Users } from 'lucide-react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    lrn: string;
    gender: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    enrollment_status: string;
    student_photo_url: string | null;
}

interface Props {
    male: Student[];
    female: Student[];
    stats: { total: number; male: number; female: number };
    programs: string[];
    yearLevels: string[];
    filters: {
        search?: string;
        program?: string;
        year_level?: string;
        enrollment_status?: string;
    };
}

const statusVariant = (s: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (s === 'enrolled') return 'default';
    if (s === 'dropped') return 'destructive';
    if (s === 'graduated') return 'secondary';
    return 'outline';
};

const formatStatus = (s: string) =>
    s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function GenderTable({ title, students, color }: { title: string; students: Student[]; color: string }) {
    return (
        <Card>
            <CardHeader className={`${color} rounded-t-lg`}>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    {title} — {students.length} student{students.length !== 1 ? 's' : ''}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="p-3 text-left text-sm font-semibold">#</th>
                                <th className="p-3 text-left text-sm font-semibold">Student Name</th>
                                <th className="p-3 text-left text-sm font-semibold">Student No.</th>
                                <th className="p-3 text-left text-sm font-semibold">Program</th>
                                <th className="p-3 text-left text-sm font-semibold">Year / Section</th>
                                <th className="p-3 text-left text-sm font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, idx) => (
                                    <tr key={student.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 text-sm text-muted-foreground">{idx + 1}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <StudentPhoto
                                                    src={student.student_photo_url}
                                                    firstName={student.first_name}
                                                    lastName={student.last_name}
                                                    size="sm"
                                                />
                                                <span className="font-medium">
                                                    {student.last_name}, {student.first_name}
                                                    {student.middle_name ? ` ${student.middle_name}` : ''}
                                                    {student.suffix ? ` ${student.suffix}` : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 font-mono text-sm">{student.lrn}</td>
                                        <td className="p-3 text-sm">{student.program || '—'}</td>
                                        <td className="p-3 text-sm">
                                            {[student.year_level, student.section].filter(Boolean).join(' · ') || '—'}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={statusVariant(student.enrollment_status)}>
                                                {formatStatus(student.enrollment_status)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function OwnerStudentsIndex({ male, female, stats, programs, yearLevels, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [program, setProgram] = useState(filters.program || 'all');
    const [yearLevel, setYearLevel] = useState(filters.year_level || 'all');
    const [enrollmentStatus, setEnrollmentStatus] = useState(filters.enrollment_status || 'all');

    const navigate = (params: Record<string, string>) => {
        router.get('/owner/students', params, { preserveState: true, replace: true });
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        navigate({ search: val, program, year_level: yearLevel, enrollment_status: enrollmentStatus });
    };
    const handleProgram = (val: string) => {
        setProgram(val);
        navigate({ search, program: val, year_level: yearLevel, enrollment_status: enrollmentStatus });
    };
    const handleYearLevel = (val: string) => {
        setYearLevel(val);
        navigate({ search, program, year_level: val, enrollment_status: enrollmentStatus });
    };
    const handleStatus = (val: string) => {
        setEnrollmentStatus(val);
        navigate({ search, program, year_level: yearLevel, enrollment_status: val });
    };

    return (
        <OwnerLayout>
            <Head title="Students" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Student Master List</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete A–Z alphabetical listing by gender
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-3">
                    {[
                        { label: 'Total Students', value: stats.total, color: 'text-blue-600' },
                        { label: 'Male', value: stats.male, color: 'text-sky-600' },
                        { label: 'Female', value: stats.female, color: 'text-pink-600' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <FilterBar>
                    <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or student no..." />
                    <FilterDropdown
                        label="Program"
                        value={program}
                        onChange={handleProgram}
                        options={[{ value: 'all', label: 'All Programs' }, ...programs.map(p => ({ value: p, label: p }))]}
                    />
                    <FilterDropdown
                        label="Year Level"
                        value={yearLevel}
                        onChange={handleYearLevel}
                        options={[{ value: 'all', label: 'All Year Levels' }, ...yearLevels.map(y => ({ value: y, label: y }))]}
                    />
                    <FilterDropdown
                        label="Status"
                        value={enrollmentStatus}
                        onChange={handleStatus}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'enrolled', label: 'Enrolled' },
                            { value: 'not-enrolled', label: 'Not Enrolled' },
                            { value: 'graduated', label: 'Graduated' },
                            { value: 'dropped', label: 'Dropped' },
                        ]}
                    />
                </FilterBar>

                {/* Male Table */}
                <GenderTable title="Male Students" students={male} color="bg-sky-600" />

                {/* Female Table */}
                <GenderTable title="Female Students" students={female} color="bg-pink-500" />
            </div>
        </OwnerLayout>
    );
}
