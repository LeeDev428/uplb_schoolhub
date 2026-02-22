import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import { Search, GraduationCap, ChevronRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { PaginatedData } from '@/types';

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string | null;
    enrollment_status: string;
    guidance_records_count: number;
    department: { name: string } | null;
    section: { name: string } | null;
}

interface Props {
    students: PaginatedData<Student>;
    filters: { search?: string; has_records?: string };
}

const STATUS_COLORS: Record<string, string> = {
    enrolled:     'bg-green-100 text-green-800',
    not_enrolled: 'bg-gray-100 text-gray-600',
    pending:      'bg-yellow-100 text-yellow-800',
    dropped:      'bg-red-100 text-red-700',
};

export default function GuidanceStudents({ students, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function doSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/guidance/students', { search, has_records: filters.has_records }, { preserveScroll: true });
    }

    function toggleFilter() {
        const hasRecords = filters.has_records === '1' ? '' : '1';
        router.get('/guidance/students', { search, has_records: hasRecords }, { preserveScroll: true });
    }

    return (
        <GuidanceLayout>
            <Head title="Students — Guidance" />
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Students</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Browse student profiles and their counseling history</p>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={doSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or LRN…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="outline">Search</Button>
                    </form>
                    <Button
                        type="button"
                        variant={filters.has_records === '1' ? 'default' : 'outline'}
                        onClick={toggleFilter}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        With Records Only
                    </Button>
                </div>

                {/* Stats */}
                <Card>
                    <CardContent className="flex items-center gap-6 py-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-xl font-bold">{students.total}</p>
                                <p className="text-xs text-muted-foreground">Students Found</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Student List */}
                {students.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No students found.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {students.data.map(student => (
                            <Link
                                key={student.id}
                                href={`/guidance/students/${student.id}`}
                                className="flex items-center justify-between rounded-xl border p-4 hover:shadow-sm hover:border-primary/30 transition-all group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold group-hover:text-primary truncate">
                                        {student.last_name}, {student.first_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {student.lrn ? `LRN: ${student.lrn}` : ''}
                                        {student.department ? ` · ${student.department.name}` : ''}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_COLORS[student.enrollment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {student.enrollment_status.replace(/_/g, ' ')}
                                        </span>
                                        {student.guidance_records_count > 0 && (
                                            <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-medium">
                                                {student.guidance_records_count} record{student.guidance_records_count !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {students.from}–{students.to} of {students.total}
                        </p>
                        <div className="flex gap-2">
                            {students.prev_page_url && (
                                <Link href={students.prev_page_url} className="rounded border px-3 py-1.5 text-sm hover:bg-muted/50">Previous</Link>
                            )}
                            {students.next_page_url && (
                                <Link href={students.next_page_url} className="rounded border px-3 py-1.5 text-sm hover:bg-muted/50">Next</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </GuidanceLayout>
    );
}
