import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, FileDown, Mail, TestTube, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { RegistrarMessages } from '@/components/registrar/registrar-messages';

interface Requirement {
    id: number;
    name: string;
    applies_to_new_enrollee: boolean;
    applies_to_transferee: boolean;
    applies_to_returning: boolean;
}

interface StudentRequirement {
    id: number;
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'overdue';
    requirement: Requirement;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    student_type: string;
    program: string;
    student_photo_url: string | null;
    requirements: StudentRequirement[];
}

interface Props {
    students: {
        data: Student[];
        current_page: number;
        per_page: number;
        total: number;
    };
    requirements: Requirement[];
    programs: string[];
    filters: {
        type: string;
        search?: string;
        status?: string;
        program?: string;
    };
}

export default function RequirementsTracking({ students, requirements, programs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedProgram, setSelectedProgram] = useState(filters.program || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/registrar/requirements', {
            type: selectedType,
            search,
            status: selectedStatus,
            program: selectedProgram,
        }, { preserveState: true });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        router.get('/registrar/requirements', {
            type,
            search,
            status: selectedStatus,
            program: selectedProgram,
        }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        router.get('/registrar/requirements', {
            type: selectedType,
            search,
            status,
            program: selectedProgram,
        }, { preserveState: true, replace: true });
    };

    const handleProgramChange = (program: string) => {
        setSelectedProgram(program);
        router.get('/registrar/requirements', {
            type: selectedType,
            search,
            status: selectedStatus,
            program,
        }, { preserveState: true, replace: true });
    };

    const handleExport = () => {
        window.location.href = `/registrar/requirements/export?type=${selectedType}&search=${search}&status=${selectedStatus}&program=${selectedProgram}`;
    };

    const handleTestReminder = () => {
        router.post('/registrar/requirements/test-reminder', {}, {
            preserveState: true,
            onSuccess: () => {
                // Success message will be shown by flash message
            },
        });
    };

    const handleSendReminders = () => {
        if (window.confirm('Send reminder emails to all students with incomplete requirements?')) {
            router.post(`/registrar/requirements/send-reminders?type=${selectedType}&search=${search}&status=${selectedStatus}&program=${selectedProgram}`, {}, {
                preserveState: true,
                onSuccess: () => {
                    // Success message will be shown by flash message
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>,
            submitted: <Badge className="bg-blue-100 text-blue-800 text-xs">Submitted</Badge>,
            approved: <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>,
            rejected: <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>,
            overdue: <Badge className="bg-red-100 text-red-800 text-xs">Overdue</Badge>,
        };
        return badges[status as keyof typeof badges] || null;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            transferee: 'bg-purple-100 text-purple-800',
            returning: 'bg-green-100 text-green-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getApplicabilityBadge = (req: Requirement) => {
        const applies = [];
        if (req.applies_to_new_enrollee) applies.push('new');
        if (req.applies_to_transferee) applies.push('transferee');
        if (req.applies_to_returning) applies.push('returning');
        
        if (applies.length === 3) {
            return <Badge variant="outline" className="text-xs">both</Badge>;
        }
        return applies.map(type => (
            <Badge key={type} variant="outline" className="text-xs ml-1">
                {type}
            </Badge>
        ));
    };

    const calculateCompletionStatus = (studentRequirements: StudentRequirement[]) => {
        const total = studentRequirements.length;
        if (total === 0) return { status: 'N/A', percentage: 0 };
        
        const completed = studentRequirements.filter(r => r.status === 'approved').length;
        const percentage = Math.round((completed / total) * 100);
        
        if (percentage === 100) return { status: 'Complete', percentage, class: 'bg-green-100 text-green-800' };
        if (percentage >= 75) return { status: `${percentage}%`, percentage, class: 'bg-yellow-100 text-yellow-800' };
        if (percentage >= 50) return { status: `${percentage}%`, percentage, class: 'bg-orange-100 text-orange-800' };
        return { status: `${percentage}%`, percentage, class: 'bg-red-100 text-red-800' };
    };

    return (
        <RegistrarLayout>
            <Head title="Requirements Tracking" />
            <RegistrarMessages />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Requirements Tracking</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor student requirement submissions and completion status
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export to Excel
                        </Button>
                        {/* <Button variant="outline" onClick={handleTestReminder}>
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Reminder
                        </Button> */}
                        <Button onClick={handleSendReminders}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Reminders
                        </Button>
                    </div>
                </div>

                {/* Student Type Tabs */}
                <Tabs value={selectedType} onValueChange={handleTypeChange}>
                    <TabsList>
                        <TabsTrigger value="all">All Students</TabsTrigger>
                        <TabsTrigger value="new">New Enrollees</TabsTrigger>
                        <TabsTrigger value="transferee">Transferees</TabsTrigger>
                        <TabsTrigger value="returning">Returning</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by last name, first name, or student ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                    <Select value={selectedStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="incomplete">Incomplete</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedProgram} onValueChange={handleProgramChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Programs" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Programs</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Students Table */}
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Requirements</TableHead>
                                <TableHead>Overall Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.map((student) => {
                                const { status, percentage, class: badgeClass } = calculateCompletionStatus(student.requirements);
                                const initials = `${student.first_name[0]}${student.last_name[0]}`;
                                
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={student.student_photo_url || undefined} />
                                                    <AvatarFallback>{initials}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{`${student.first_name} ${student.last_name}`}</div>
                                                    <div className="text-sm text-muted-foreground">{student.student_number}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getTypeColor(student.student_type.toLowerCase())}>
                                                {student.student_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                {requirements.map((req) => {
                                                    const studentReq = student.requirements.find(
                                                        sr => sr.requirement.id === req.id
                                                    );
                                                    const isCompleted = studentReq?.status === 'approved';
                                                    
                                                    return (
                                                        <div key={req.id} className="flex items-center gap-2 text-sm">
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                            ) : (
                                                                <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                                            )}
                                                            <span className={isCompleted ? 'text-foreground' : 'text-muted-foreground'}>
                                                                {req.name}
                                                            </span>
                                                            {getApplicabilityBadge(req)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={badgeClass}>
                                                {status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="link" 
                                                onClick={() => router.visit(`/registrar/students/${student.id}`)}
                                            >
                                                Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </RegistrarLayout>
    );
}
