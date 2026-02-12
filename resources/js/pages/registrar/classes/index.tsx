import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { SearchBar } from '@/components/filters/search-bar';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { FilterBar } from '@/components/filters/filter-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users, UserCheck, UserMinus, ArrowRight, ChevronDown, ChevronRight,
    X, GraduationCap,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classes', href: '/registrar/classes' },
];

interface Department {
    id: number;
    name: string;
}

interface YearLevel {
    id: number;
    name: string;
    level_number: number;
    department_id: number;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    lrn: string | null;
    email: string | null;
    gender: string;
    student_type: string | null;
    program: string | null;
    year_level: string | null;
    section: string | null;
    section_id: number | null;
    department_id: number | null;
    year_level_id: number | null;
    enrollment_status: string;
}

interface SectionData {
    id: number;
    name: string;
    code: string | null;
    capacity: number | null;
    room_number: string | null;
    department_id: number;
    year_level_id: number;
    department: Department;
    year_level: YearLevel;
    students_count: number;
    assigned_students: Student[];
}

interface Props {
    unassignedStudents: Student[];
    sections: SectionData[];
    departments: Department[];
    yearLevels: YearLevel[];
    stats: {
        totalStudents: number;
        assignedCount: number;
        unassignedCount: number;
        maleCount: number;
        femaleCount: number;
    };
    filters: {
        search?: string;
        department_id?: string;
        year_level_id?: string;
        student_type?: string;
    };
}

export default function RegistrarClassesIndex({
    unassignedStudents,
    sections,
    departments,
    yearLevels,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department_id || 'all');
    const [selectedYearLevel, setSelectedYearLevel] = useState(filters.year_level_id || 'all');
    const [studentType, setStudentType] = useState(filters.student_type || 'all');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [targetSection, setTargetSection] = useState<string>('');
    const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
    const [unassignedGenderFilter, setUnassignedGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
    const [assigning, setAssigning] = useState(false);

    // Filter year levels based on selected department
    const filteredYearLevels = useMemo(() => {
        if (selectedDepartment === 'all') return yearLevels;
        return yearLevels.filter(yl => yl.department_id === parseInt(selectedDepartment));
    }, [yearLevels, selectedDepartment]);

    // Filter unassigned students by gender tab
    const displayedUnassigned = useMemo(() => {
        if (unassignedGenderFilter === 'all') return unassignedStudents;
        return unassignedStudents.filter(s => s.gender === unassignedGenderFilter);
    }, [unassignedStudents, unassignedGenderFilter]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        router.get('/registrar/classes', {
            search: value,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            student_type: studentType,
        }, { preserveState: true, replace: true });
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        setSelectedYearLevel('all');
        router.get('/registrar/classes', {
            search,
            department_id: value,
            year_level_id: 'all',
            student_type: studentType,
        }, { preserveState: true, replace: true });
    };

    const handleYearLevelChange = (value: string) => {
        setSelectedYearLevel(value);
        router.get('/registrar/classes', {
            search,
            department_id: selectedDepartment,
            year_level_id: value,
            student_type: studentType,
        }, { preserveState: true, replace: true });
    };

    const handleStudentTypeChange = (value: string) => {
        setStudentType(value);
        router.get('/registrar/classes', {
            search,
            department_id: selectedDepartment,
            year_level_id: selectedYearLevel,
            student_type: value,
        }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedDepartment('all');
        setSelectedYearLevel('all');
        setStudentType('all');
        setSelectedStudents([]);
        setTargetSection('');
        router.get('/registrar/classes', {}, { preserveState: true, replace: true });
    };

    const toggleStudent = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleAllUnassigned = () => {
        if (selectedStudents.length === displayedUnassigned.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(displayedUnassigned.map(s => s.id));
        }
    };

    const toggleSection = (sectionId: number) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const handleAssign = () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }
        if (!targetSection) {
            toast.error('Please select a target section');
            return;
        }

        setAssigning(true);
        router.post('/registrar/classes/assign', {
            student_ids: selectedStudents,
            section_id: parseInt(targetSection),
        }, {
            preserveState: false,
            onSuccess: () => {
                setSelectedStudents([]);
                setTargetSection('');
                toast.success('Students assigned successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
            onFinish: () => setAssigning(false),
        });
    };

    const handleRemoveStudent = (studentId: number) => {
        router.delete(`/registrar/classes/remove/${studentId}`, {
            preserveState: false,
            onSuccess: () => {
                toast.success('Student removed from section');
            },
        });
    };

    const getStudentName = (student: Student) => {
        let name = `${student.last_name}, ${student.first_name}`;
        if (student.middle_name) name += ` ${student.middle_name.charAt(0)}.`;
        if (student.suffix && !['none', ''].includes(student.suffix.toLowerCase())) name += ` ${student.suffix}`;
        return name;
    };

    return (
        <RegistrarLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Assign students to sections and manage class rosters
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                                <p className="text-xs text-muted-foreground">Total Enrolled</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.assignedCount}</p>
                                <p className="text-xs text-muted-foreground">Assigned</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2">
                                <UserMinus className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.unassignedCount}</p>
                                <p className="text-xs text-muted-foreground">Unassigned</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.maleCount}</p>
                            <p className="text-xs text-muted-foreground">Male Students</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-pink-600">{stats.femaleCount}</p>
                            <p className="text-xs text-muted-foreground">Female Students</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <FilterBar onReset={handleReset}>
                    <SearchBar value={search} onChange={handleSearchChange} placeholder="Search students..." />
                    <FilterDropdown
                        label="Department"
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                        options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
                    />
                    <FilterDropdown
                        label="Year Level"
                        value={selectedYearLevel}
                        onChange={handleYearLevelChange}
                        options={filteredYearLevels.map(yl => ({ value: yl.id.toString(), label: yl.name }))}
                    />
                    <FilterDropdown
                        label="Student Type"
                        value={studentType}
                        onChange={handleStudentTypeChange}
                        options={[
                            { value: 'new', label: 'New' },
                            { value: 'old', label: 'Old' },
                            { value: 'transferee', label: 'Transferee' },
                            { value: 'returnee', label: 'Returnee' },
                        ]}
                    />
                </FilterBar>

                {/* Two-Panel Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel - Unassigned Students */}
                    <Card className="flex flex-col max-h-[calc(100vh-420px)]">
                        <CardHeader className="flex-shrink-0 pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserMinus className="h-5 w-5 text-red-500" />
                                    Unassigned Students
                                    <Badge variant="secondary">{unassignedStudents.length}</Badge>
                                </CardTitle>
                            </div>

                            {/* Gender Tabs */}
                            <div className="flex gap-1 mt-2">
                                {(['all', 'Male', 'Female'] as const).map(tab => (
                                    <Button
                                        key={tab}
                                        size="sm"
                                        variant={unassignedGenderFilter === tab ? 'default' : 'ghost'}
                                        onClick={() => setUnassignedGenderFilter(tab)}
                                        className="text-xs h-7"
                                    >
                                        {tab === 'all' ? `All (${unassignedStudents.length})` :
                                         tab === 'Male' ? `Male (${unassignedStudents.filter(s => s.gender === 'Male').length})` :
                                         `Female (${unassignedStudents.filter(s => s.gender === 'Female').length})`
                                        }
                                    </Button>
                                ))}
                            </div>

                            {/* Assign Controls */}
                            {selectedStudents.length > 0 && (
                                <div className="flex items-center gap-2 mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20 z-10 relative">
                                    <Badge variant="default">{selectedStudents.length} selected</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <Select value={targetSection} onValueChange={setTargetSection}>
                                        <SelectTrigger className="flex-1 h-8">
                                            <SelectValue placeholder="Select section..." />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="z-50">
                                            {sections.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name} — {s.department?.name || 'N/A'} ({s.students_count}/{s.capacity || '∞'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button size="sm" onClick={handleAssign} disabled={assigning || !targetSection}>
                                        Assign
                                    </Button>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
                            {displayedUnassigned.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>No unassigned students found</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {/* Select All */}
                                    <div className="flex items-center gap-3 p-2 border-b mb-2">
                                        <Checkbox
                                            checked={selectedStudents.length === displayedUnassigned.length && displayedUnassigned.length > 0}
                                            onCheckedChange={toggleAllUnassigned}
                                        />
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                                            Select All
                                        </span>
                                    </div>

                                    {displayedUnassigned.map((student) => (
                                        <div
                                            key={student.id}
                                            className={`flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer ${
                                                selectedStudents.includes(student.id) ? 'bg-primary/5 border border-primary/20' : ''
                                            }`}
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <Checkbox
                                                checked={selectedStudents.includes(student.id)}
                                                onCheckedChange={() => toggleStudent(student.id)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{getStudentName(student)}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    {student.lrn && (
                                                        <span className="text-xs text-muted-foreground">LRN: {student.lrn}</span>
                                                    )}
                                                    {student.program && (
                                                        <span className="text-xs text-muted-foreground">• {student.program}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs shrink-0">
                                                {student.gender === 'Male' ? 'M' : 'F'}
                                            </Badge>
                                            {student.student_type && (
                                                <Badge variant="secondary" className="text-xs shrink-0">
                                                    {student.student_type}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Panel - Sections with Assigned Students */}
                    <Card className="flex flex-col max-h-[calc(100vh-420px)]">
                        <CardHeader className="flex-shrink-0 pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-green-500" />
                                Assigned to Sections
                                <Badge variant="secondary">{sections.length} sections</Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
                            {sections.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p>No sections found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sections.map((section) => (
                                        <div key={section.id} className="border rounded-lg overflow-hidden">
                                            {/* Section Header */}
                                            <button
                                                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                                                onClick={() => toggleSection(section.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {expandedSections.has(section.id) ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <div>
                                                        <span className="font-semibold text-sm">{section.name}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {section.department?.name || 'N/A'} • {section.year_level?.name || 'N/A'}
                                                            {section.room_number && ` • Room ${section.room_number}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                section.capacity && section.students_count / section.capacity > 0.9
                                                                    ? 'bg-red-500'
                                                                    : section.capacity && section.students_count / section.capacity > 0.7
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                            }`}
                                                            style={{
                                                                width: section.capacity
                                                                    ? `${Math.min((section.students_count / section.capacity) * 100, 100)}%`
                                                                    : '0%'
                                                            }}
                                                        />
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {section.students_count}/{section.capacity || '∞'}
                                                    </Badge>
                                                </div>
                                            </button>

                                            {/* Expanded Student List */}
                                            {expandedSections.has(section.id) && (
                                                <div className="border-t bg-muted/20">
                                                    {section.assigned_students.length === 0 ? (
                                                        <p className="p-3 text-sm text-muted-foreground text-center">
                                                            No students assigned
                                                        </p>
                                                    ) : (
                                                        <div className="divide-y">
                                                            {section.assigned_students.map((student) => (
                                                                <div
                                                                    key={student.id}
                                                                    className="flex items-center justify-between p-2 px-4 hover:bg-muted/50"
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <span className="text-sm truncate">{getStudentName(student)}</span>
                                                                        <Badge variant="outline" className="text-xs shrink-0">
                                                                            {student.gender === 'Male' ? 'M' : 'F'}
                                                                        </Badge>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                                                                        onClick={() => handleRemoveStudent(student.id)}
                                                                        title="Remove from section"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RegistrarLayout>
    );
}
