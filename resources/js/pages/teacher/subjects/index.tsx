import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subjects',
        href: '/teacher/subjects',
    },
];

interface Department {
    id: number;
    name: string;
    classification: 'K-12' | 'College';
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    department_id: number;
}

interface Subject {
    id: number;
    code: string;
    name: string;
    description: string | null;
    classification: 'K-12' | 'College';
    units: number | null;
    hours_per_week: number | null;
    type: 'core' | 'major' | 'elective' | 'general';
    is_active: boolean;
    department: Department;
    year_level: YearLevel | null;
}

interface Props {
    subjects: {
        data: Subject[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    filters: {
        search?: string;
        type?: string;
        classification?: string;
    };
}

export default function SubjectsIndex({ subjects, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [classification, setClassification] = useState(filters.classification || 'all');

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/teacher/subjects', {
            search: value,
            type,
            classification,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTypeChange = (value: string) => {
        setType(value);
        router.get('/teacher/subjects', {
            search,
            type: value,
            classification,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        router.get('/teacher/subjects', {
            search,
            type,
            classification: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getTypeBadge = (type: string) => {
        const variants: Record<string, { label: string; variant: any }> = {
            core: { label: 'Core', variant: 'default' },
            major: { label: 'Major', variant: 'secondary' },
            elective: { label: 'Elective', variant: 'outline' },
            general: { label: 'General', variant: 'outline' },
        };
        const config = variants[type] || variants.core;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Subjects
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View subjects in your department
                        </p>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <FilterBar>
                            <SearchBar
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search subjects..."
                            />
                            <FilterDropdown
                                label="Classification"
                                value={classification}
                                onChange={handleClassificationChange}
                                options={[
                                    { value: 'all', label: 'All Classifications' },
                                    { value: 'K-12', label: 'K-12' },
                                    { value: 'College', label: 'College' },
                                ]}
                            />
                            <FilterDropdown
                                label="Type"
                                value={type}
                                onChange={handleTypeChange}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'core', label: 'Core' },
                                    { value: 'major', label: 'Major' },
                                    { value: 'elective', label: 'Elective' },
                                    { value: 'general', label: 'General' },
                                ]}
                            />
                        </FilterBar>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left text-sm font-semibold">Code</th>
                                        <th className="p-3 text-left text-sm font-semibold">Subject Name</th>
                                        <th className="p-3 text-left text-sm font-semibold">Classification</th>
                                        <th className="p-3 text-left text-sm font-semibold">Type</th>
                                        <th className="p-3 text-left text-sm font-semibold">Units</th>
                                        <th className="p-3 text-left text-sm font-semibold">Hours/Week</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No subjects found
                                            </td>
                                        </tr>
                                    ) : (
                                        subjects.data.map((subject) => (
                                            <tr key={subject.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <span className="font-mono text-sm font-medium">
                                                        {subject.code}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{subject.name}</p>
                                                        {subject.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {subject.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={subject.classification === 'K-12' ? 'secondary' : 'default'}>
                                                        {subject.classification}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    {getTypeBadge(subject.type)}
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-sm">
                                                        {subject.units ? `${subject.units}` : '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-sm">
                                                        {subject.hours_per_week ? `${subject.hours_per_week} hrs` : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {subjects.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination data={subjects} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    );
}
