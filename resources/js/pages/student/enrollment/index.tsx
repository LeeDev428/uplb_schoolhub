import { Head, useForm, Link } from '@inertiajs/react';
import {
    GraduationCap,
    CheckCircle2,
    Clock,
    BookOpen,
    Info,
    User,
    Calendar,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import StudentLayout from '@/layouts/student/student-layout';

interface Department {
    id: number;
    name: string;
    code: string;
    classification: string;
}

interface Program {
    id: number;
    name: string;
    code: string;
    department_id: number;
}

interface YearLevel {
    id: number;
    name: string;
    code: string;
    department_id: number;
}

interface StudentInfo {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    department_id: number | null;
    enrollment_status: string;
    school_year: string | null;
    student_photo_url: string | null;
}

interface Props {
    student: StudentInfo;
    currentSchoolYear: string;
    hasPendingRequest: boolean;
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevel[];
    enrollmentOpen: boolean;
    classification: string;
    enrollmentPeriod: {
        start: string | null;
        end: string | null;
    };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    'not-enrolled':      { label: 'Not Enrolled',       color: 'bg-gray-100 text-gray-800' },
    'pending-registrar': { label: 'Pending Registrar',  color: 'bg-yellow-100 text-yellow-800' },
    'pending-accounting':{ label: 'Pending Accounting', color: 'bg-purple-100 text-purple-800' },
    'pending-enrollment':{ label: 'Enrollment Pending', color: 'bg-orange-100 text-orange-800' },
    'enrolled':          { label: 'Enrolled',           color: 'bg-green-100 text-green-800' },
    'dropped':           { label: 'Dropped',            color: 'bg-red-100 text-red-800' },
};

export default function SelfEnrollmentIndex({
    student,
    currentSchoolYear,
    hasPendingRequest,
    departments,
    programs,
    yearLevels,
    enrollmentOpen,
    classification,
    enrollmentPeriod,
}: Props) {
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(student.department_id);

    const filteredPrograms  = programs.filter(p => !selectedDeptId || p.department_id === selectedDeptId);
    const filteredYearLevels = yearLevels.filter(y => !selectedDeptId || y.department_id === selectedDeptId);

    const { data, setData, post, processing, errors } = useForm({
        year_level:    student.year_level ?? '',
        program:       student.program ?? '',
        department_id: student.department_id ? student.department_id.toString() : '',
        notes:         '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/enrollment');
    };

    const statusInfo = statusConfig[student.enrollment_status] ?? { label: student.enrollment_status, color: 'bg-gray-100 text-gray-800' };

    return (
        <StudentLayout>
            <Head title="Re-Enrollment" />

            <div className="space-y-6 p-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Re-Enrollment
                    </h1>
                    <p className="text-muted-foreground">
                        Submit your enrollment request for School Year {currentSchoolYear}
                    </p>
                </div>

                {/* Student Info Card */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={student.student_photo_url ?? undefined} alt={`${student.first_name} ${student.last_name}`} />
                                <AvatarFallback className="text-lg font-bold">
                                    {student.first_name[0]}{student.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-lg">{student.first_name} {student.last_name}</p>
                                <p className="text-sm text-muted-foreground">LRN: {student.lrn}</p>
                                {student.school_year && (
                                    <p className="text-xs text-muted-foreground">Last S.Y.: {student.school_year}</p>
                                )}
                            </div>
                            <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending request notice */}
                {hasPendingRequest && (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Enrollment Request Pending</AlertTitle>
                        <AlertDescription>
                            Your re-enrollment request for <strong>{currentSchoolYear}</strong> has been submitted and is waiting for the Registrar's review. You will be notified once it's processed.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Enrollment Closed Notice */}
                {!enrollmentOpen && !hasPendingRequest && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Enrollment Period Closed</AlertTitle>
                        <AlertDescription>
                            <p>
                                Enrollment for <strong>{classification}</strong> students for School Year <strong>{currentSchoolYear}</strong> is currently closed.
                            </p>
                            {enrollmentPeriod.start && enrollmentPeriod.end && (
                                <p className="mt-2 text-sm">
                                    Enrollment period: {enrollmentPeriod.start} to {enrollmentPeriod.end}
                                </p>
                            )}
                            <p className="mt-2 text-sm">
                                Please contact the Registrar's Office for more information.
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Enrollment Form */}
                {!hasPendingRequest && enrollmentOpen && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Enrollment Information
                            </CardTitle>
                            <CardDescription>
                                Fill in your academic details for School Year {currentSchoolYear}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Department */}
                                <div className="grid gap-2">
                                    <Label htmlFor="department_id">Department / Track</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(val) => {
                                            setData('department_id', val);
                                            setSelectedDeptId(val ? parseInt(val) : null);
                                            // Reset year level and program if department changed
                                            setData('year_level', '');
                                            setData('program', '');
                                        }}
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="text-sm text-destructive">{errors.department_id}</p>}
                                </div>

                                {/* Year Level */}
                                <div className="grid gap-2">
                                    <Label htmlFor="year_level">Year Level / Grade *</Label>
                                    {filteredYearLevels.length > 0 ? (
                                        <Select
                                            value={data.year_level}
                                            onValueChange={(val) => setData('year_level', val)}
                                        >
                                            <SelectTrigger id="year_level">
                                                <SelectValue placeholder="Select year level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredYearLevels.map(yl => (
                                                    <SelectItem key={yl.id} value={yl.name}>
                                                        {yl.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="year_level"
                                            value={data.year_level}
                                            onChange={e => setData('year_level', e.target.value)}
                                            placeholder="e.g., Grade 11, 1st Year"
                                            required
                                        />
                                    )}
                                    {errors.year_level && <p className="text-sm text-destructive">{errors.year_level}</p>}
                                </div>

                                {/* Program (optional) */}
                                <div className="grid gap-2">
                                    <Label htmlFor="program">Program / Strand</Label>
                                    {filteredPrograms.length > 0 ? (
                                        <Select
                                            value={data.program}
                                            onValueChange={(val) => setData('program', val)}
                                        >
                                            <SelectTrigger id="program">
                                                <SelectValue placeholder="Select program or strand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Not Applicable --</SelectItem>
                                                {filteredPrograms.map(p => (
                                                    <SelectItem key={p.id} value={p.name}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="program"
                                            value={data.program}
                                            onChange={e => setData('program', e.target.value)}
                                            placeholder="e.g., STEM, BSIT (optional)"
                                        />
                                    )}
                                    {errors.program && <p className="text-sm text-destructive">{errors.program}</p>}
                                </div>

                                {/* Notes */}
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Any additional information for the registrar..."
                                        rows={3}
                                        maxLength={1000}
                                    />
                                    {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                </div>

                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>What happens next?</AlertTitle>
                                    <AlertDescription className="text-sm space-y-1">
                                        <p>Once you submit, your request will be reviewed by the Registrar. You'll need to:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                                            <li>Submit required enrollment documents</li>
                                            <li>Settle any outstanding balance</li>
                                            <li>Wait for Registrar and Accounting clearance</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-3 justify-end">
                                    <Link href="/student/dashboard">
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing || !data.year_level}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        {processing ? 'Submitting…' : 'Submit Enrollment Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Back link if pending */}
                {hasPendingRequest && (
                    <div className="text-center">
                        <Link href="/student/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
