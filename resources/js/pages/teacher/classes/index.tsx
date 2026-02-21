import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { BookOpen, GraduationCap, Users, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classes', href: '/teacher/classes' },
];

interface SubjectItem {
    id: number;
    code: string;
    name: string;
    type: string;
    units: number | null;
    i_teach: boolean;   // true if this teacher is a subject teacher for this subject
    teachers: string[]; // all subject teachers assigned
}

interface StudentItem {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    lrn: string | null;
    gender: string;
    enrollment_status: string;
}

interface AdvisorySection {
    id: number;
    name: string;
    code: string | null;
    capacity: number | null;
    room_number: string | null;
    department: { id: number; name: string } | null;
    year_level: { id: number; name: string } | null;
    students_count: number;
    students: StudentItem[];
    subjects: SubjectItem[];
}

interface TeachingSubject {
    id: number;
    code: string;
    name: string;
    type: string;
    units: number | null;
    department: string | null;
    year_level: string | null;
    student_count: number;
}

interface Props {
    advisorySections: AdvisorySection[];
    teachingSubjects: TeachingSubject[];
}

const typeBadgeVariant: Record<string, any> = {
    core: 'default', major: 'secondary', elective: 'outline', general: 'outline',
};

export default function ClassesIndex({ advisorySections, teachingSubjects }: Props) {
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<Record<number, 'students' | 'subjects'>>({});

    const toggleSection = (id: number) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const getTab = (id: number) => activeTab[id] ?? 'students';
    const setTab = (id: number, tab: 'students' | 'subjects') => {
        setActiveTab(prev => ({ ...prev, [id]: tab }));
    };

    const getStudentName = (s: StudentItem) => {
        let name = `${s.last_name}, ${s.first_name}`;
        if (s.middle_name) name += ` ${s.middle_name.charAt(0)}.`;
        if (s.suffix && !['none', ''].includes(s.suffix.toLowerCase())) name += ` ${s.suffix}`;
        return name;
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="My Classes" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your advisory section(s) and teaching subjects
                        </p>
                    </div>
                </div>

                {/* ─── Advisory Sections ─── */}
                <div>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                        <Users className="h-5 w-5 text-primary" />
                        Advisory / Homeroom Section(s)
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            assigned by Registrar
                        </span>
                    </h2>

                    {advisorySections.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                                <Users className="h-10 w-10 opacity-30" />
                                <p className="text-sm">You have no advisory section assigned.</p>
                                <p className="text-xs">The Registrar assigns advisory sections via the Classes page.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {advisorySections.map(section => {
                                const isExpanded = expandedSections.has(section.id);
                                const tab = getTab(section.id);
                                const iTeachCount = section.subjects.filter(s => s.i_teach).length;

                                return (
                                    <Card key={section.id} className="overflow-hidden">
                                        {/* Section Header */}
                                        <button
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
                                            onClick={() => toggleSection(section.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded
                                                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                <div>
                                                    <span className="font-semibold">{section.name}</span>
                                                    {section.code && (
                                                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{section.code}</span>
                                                    )}
                                                    <span className="ml-2 text-sm text-muted-foreground">
                                                        {section.department?.name} &bull; {section.year_level?.name}
                                                        {section.room_number && ` &bull; Room ${section.room_number}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Badge variant="secondary">{section.students_count} students</Badge>
                                                <Badge variant="outline">{section.subjects.length} subjects</Badge>
                                                {iTeachCount > 0 && (
                                                    <Badge variant="default" className="gap-1">
                                                        <Star className="h-3 w-3" />
                                                        You teach {iTeachCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </button>

                                        {/* Expandable Content */}
                                        {isExpanded && (
                                            <div className="border-t">
                                                {/* Sub-tabs */}
                                                <div className="flex border-b bg-muted/20">
                                                    <button
                                                        onClick={() => setTab(section.id, 'students')}
                                                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                            tab === 'students'
                                                                ? 'border-b-2 border-primary text-primary'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <Users className="mr-1.5 inline h-3.5 w-3.5" />
                                                        Students ({section.students_count})
                                                    </button>
                                                    <button
                                                        onClick={() => setTab(section.id, 'subjects')}
                                                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                            tab === 'subjects'
                                                                ? 'border-b-2 border-primary text-primary'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        <BookOpen className="mr-1.5 inline h-3.5 w-3.5" />
                                                        Subjects ({section.subjects.length})
                                                        {iTeachCount > 0 && (
                                                            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                                                                {iTeachCount} yours
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Students Tab */}
                                                {tab === 'students' && (
                                                    <div className="divide-y">
                                                        {section.students.length === 0 ? (
                                                            <p className="p-4 text-center text-sm text-muted-foreground">No students assigned yet.</p>
                                                        ) : (
                                                            section.students.map((student, idx) => (
                                                                <div key={student.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30">
                                                                    <span className="w-6 text-xs text-muted-foreground">{idx + 1}</span>
                                                                    <span className="flex-1 text-sm font-medium">{getStudentName(student)}</span>
                                                                    {student.lrn && (
                                                                        <span className="font-mono text-xs text-muted-foreground">{student.lrn}</span>
                                                                    )}
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {student.gender === 'Male' ? 'M' : 'F'}
                                                                    </Badge>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}

                                                {/* Subjects Tab */}
                                                {tab === 'subjects' && (
                                                    <div className="divide-y">
                                                        {section.subjects.length === 0 ? (
                                                            <p className="p-4 text-center text-sm text-muted-foreground">
                                                                No subjects linked to this dept/year level yet.
                                                            </p>
                                                        ) : (
                                                            section.subjects.map(sub => (
                                                                <div
                                                                    key={sub.id}
                                                                    className={`flex items-center gap-3 px-4 py-2.5 ${
                                                                        sub.i_teach ? 'bg-primary/5' : 'hover:bg-muted/30'
                                                                    }`}
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono text-xs font-semibold text-muted-foreground">{sub.code}</span>
                                                                            <span className="text-sm font-medium truncate">{sub.name}</span>
                                                                            {sub.i_teach && (
                                                                                <Badge variant="default" className="text-xs gap-1 py-0">
                                                                                    <Star className="h-2.5 w-2.5" /> You teach
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                                            {sub.teachers.length > 0
                                                                                ? `Instructor(s): ${sub.teachers.join(', ')}`
                                                                                : 'No instructor assigned'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <Badge variant={typeBadgeVariant[sub.type] ?? 'outline'} className="text-xs">
                                                                            {sub.type}
                                                                        </Badge>
                                                                        {sub.units && (
                                                                            <span className="text-xs text-muted-foreground">{sub.units}u</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── Teaching Subjects ─── */}
                <div>
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Teaching Subjects
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            assigned by Owner / Registrar
                        </span>
                    </h2>

                    {teachingSubjects.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                                <BookOpen className="h-10 w-10 opacity-30" />
                                <p className="text-sm">No teaching subjects assigned yet.</p>
                                <p className="text-xs">Owner or Registrar assigns subject teachers via the Subjects page.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {teachingSubjects.map(sub => (
                                <Card key={sub.id}>
                                    <CardHeader className="pb-2 pt-4">
                                        <div className="flex items-start justify-between">
                                            <span className="font-mono text-xs font-bold text-muted-foreground">{sub.code}</span>
                                            <Badge variant={typeBadgeVariant[sub.type] ?? 'outline'} className="text-xs">
                                                {sub.type}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base leading-snug">{sub.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-1 text-xs text-muted-foreground">
                                            {sub.department && <p>{sub.department}{sub.year_level ? ` · ${sub.year_level}` : ''}</p>}
                                            {sub.units && <p>{sub.units} unit{Number(sub.units) !== 1 ? 's' : ''}</p>}
                                            <div className="flex items-center gap-1 pt-1">
                                                <Users className="h-3 w-3" />
                                                <span>{sub.student_count} enrolled student{sub.student_count !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Link
                                                href={`/teacher/subjects/${sub.id}/students`}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                View students →
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
