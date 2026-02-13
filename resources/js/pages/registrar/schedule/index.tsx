import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { Eye, Calendar } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PdfViewer } from '@/components/ui/pdf-viewer';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schedule', href: '/registrar/schedule' },
];

interface Department {
    id: number;
    name: string;
}

interface Schedule {
    id: number;
    title: string;
    file_path: string;
    file_name: string;
    department: { id: number; name: string };
    program: { id: number; name: string } | null;
    year_level: { id: number; name: string } | null;
    section: { id: number; name: string } | null;
    teacher: { id: number; first_name: string; last_name: string; suffix: string | null } | null;
    created_at: string;
}

interface Props {
    schedules: {
        data: Schedule[];
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
        classification?: string;
        department_id?: string;
    };
}

export default function RegistrarScheduleIndex({ schedules, departments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/registrar/schedule', { search: value, classification, department_id: selectedDepartment }, { preserveState: true, replace: true });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        setSelectedDepartment('all');
        router.get('/registrar/schedule', { search, classification: value, department_id: 'all' }, { preserveState: true, replace: true });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        router.get('/registrar/schedule', { search, classification, department_id: value }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setClassification('all');
        setSelectedDepartment('all');
        router.get('/registrar/schedule', {}, { preserveState: true, replace: true });
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Class Schedules</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View all uploaded class schedules across departments
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{schedules.total}</p>
                            <p className="text-xs text-muted-foreground">Total Schedules</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
                            <p className="text-xs text-muted-foreground">Departments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {schedules.data.filter(s => s.teacher).length}
                            </p>
                            <p className="text-xs text-muted-foreground">With Assigned Teachers</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <FilterBar onReset={handleReset}>
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search schedules..." />
                            <FilterDropdown
                                label="Classification"
                                value={classification}
                                onChange={handleClassificationChange}
                                options={[
                                    { value: 'K-12', label: 'K-12' },
                                    { value: 'College', label: 'College' },
                                ]}
                            />
                            <FilterDropdown
                                label="Department"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left text-sm font-semibold">Title</th>
                                        <th className="p-3 text-left text-sm font-semibold">Department</th>
                                        <th className="p-3 text-left text-sm font-semibold">Program</th>
                                        <th className="p-3 text-left text-sm font-semibold">Year Level</th>
                                        <th className="p-3 text-left text-sm font-semibold">Section</th>
                                        <th className="p-3 text-left text-sm font-semibold">Teacher</th>
                                        <th className="p-3 text-left text-sm font-semibold">File</th>
                                        <th className="p-3 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-muted-foreground">
                                                No schedules found
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="border-b hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-medium">{schedule.title}</td>
                                                <td className="p-3 text-sm">
                                                    <Badge variant="outline">{schedule.department.name}</Badge>
                                                </td>
                                                <td className="p-3 text-sm">{schedule.program?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.year_level?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.section?.name || 'All'}</td>
                                                <td className="p-3 text-sm">
                                                    {schedule.teacher
                                                        ? `${schedule.teacher.last_name}, ${schedule.teacher.first_name}${schedule.teacher.suffix ? ' ' + schedule.teacher.suffix : ''}`
                                                        : <span className="text-muted-foreground">N/A</span>
                                                    }
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground truncate max-w-[150px]">
                                                    {schedule.file_name}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setViewingSchedule(schedule)}
                                                        title="View PDF"
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

                        {schedules.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination data={schedules} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* PDF Viewer */}
            <PdfViewer
                open={!!viewingSchedule}
                onOpenChange={() => setViewingSchedule(null)}
                title={viewingSchedule?.title || ''}
                filePath={viewingSchedule?.file_path || ''}
            />
        </RegistrarLayout>
    );
}
