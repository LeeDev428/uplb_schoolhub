import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, FileDown, Mail, TestTube } from 'lucide-react';
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

interface Requirement {
    id: number;
    name: string;
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
    lrn: string;
    student_type: string;
    student_photo_url: string | null;
    requirements: StudentRequirement[];
}

interface Filters {
    type: string;
    search: string | null;
    status: string | null;
    program: string | null;
}

interface Props {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
    };
    requirements: Requirement[];
    filters: Filters;
}

export default function RequirementsTracking({ students, requirements, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedProgram, setSelectedProgram] = useState(filters.program || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/registrar/requirements/tracking', {
            type: selectedType,
            search,
            status: selectedStatus,
            program: selectedProgram,
        }, { preserveState: true });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        router.get('/registrar/requirements/tracking', {
            type,
            search,
            status: selectedStatus,
            program: selectedProgram,
        }, { preserveState: true, replace: true });
    };

    const handleExport = () => {
        window.location.href = `/registrar/requirements/tracking/export?type=${selectedType}&search=${search}&status=${selectedStatus}&program=${selectedProgram}`;
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>,
            submitted: <Badge className="bg-blue-100 text-blue-800 text-xs">Submitted</Badge>,
            approved: <Badge className="bg-green-100 text-green-800 text-xs">Complete</Badge>,
            rejected: <Badge className="bg-red-100 text-red-800 text-xs">Rejected</Badge>,
            overdue: <Badge className="bg-red-100 text-red-800 text-xs">Overdue</Badge>,
        };
        return badges[status as keyof typeof badges] || <Badge variant="outline" className="text-xs">{status}</Badge>;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            transferee: 'bg-purple-100 text-purple-800',
            returning: 'bg-green-100 text-green-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Requirements Tracking</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor student requirement submissions and completion status
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="default" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button variant="outline">
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Reminder
                        </Button>
                        <Button variant="default">
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

                {/* Filters */}
                <div className="flex items-center space-x-4">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Programs" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Programs</SelectItem>
                            <SelectItem value="bsit">BS Information Technology</SelectItem>
                            <SelectItem value="bscs">BS Computer Science</SelectItem>
                            <SelectItem value="bsis">BS Information Systems</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Requirements Table */}
                <div className="rounded-md border bg-card">
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
                            {students.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <p className="text-muted-foreground">No students found matching your criteria.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.data.map((student) => {
                                    const completion = calculateCompletionStatus(student.requirements);
                                    const fullName = `${student.first_name} ${student.last_name}`;
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
                                                        <div className="font-medium">{fullName}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {student.student_number || student.lrn}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(student.student_type)}>
                                                    {student.student_type === 'new' ? 'New' : 
                                                     student.student_type === 'transferee' ? 'Transferee' : 'Returning'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {student.requirements.slice(0, 5).map((req) => (
                                                        <div key={req.id} className="flex items-center space-x-1">
                                                            {getStatusBadge(req.status)}
                                                            <span className="text-xs text-muted-foreground">
                                                                {req.requirement.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {student.requirements.length > 5 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{student.requirements.length - 5} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={completion.class}>
                                                    {completion.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => router.visit(`/registrar/students/${student.id}`)}
                                                >
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {students.current_page} of {students.last_page}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={students.current_page === 1}
                                onClick={() => router.get('/registrar/requirements/tracking', {
                                    ...filters,
                                    page: students.current_page - 1
                                })}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={students.current_page === students.last_page}
                                onClick={() => router.get('/registrar/requirements/tracking', {
                                    ...filters,
                                    page: students.current_page + 1
                                })}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </RegistrarLayout>
    );
}
