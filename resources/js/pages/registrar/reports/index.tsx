import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users, UserCheck, UserX, GraduationCap, BarChart3,
    FileText, Download, TrendingUp,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/registrar/reports' },
];

interface Department {
    id: number;
    name: string;
}

interface DistributionItem {
    name: string;
    count: number;
}

interface EnrollmentItem {
    status: string;
    count: number;
}

interface SectionFillRate {
    name: string;
    department: string;
    year_level: string;
    room_number: string | null;
    students: number;
    capacity: number;
    fill_rate: number;
}

interface Props {
    stats: {
        totalStudents: number;
        maleStudents: number;
        femaleStudents: number;
        enrolledStudents: number;
        pendingStudents: number;
    };
    departmentDistribution: DistributionItem[];
    yearLevelDistribution: DistributionItem[];
    enrollmentDistribution: EnrollmentItem[];
    sectionFillRates: SectionFillRate[];
    departments: Department[];
    filters: {
        classification?: string;
        department_id?: string;
    };
}

// Simple bar chart component using Tailwind
function BarChart({ data, colorClass = 'bg-primary' }: { data: { label: string; value: number }[]; colorClass?: string }) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="space-y-3">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[60%]">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                            style={{ width: `${Math.max((item.value / maxValue) * 100, 2)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Horizontal pill chart for enrollment status
function StatusChart({ data }: { data: EnrollmentItem[] }) {
    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    const colors: Record<string, string> = {
        Enrolled: 'bg-green-500',
        Pending: 'bg-yellow-500',
        Dropped: 'bg-red-500',
        Graduated: 'bg-blue-500',
    };

    return (
        <div className="space-y-4">
            <div className="flex h-6 w-full rounded-full overflow-hidden">
                {data.map((item, idx) => (
                    item.count > 0 && (
                        <div
                            key={idx}
                            className={`${colors[item.status] || 'bg-gray-400'} transition-all duration-500`}
                            style={{ width: `${(item.count / total) * 100}%` }}
                            title={`${item.status}: ${item.count}`}
                        />
                    )
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={`h-3 w-3 rounded-full ${colors[item.status] || 'bg-gray-400'}`} />
                        <span className="text-muted-foreground">{item.status}</span>
                        <span className="font-semibold">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function RegistrarReportsIndex({
    stats,
    departmentDistribution,
    yearLevelDistribution,
    enrollmentDistribution,
    sectionFillRates,
    departments,
    filters,
}: Props) {
    const [classification, setClassification] = useState(filters.classification || 'all');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [activeTab, setActiveTab] = useState<'analytics' | 'sections'>('analytics');

    const handleClassificationChange = (value: string) => {
        setClassification(value);
        setSelectedDepartment('all');
        router.get('/registrar/reports', { classification: value, department_id: 'all' }, { preserveState: true, replace: true });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        router.get('/registrar/reports', { classification, department_id: value }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setClassification('all');
        setSelectedDepartment('all');
        router.get('/registrar/reports', {}, { preserveState: true, replace: true });
    };

    const genderData = useMemo(() => [
        { label: 'Male', value: stats.maleStudents },
        { label: 'Female', value: stats.femaleStudents },
    ], [stats]);

    const deptData = useMemo(() =>
        departmentDistribution.map(d => ({ label: d.name, value: d.count })),
        [departmentDistribution]
    );

    const ylData = useMemo(() =>
        yearLevelDistribution.map(d => ({ label: d.name, value: d.count })),
        [yearLevelDistribution]
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />

            <div className="space-y-6 p-6 print:p-0">
                {/* Header */}
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                School enrollment analytics and reporting dashboard
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handlePrint}>
                        <Download className="mr-2 h-4 w-4" />
                        Print Report
                    </Button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                                <p className="text-xs text-muted-foreground">Total Students</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.enrolledStudents}</p>
                                <p className="text-xs text-muted-foreground">Enrolled</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <UserX className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pendingStudents}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.maleStudents}</p>
                                <p className="text-xs text-muted-foreground">Male</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-pink-100 p-2">
                                <GraduationCap className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.femaleStudents}</p>
                                <p className="text-xs text-muted-foreground">Female</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="print:hidden">
                    <FilterBar onReset={handleReset}>
                        <FilterDropdown
                            label="Department"
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                        />
                    </FilterBar>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 print:hidden">
                    <Button
                        variant={activeTab === 'analytics' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab('analytics')}
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics Dashboard
                    </Button>
                    <Button
                        variant={activeTab === 'sections' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab('sections')}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Section Fill Rates
                    </Button>
                </div>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Enrollment Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Enrollment Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StatusChart data={enrollmentDistribution} />
                            </CardContent>
                        </Card>

                        {/* Gender Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Gender Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BarChart data={genderData} colorClass="bg-blue-500" />
                                <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                                    <span>Ratio: {stats.totalStudents > 0 ? ((stats.maleStudents / stats.totalStudents) * 100).toFixed(1) : 0}% Male / {stats.totalStudents > 0 ? ((stats.femaleStudents / stats.totalStudents) * 100).toFixed(1) : 0}% Female</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Department Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Department Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {deptData.length > 0 ? (
                                    <BarChart data={deptData} colorClass="bg-emerald-500" />
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Year Level Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Year Level Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {ylData.length > 0 ? (
                                    <BarChart data={ylData} colorClass="bg-violet-500" />
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">No data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Report Generation */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Report Generation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { title: 'Enrollment Report', desc: 'Student enrollment statistics summary', icon: Users },
                                        { title: 'Section Report', desc: 'Section capacity and fill rates', icon: GraduationCap },
                                        { title: 'Department Report', desc: 'Per-department student breakdown', icon: BarChart3 },
                                        { title: 'Demographics Report', desc: 'Gender & student type breakdown', icon: FileText },
                                    ].map((report, idx) => (
                                        <Card key={idx} className="border-dashed hover:border-primary transition-colors">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <report.icon className="h-5 w-5 text-primary" />
                                                    <h3 className="font-semibold text-sm">{report.title}</h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{report.desc}</p>
                                                <Button size="sm" variant="outline" className="w-full" onClick={handlePrint}>
                                                    <Download className="mr-2 h-3 w-3" />
                                                    Generate PDF
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Section Fill Rates Tab */}
                {activeTab === 'sections' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Section Fill Rates (Top 10)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-semibold">Section</th>
                                            <th className="p-3 text-left text-sm font-semibold">Department</th>
                                            <th className="p-3 text-left text-sm font-semibold">Year Level</th>
                                            <th className="p-3 text-left text-sm font-semibold">Room</th>
                                            <th className="p-3 text-left text-sm font-semibold">Students</th>
                                            <th className="p-3 text-left text-sm font-semibold">Capacity</th>
                                            <th className="p-3 text-left text-sm font-semibold">Fill Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sectionFillRates.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                    No sections found
                                                </td>
                                            </tr>
                                        ) : (
                                            sectionFillRates.map((section, idx) => (
                                                <tr key={idx} className="border-b hover:bg-muted/50">
                                                    <td className="p-3 font-medium">{section.name}</td>
                                                    <td className="p-3 text-sm">{section.department}</td>
                                                    <td className="p-3 text-sm">{section.year_level}</td>
                                                    <td className="p-3 text-sm">{section.room_number || 'N/A'}</td>
                                                    <td className="p-3 text-sm font-semibold">{section.students}</td>
                                                    <td className="p-3 text-sm">{section.capacity || 'N/A'}</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${
                                                                        section.fill_rate > 90
                                                                            ? 'bg-red-500'
                                                                            : section.fill_rate > 70
                                                                            ? 'bg-yellow-500'
                                                                            : 'bg-green-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(section.fill_rate, 100)}%` }}
                                                                />
                                                            </div>
                                                            <Badge variant={
                                                                section.fill_rate > 90 ? 'destructive' :
                                                                section.fill_rate > 70 ? 'secondary' :
                                                                'default'
                                                            }>
                                                                {section.fill_rate}%
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </RegistrarLayout>
    );
}
