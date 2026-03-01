import { Head, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    GraduationCap,
    Search,
    Info,
    Plus,
    Minus,
    Lock,
    ArrowLeft,
    Filter,
    X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import StudentLayout from '@/layouts/student/student-layout';

interface Prerequisite {
    id: number;
    code: string;
    name: string;
    completed: boolean;
}

interface AvailableSubject {
    id: number;
    code: string;
    name: string;
    description: string | null;
    units: number;
    type: string;
    semester: number | null;
    hours_per_week: number | null;
    year_level_name: string;
    level_number: number;
    prerequisites: Prerequisite[];
    prerequisites_met: boolean;
    programs: string[];
}

interface EnrolledSubject {
    id: number;
    subject_id: number;
    code: string;
    name: string;
    units: number;
    type: string;
    status: string;
    grade: number | null;
}

interface StudentInfo {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    program: string | null;
    year_level: string | null;
    department_id: number | null;
    enrollment_status: string;
}

interface Props {
    student: StudentInfo;
    currentSchoolYear: string;
    activeSemester: number;
    activeSemesterLabel: string;
    availableSubjects: AvailableSubject[];
    enrolledSubjects: EnrolledSubject[];
    completedSubjectIds: number[];
    enrolledUnits: number;
    maxUnits: number;
    minUnits: number;
    idealUnits: number;
}

const typeColors: Record<string, string> = {
    core:     'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    major:    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    elective: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    general:  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function SubjectEnrollment({
    student,
    currentSchoolYear,
    activeSemester,
    activeSemesterLabel,
    availableSubjects,
    enrolledSubjects,
    completedSubjectIds,
    enrolledUnits,
    maxUnits,
    minUnits,
    idealUnits,
}: Props) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [enrolling, setEnrolling] = useState(false);
    const [dropping, setDropping] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dropDialogOpen, setDropDialogOpen] = useState(false);
    const [subjectToDrop, setSubjectToDrop] = useState<EnrolledSubject | null>(null);

    // ── Derived data ────────────────────────────────────────────────────
    const selectedUnits = useMemo(() => {
        return availableSubjects
            .filter(s => selectedIds.includes(s.id))
            .reduce((sum, s) => sum + s.units, 0);
    }, [selectedIds, availableSubjects]);

    const totalUnitsAfterEnroll = enrolledUnits + selectedUnits;
    const unitProgress = Math.min((totalUnitsAfterEnroll / maxUnits) * 100, 100);
    const wouldExceedMax = totalUnitsAfterEnroll > maxUnits;

    // Get unique year levels and types for filters
    const yearLevels = useMemo(() => {
        const unique = [...new Set(availableSubjects.map(s => s.year_level_name))];
        return unique.sort((a, b) => {
            const aNum = availableSubjects.find(s => s.year_level_name === a)?.level_number ?? 0;
            const bNum = availableSubjects.find(s => s.year_level_name === b)?.level_number ?? 0;
            return aNum - bNum;
        });
    }, [availableSubjects]);

    const subjectTypes = useMemo(() => {
        return [...new Set(availableSubjects.map(s => s.type))];
    }, [availableSubjects]);

    // ── Filtered subjects ───────────────────────────────────────────────
    const filteredSubjects = useMemo(() => {
        return availableSubjects.filter(s => {
            if (search) {
                const q = search.toLowerCase();
                if (!s.code.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) {
                    return false;
                }
            }
            if (typeFilter !== 'all' && s.type !== typeFilter) return false;
            if (yearFilter !== 'all' && s.year_level_name !== yearFilter) return false;
            return true;
        });
    }, [availableSubjects, search, typeFilter, yearFilter]);

    // Group by year level for display
    const groupedSubjects = useMemo(() => {
        const groups: Record<string, AvailableSubject[]> = {};
        filteredSubjects.forEach(s => {
            const key = s.year_level_name;
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });
        // Sort groups by level number
        return Object.entries(groups).sort((a, b) => {
            const aNum = a[1][0]?.level_number ?? 0;
            const bNum = b[1][0]?.level_number ?? 0;
            return aNum - bNum;
        });
    }, [filteredSubjects]);

    // ── Handlers ────────────────────────────────────────────────────────
    const toggleSubject = (subjectId: number) => {
        setSelectedIds(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleEnrollSubmit = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }
        if (wouldExceedMax) {
            toast.error(`Cannot enroll: total units (${totalUnitsAfterEnroll}) would exceed the maximum of ${maxUnits} units.`);
            return;
        }
        setConfirmDialogOpen(true);
    };

    const confirmEnroll = () => {
        setEnrolling(true);
        setConfirmDialogOpen(false);

        router.post('/student/enrollment/subjects', {
            subject_ids: selectedIds,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedIds([]);
                setEnrolling(false);
                toast.success('Successfully enrolled in selected subjects!');
            },
            onError: () => {
                setEnrolling(false);
                toast.error('Failed to enroll. Please try again.');
            },
        });
    };

    const handleDropSubject = (subject: EnrolledSubject) => {
        setSubjectToDrop(subject);
        setDropDialogOpen(true);
    };

    const confirmDrop = () => {
        if (!subjectToDrop) return;
        setDropping(true);
        setDropDialogOpen(false);

        router.delete(`/student/enrollment/subjects/${subjectToDrop.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDropping(false);
                setSubjectToDrop(null);
                toast.success(`Successfully dropped ${subjectToDrop.name}.`);
            },
            onError: () => {
                setDropping(false);
                toast.error('Failed to drop subject.');
            },
        });
    };

    const selectedSubjects = availableSubjects.filter(s => selectedIds.includes(s.id));

    return (
        <StudentLayout>
            <Head title="Subject Enrollment" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            Subject Enrollment
                        </h1>
                        <p className="text-muted-foreground">
                            {activeSemesterLabel} — S.Y. {currentSchoolYear}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-sm">
                            <GraduationCap className="h-3.5 w-3.5 mr-1" />
                            {student.program ?? 'No Program'}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                            {student.year_level ?? 'N/A'}
                        </Badge>
                    </div>
                </div>

                {/* Unit Counter Card */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Enrolled Units</p>
                                    <p className="text-2xl font-bold">
                                        {enrolledUnits}
                                        {selectedUnits > 0 && (
                                            <span className="text-primary"> + {selectedUnits}</span>
                                        )}
                                        <span className="text-lg text-muted-foreground font-normal"> / {maxUnits}</span>
                                    </p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground space-y-0.5">
                                    <p>Standard: {idealUnits} units</p>
                                    <p>Min: {minUnits} | Max: {maxUnits} units</p>
                                </div>
                            </div>
                            <Progress value={unitProgress} className={wouldExceedMax ? '[&>div]:bg-destructive' : ''} />
                            {wouldExceedMax && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Exceeds maximum of {maxUnits} units per semester
                                </p>
                            )}
                            {totalUnitsAfterEnroll > 0 && totalUnitsAfterEnroll < minUnits && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Info className="h-3.5 w-3.5" />
                                    Below minimum regular load of {minUnits} units (underload)
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Currently Enrolled Subjects */}
                {enrolledSubjects.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Currently Enrolled Subjects ({enrolledSubjects.length})
                            </CardTitle>
                            <CardDescription>
                                Subjects you're enrolled in for {activeSemesterLabel} — {enrolledUnits} total units
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead className="text-center">Units</TableHead>
                                            <TableHead className="text-center">Type</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {enrolledSubjects.map(es => (
                                            <TableRow key={es.id}>
                                                <TableCell className="font-mono font-medium">{es.code}</TableCell>
                                                <TableCell>{es.name}</TableCell>
                                                <TableCell className="text-center">{es.units}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className={typeColors[es.type] || ''}>
                                                        {es.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        {es.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {es.status === 'enrolled' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDropSubject(es)}
                                                            disabled={dropping}
                                                        >
                                                            <Minus className="h-3.5 w-3.5 mr-1" />
                                                            Drop
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Available Subjects */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Available Subjects
                                </CardTitle>
                                <CardDescription>
                                    Select subjects to enroll in for {activeSemesterLabel}. 
                                    You can enroll in up to {maxUnits} units.
                                </CardDescription>
                            </div>
                            {selectedIds.length > 0 && (
                                <Button
                                    onClick={handleEnrollSubmit}
                                    disabled={enrolling || wouldExceedMax}
                                    className="shrink-0"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Enroll in {selectedIds.length} Subject{selectedIds.length > 1 ? 's' : ''} ({selectedUnits} units)
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by code or name..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <Filter className="h-3.5 w-3.5 mr-1" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {subjectTypes.map(t => (
                                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-3.5 w-3.5 mr-1" />
                                    <SelectValue placeholder="Year Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Year Levels</SelectItem>
                                    {yearLevels.map(yl => (
                                        <SelectItem key={yl} value={yl}>{yl}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject List by Year Level */}
                        {filteredSubjects.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No available subjects found</p>
                                <p className="text-sm">
                                    {search || typeFilter !== 'all' || yearFilter !== 'all'
                                        ? 'Try adjusting your filters.'
                                        : 'All subjects for this semester have been completed or enrolled.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupedSubjects.map(([yearLevelName, subjects]) => (
                                    <div key={yearLevelName}>
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                                            {yearLevelName}
                                        </h3>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                        <TableHead>Code</TableHead>
                                                        <TableHead>Subject</TableHead>
                                                        <TableHead className="text-center">Units</TableHead>
                                                        <TableHead className="text-center">Hrs/Wk</TableHead>
                                                        <TableHead className="text-center">Type</TableHead>
                                                        <TableHead>Prerequisites</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {subjects.map(subject => {
                                                        const isSelected = selectedIds.includes(subject.id);
                                                        const prereqsMet = subject.prerequisites_met;
                                                        const disabled = !prereqsMet;

                                                        return (
                                                            <TableRow
                                                                key={subject.id}
                                                                className={`${isSelected ? 'bg-primary/5' : ''} ${disabled ? 'opacity-60' : 'cursor-pointer hover:bg-muted/50'}`}
                                                                onClick={() => !disabled && toggleSubject(subject.id)}
                                                            >
                                                                <TableCell>
                                                                    {disabled ? (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                                                                    </div>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Prerequisites not met</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    ) : (
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => toggleSubject(subject.id)}
                                                                            onClick={e => e.stopPropagation()}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="font-mono font-medium text-sm">
                                                                    {subject.code}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div>
                                                                        <p className="font-medium text-sm">{subject.name}</p>
                                                                        {subject.description && (
                                                                            <p className="text-xs text-muted-foreground line-clamp-1">{subject.description}</p>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-center font-semibold">
                                                                    {subject.units}
                                                                </TableCell>
                                                                <TableCell className="text-center text-muted-foreground">
                                                                    {subject.hours_per_week ?? '—'}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge variant="secondary" className={typeColors[subject.type] || ''}>
                                                                        {subject.type}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {subject.prerequisites.length === 0 ? (
                                                                        <span className="text-xs text-muted-foreground">None</span>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {subject.prerequisites.map(p => (
                                                                                <TooltipProvider key={p.id}>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className={`text-xs ${p.completed ? 'border-green-500 text-green-700 dark:text-green-400' : 'border-red-500 text-red-700 dark:text-red-400'}`}
                                                                                            >
                                                                                                {p.completed && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                                                                                                {!p.completed && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                                                                                                {p.code}
                                                                                            </Badge>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p>{p.name} — {p.completed ? 'Completed ✓' : 'Not yet completed'}</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bottom Enroll Button */}
                        {selectedIds.length > 0 && (
                            <div className="sticky bottom-4 z-10 flex justify-center">
                                <Card className="shadow-lg border-primary/20">
                                    <CardContent className="py-3 px-6 flex items-center gap-4">
                                        <div className="text-sm">
                                            <span className="font-semibold">{selectedIds.length}</span> subject{selectedIds.length > 1 ? 's' : ''} selected
                                            <span className="text-muted-foreground ml-1">({selectedUnits} units)</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setSelectedIds([])}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            onClick={handleEnrollSubmit}
                                            disabled={enrolling || wouldExceedMax}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Philippine enrollment info */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Philippine College Enrollment Guidelines</AlertTitle>
                    <AlertDescription className="text-sm space-y-1">
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                            <li>Regular load is <strong>{idealUnits} units</strong> per semester</li>
                            <li>Minimum of <strong>{minUnits} units</strong> (below is considered underload, may require approval)</li>
                            <li>Maximum of <strong>{maxUnits} units</strong> per semester (above requires dean's approval for overload)</li>
                            <li>All prerequisite subjects must be completed before enrollment</li>
                            <li>You can drop subjects during the enrollment period</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>

            {/* Confirm Enrollment Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Subject Enrollment</DialogTitle>
                        <DialogDescription>
                            You are about to enroll in the following subjects for {activeSemesterLabel} — S.Y. {currentSchoolYear}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 max-h-[300px] overflow-y-auto">
                        {selectedSubjects.map(s => (
                            <div key={s.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                                <div>
                                    <span className="font-mono font-medium">{s.code}</span>
                                    <span className="ml-2">{s.name}</span>
                                </div>
                                <Badge variant="secondary">{s.units} units</Badge>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex items-center justify-between font-semibold text-sm">
                            <span>Total Units</span>
                            <span>{selectedUnits} units (new) + {enrolledUnits} enrolled = {totalUnitsAfterEnroll} total</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmEnroll} disabled={enrolling}>
                            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Drop Subject Dialog */}
            <Dialog open={dropDialogOpen} onOpenChange={setDropDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Drop Subject</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to drop this subject?
                        </DialogDescription>
                    </DialogHeader>
                    {subjectToDrop && (
                        <div className="py-2">
                            <div className="rounded-lg border p-3">
                                <p className="font-mono font-medium">{subjectToDrop.code}</p>
                                <p className="text-sm">{subjectToDrop.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{subjectToDrop.units} units</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDropDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDrop} disabled={dropping}>
                            {dropping ? 'Dropping...' : 'Confirm Drop'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    );
}
