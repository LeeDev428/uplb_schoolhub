import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface Section {
    id: number;
    name: string;
    code: string;
    capacity: number;
    school_year: string;
    department?: { id: number; name: string; code: string } | null;
    year_level?: { id: number; name: string } | null;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Props {
    sections: {
        data: Section[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    departments: Department[];
    filters: {
        search?: string;
        department_id?: string;
    };
}

export default function ClassesIndex({ sections, departments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [departmentId, setDepartmentId] = useState(filters.department_id || 'all');

    const navigate = (params: Record<string, string>) => {
        router.get('/teacher/classes', params, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        navigate({ search: value, department_id: departmentId });
    };

    const handleDepartmentChange = (value: string) => {
        setDepartmentId(value);
        navigate({ search, department_id: value });
    };

    const resetFilters = () => {
        setSearch('');
        setDepartmentId('all');
        router.get('/teacher/classes');
    };

    return (
        <TeacherLayout>
            <Head title="My Classes" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">My Classes</h1>
                    <p className="mt-1 text-sm text-gray-600">View sections and class rosters</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FilterBar onReset={resetFilters} showReset={!!(search || departmentId !== 'all')}>
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search sections..." />
                            <FilterDropdown
                                label="Department"
                                value={departmentId}
                                onChange={handleDepartmentChange}
                                options={departments.map((d) => ({ value: String(d.id), label: `${d.name} (${d.code})` }))}
                                placeholder="All Departments"
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-semibold">Section</th>
                                        <th className="p-3 text-left font-semibold">Code</th>
                                        <th className="p-3 text-left font-semibold">Department</th>
                                        <th className="p-3 text-left font-semibold">Year Level</th>
                                        <th className="p-3 text-center font-semibold">Capacity</th>
                                        <th className="p-3 text-center font-semibold">School Year</th>
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">No sections found.</td>
                                        </tr>
                                    ) : (
                                        sections.data.map((section) => (
                                            <tr key={section.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{section.name}</td>
                                                <td className="p-3">
                                                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{section.code}</span>
                                                </td>
                                                <td className="p-3 text-sm">{section.department?.name || '-'}</td>
                                                <td className="p-3 text-sm">{section.year_level?.name || '-'}</td>
                                                <td className="p-3 text-center">{section.capacity}</td>
                                                <td className="p-3 text-center text-sm">{section.school_year}</td>
                                                <td className="p-3 text-center">
                                                    <Link href={`/teacher/classes/${section.id}`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination data={sections} />
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
