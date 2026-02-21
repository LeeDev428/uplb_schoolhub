import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { 
    ArrowLeft, 
    Edit, 
    FileText, 
    Printer, 
    Archive, 
    CheckCircle2,
    Clock,
    AlertCircle,
    UserX,
    GraduationCap,
    Calendar,
    Plus
} from 'lucide-react';
import { index as studentsIndex, destroy as destroyStudent } from '@/routes/registrar/students';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { StudentFormModal } from '@/components/registrar/student-form-modal';
import { EnrollmentClearanceProgress } from '@/components/registrar/enrollment-clearance-progress';
import { EnrollmentHistoryModal } from '@/components/registrar/enrollment-history-modal';
import { UpdateHistory } from '@/components/registrar/update-history';

interface StudentRequirement {
    id: number;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue';
    submitted_at: string | null;
    approved_at: string | null;
    notes: string | null;
    requirement: {
        id: number;
        name: string;
        description: string;
        deadline_text: string;
        category: {
            name: string;
        };
    };
}

interface EnrollmentClearance {
    requirements_complete: boolean;
    requirements_complete_percentage: number;
    registrar_clearance: boolean;
    accounting_clearance: boolean;
    official_enrollment: boolean;
    enrollment_status: string;
}

interface Department {
    id: number;
    name: string;
    level: string;
}

interface Program {
    id: number;
    name: string;
    department_id: number;
    department: { id: number; name: string };
}

interface YearLevel {
    id: number;
    name: string;
    department_id: number;
    level_number: number;
    department: { id: number; name: string };
}

interface Section {
    id: number;
    name: string;
    year_level_id: number;
    program_id: number | null;
    school_year: string;
    year_level: { id: number; name: string };
    program: { id: number; name: string } | null;
}

interface ActionLog {
    id: number;
    action: string;
    action_type: string;
    details: string | null;
    notes: string | null;
    changes: Record<string, { old: string; new: string }> | null;
    created_at: string;
    performer: {
        id: number;
        name: string;
    } | null;
}

interface EnrollmentHistory {
    id: number;
    school_year: string;
    status: string;
    enrolled_at: string | null;
    program: string | null;
    year_level: string | null;
    section: string | null;
    remarks: string | null;
}

interface Student {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    lrn: string;  // used as Student No.
    email: string;
    phone: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: string;
    nationality: string;
    religion: string;
    complete_address: string;
    city_municipality: string;
    province: string;
    zip_code: string;
    student_type: string;
    school_year: string;
    program: string;
    year_level: string;
    section: string | null;
    enrollment_status: string;
    requirements_status: string;
    guardian_name: string;
    guardian_relationship: string;
    guardian_contact: string;
    guardian_email: string | null;
    guardian_address: string | null;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_number: string;
    previous_school: string | null;
    previous_school_address: string | null;
    student_photo_url: string | null;
    remarks: string | null;
    requirements: StudentRequirement[];
}

interface Props {
    student: Student;
    requirementsCompletion: number;
    enrollmentClearance?: EnrollmentClearance;
    departments: Department[];
    programs: Program[];
    yearLevels: YearLevel[];
    sections: Section[];
    actionLogs: ActionLog[];
    enrollmentHistories: EnrollmentHistory[];
}

export default function StudentShow({ student, requirementsCompletion, enrollmentClearance, departments, programs, yearLevels, sections, actionLogs = [], enrollmentHistories = [] }: Props) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEnrollmentHistoryModal, setShowEnrollmentHistoryModal] = useState(false);
    const [activeTab, setActiveTab] = useState('requirements');
    const [histSyFilter, setHistSyFilter] = useState<string>('all');

    // Unique school years from enrollment history + current student school year
    const historySchoolYears = useMemo(() => {
        const set = new Set<string>();
        if (student.school_year) set.add(student.school_year);
        enrollmentHistories.forEach(eh => { if (eh.school_year) set.add(eh.school_year); });
        return Array.from(set).sort().reverse();
    }, [student.school_year, enrollmentHistories]);

    // Filter action logs by selected school year (Aug [start] – Jul [end])
    const filteredActionLogs = useMemo(() => {
        if (histSyFilter === 'all') return actionLogs;
        const [startStr, endStr] = histSyFilter.split('-');
        const startYear = parseInt(startStr);
        const endYear = parseInt(endStr);
        const from = new Date(`${startYear}-08-01T00:00:00`);
        const to = new Date(`${endYear}-07-31T23:59:59`);
        return actionLogs.filter(log => {
            const d = new Date(log.created_at);
            return d >= from && d <= to;
        });
    }, [actionLogs, histSyFilter]);

    // Notes dialog state
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [pendingRequirementUpdate, setPendingRequirementUpdate] = useState<{id: number; status: string} | null>(null);
    const [notes, setNotes] = useState('');
    


    const fullName = `${student.first_name}${student.middle_name ? ' ' + student.middle_name : ''} ${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`;
    const initials = `${student.first_name[0]}${student.last_name[0]}`;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to archive ${fullName}?`)) {
            router.delete(destroyStudent.url({ student: student.id }), {
                onSuccess: () => {
                    toast.success('Student archived successfully');
                    router.visit(studentsIndex.url());
                },
                onError: () => {
                    toast.error('Failed to archive student');
                },
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleRequirementToggle = (studentRequirementId: number, currentStatus: string) => {
        // Toggle between pending and approved
        const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
        setPendingRequirementUpdate({ id: studentRequirementId, status: newStatus });
        setNotes('');
        setShowNotesDialog(true);
    };

    const confirmRequirementUpdate = () => {
        if (!pendingRequirementUpdate) return;
        
        router.put(`/registrar/student-requirements/${pendingRequirementUpdate.id}/status`, {
            status: pendingRequirementUpdate.status,
            notes: notes || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Requirement marked as ${pendingRequirementUpdate.status}`);
                setShowNotesDialog(false);
                setPendingRequirementUpdate(null);
                setNotes('');
            },
            onError: () => {
                toast.error('Failed to update requirement status');
            },
        });
    };



    const handleDropStudent = () => {
        if (window.confirm(`Are you sure you want to drop ${fullName}? This action will change their enrollment status to 'dropped'.`)) {
            router.put(`/registrar/students/${student.id}/drop`, {}, {
                onSuccess: () => {
                    toast.success('Student dropped successfully');
                },
                onError: () => {
                    toast.error('Failed to drop student');
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            submitted: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            overdue: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    // Group requirements by category
    const requirementsByCategory = student.requirements?.reduce((acc, req) => {
        const category = req.requirement.category.name;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(req);
        return acc;
    }, {} as Record<string, StudentRequirement[]>) || {};

    // Calculate clearance progress
    const totalRequirements = student.requirements?.length || 0;
    const completedRequirements = student.requirements?.filter(r => r.status === 'approved').length || 0;
    const clearanceProgress = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    return (
        <RegistrarLayout>
            <Head title={`Student: ${fullName}`} />

            <div className="space-y-6 p-6">
                {/* Header with Back Button and Actions */}
                <div className="flex items-center justify-between">
                    <Button 
                        variant="outline" 
                        onClick={() => router.visit(studentsIndex.url())}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Students
                    </Button>

                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={handleDropStudent}>
                            <UserX className="mr-2 h-4 w-4" />
                            Drop
                        </Button>
                        <Button variant="outline" onClick={() => setShowEditModal(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Information
                        </Button>
                        <Button variant="outline" onClick={() => setShowEnrollmentHistoryModal(true)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Enrollment History
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Details
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive Student
                        </Button>
                    </div>
                </div>

                {/* Student Profile Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={student.student_photo_url || undefined} />
                                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{fullName}</h1>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span>Student No.: {student.lrn}</span>
                                    <span>•</span>
                                    <Badge>{student.student_type}</Badge>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Program</p>
                                        <p className="font-medium">{student.program}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Year & Section</p>
                                        <p className="font-medium">
                                            {student.year_level}{student.section ? ` - ${student.section}` : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">School Year</p>
                                        <p className="font-medium">{student.school_year}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="requirements">Submitted Requirements</TabsTrigger>
                        <TabsTrigger value="information">Student Information</TabsTrigger>
                        <TabsTrigger value="schedules">Schedules & Grades</TabsTrigger>
                        <TabsTrigger value="history">Transaction History</TabsTrigger>
                    </TabsList>

                    {/* Requirements Tab */}
                    <TabsContent value="requirements" className="space-y-6">
                        {/* Enrollment Clearance Progress Component */}
                        <EnrollmentClearanceProgress 
                            studentId={student.id}
                            clearance={enrollmentClearance}
                            student={student}
                        />
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Submitted Requirements</CardTitle>
                                <CardDescription>
                                    {completedRequirements} of {totalRequirements} requirements completed
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {student.requirements && student.requirements.length > 0 ? (
                                        student.requirements.map((req) => (
                                            <div 
                                                key={req.id} 
                                                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={`req-${req.id}`}
                                                    checked={req.status === 'approved'}
                                                    onCheckedChange={() => handleRequirementToggle(req.id, req.status)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <label
                                                        htmlFor={`req-${req.id}`}
                                                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {req.requirement.name}
                                                    </label>
                                                    {req.requirement.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {req.requirement.description}
                                                        </p>
                                                    )}
                                                    {req.approved_at && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Approved: {new Date(req.approved_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge className={getStatusBadge(req.status)}>
                                                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No requirements assigned yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Update History Section */}
                        <UpdateHistory logs={actionLogs} />
                    </TabsContent>

                    {/* Student Information Tab - Consolidated */}
                    <TabsContent value="information" className="space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-6">
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Student No.</dt>
                                        <dd className="mt-1 font-mono">{student.lrn || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                                        <dd className="mt-1">{new Date(student.date_of_birth).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                                        <dd className="mt-1 capitalize">{student.gender}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Religion</dt>
                                        <dd className="mt-1">{student.religion}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                        <dd className="mt-1">{student.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                                        <dd className="mt-1">{student.phone}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Enrollment Status</dt>
                                        <dd className="mt-1">
                                            <Badge>{student.enrollment_status}</Badge>
                                        </dd>
                                    </div>
                                    {student.remarks && (
                                        <div className="col-span-2">
                                            <dt className="text-sm font-medium text-muted-foreground">Remarks</dt>
                                            <dd className="mt-1">{student.remarks}</dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Address Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <dt className="text-sm font-medium text-muted-foreground">Complete Address</dt>
                                        <dd className="mt-1">{student.complete_address}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">City/Municipality</dt>
                                        <dd className="mt-1">{student.city_municipality}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Zip Code</dt>
                                        <dd className="mt-1">{student.zip_code}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Guardian Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guardian Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-6">
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Guardian Name</dt>
                                        <dd className="mt-1">{student.guardian_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Relationship</dt>
                                        <dd className="mt-1 capitalize">{student.guardian_relationship}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Contact Number</dt>
                                        <dd className="mt-1">{student.guardian_contact}</dd>
                                    </div>
                                    {student.guardian_email && (
                                        <div>
                                            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                            <dd className="mt-1">{student.guardian_email}</dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Schedules & Grades Tab */}
                    <TabsContent value="schedules" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Schedules & Grades
                                </CardTitle>
                                <CardDescription>
                                    View student's class schedules and academic records
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center py-12 text-muted-foreground">
                                    <div className="text-center">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No schedules or grades available yet.</p>
                                        <p className="text-sm mt-1">This feature will be available once the student is officially enrolled.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transaction History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Transaction History</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">School Year:</span>
                                <Select value={histSyFilter} onValueChange={setHistSyFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All School Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All School Years</SelectItem>
                                        {historySchoolYears.map(sy => (
                                            <SelectItem key={sy} value={sy}>{sy}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <UpdateHistory logs={filteredActionLogs} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <StudentFormModal
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    student={student}
                    mode="edit"
                    departments={departments}
                    programs={programs}
                    yearLevels={yearLevels}
                    sections={sections}
                />
            )}

            {/* Enrollment History Modal */}
            <EnrollmentHistoryModal 
                open={showEnrollmentHistoryModal}
                onClose={() => setShowEnrollmentHistoryModal(false)}
                studentName={fullName}
                enrollmentHistory={enrollmentHistories}
            />

            {/* Notes Dialog for Requirement Update */}
            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Requirement Status</DialogTitle>
                        <DialogDescription>
                            Optionally add notes for this status change. This will be recorded in the update history.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter any notes about this update..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmRequirementUpdate}>
                            {pendingRequirementUpdate?.status === 'approved' ? 'Approve' : 'Mark Pending'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </RegistrarLayout>
    );
}
