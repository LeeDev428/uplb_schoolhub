import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    section: string;
    year_level: string;
    enrollment_status: string;
}

interface SectionOption {
    id: number;
    name: string;
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
    sections: SectionOption[];
    filters: {
        search?: string;
        section?: string;
    };
}

export default function GradesIndex({ students, sections, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [section, setSection] = useState(filters.section || 'all');

    const navigate = (params: Record<string, string>) => {
        router.get('/teacher/grades', params, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, section });
    };

    const handleSectionChange = (value: string) => {
        setSection(value);
        navigate({ search, section: value });
    };

    const resetFilters = () => {
        setSearch('');
        setSection('all');
        router.get('/teacher/grades');
    };

    return (
        <TeacherLayout>
            <Head title="Grades" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Grades</h1>
                    <p className="mt-1 text-sm text-gray-600">View and manage student grades</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Grades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar onReset={resetFilters} showReset={!!(search || section !== 'all')}>
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search students..." />
                            <FilterDropdown
                                label="Section"
                                value={section}
                                onChange={handleSectionChange}
                                options={sections.map((s) => ({ value: s.name, label: s.name }))}
                                placeholder="All Sections"
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">LRN</th>
                                        <th className="p-3 text-left font-semibold">Name</th>
                                        <th className="p-3 text-left font-semibold">Section</th>
                                        <th className="p-3 text-left font-semibold">Year Level</th>
                                        <th className="p-3 text-center font-semibold">Status</th>
                                        <th className="p-3 text-center font-semibold">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        students.data.map((student) => (
                                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-mono text-sm">{student.lrn}</td>
                                                <td className="p-3 font-medium">
                                                    {student.last_name}, {student.first_name}
                                                </td>
                                                <td className="p-3 text-sm">{student.section || '-'}</td>
                                                <td className="p-3 text-sm">{student.year_level || '-'}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`inline-block rounded px-2 py-1 text-xs capitalize ${
                                                        student.enrollment_status === 'enrolled'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {student.enrollment_status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm text-gray-400">
                                                    —
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination data={students} />
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
