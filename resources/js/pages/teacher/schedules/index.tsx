import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schedules', href: '/teacher/schedules' },
];

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
    filters: { search?: string };
}

export default function TeacherSchedules({ schedules, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/teacher/schedules', { search: value }, { preserveState: true, replace: true });
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Schedules</h1>
                    <p className="mt-1 text-sm text-muted-foreground">View class schedules for your department</p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <FilterBar showReset={false}>
                            <SearchBar value={search} onChange={handleSearchChange} placeholder="Search schedules..." />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left text-sm font-semibold">Title</th>
                                        <th className="p-3 text-left text-sm font-semibold">Department</th>
                                        <th className="p-3 text-left text-sm font-semibold">Program</th>
                                        <th className="p-3 text-left text-sm font-semibold">Year Level</th>
                                        <th className="p-3 text-left text-sm font-semibold">Section</th>
                                        <th className="p-3 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No schedules available
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.data.map((schedule) => (
                                            <tr key={schedule.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3 font-medium">{schedule.title}</td>
                                                <td className="p-3 text-sm">{schedule.department.name}</td>
                                                <td className="p-3 text-sm">{schedule.program?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.year_level?.name || 'All'}</td>
                                                <td className="p-3 text-sm">{schedule.section?.name || 'All'}</td>
                                                <td className="p-3">
                                                    <Button variant="ghost" size="icon" onClick={() => setViewingSchedule(schedule)} title="View PDF">
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
                            <div className="mt-4"><Pagination data={schedules} /></div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!viewingSchedule} onOpenChange={() => setViewingSchedule(null)}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh]">
                    <DialogHeader>
                        <DialogTitle>{viewingSchedule?.title}</DialogTitle>
                    </DialogHeader>
                    {viewingSchedule && (
                        <iframe
                            src={`/storage/${viewingSchedule.file_path}`}
                            className="w-full h-full rounded-lg border"
                            title={viewingSchedule.title}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </TeacherLayout>
    );
}
