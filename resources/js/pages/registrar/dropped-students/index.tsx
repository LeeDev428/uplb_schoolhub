import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Search,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import RegistrarLayout from '@/layouts/registrar/registrar-layout';
import { PageHeader } from '@/components/page-header';

type DropRequestInfo = {
    id: number;
    reason: string;
    semester: string | null;
    school_year: string | null;
    registrar_approved_at: string | null;
    accounting_approved_at: string | null;
    registrar_approved_by: string | null;
    accounting_approved_by: string | null;
};

type Student = {
    id: number;
    full_name: string;
    lrn: string;
    email: string;
    program: string | null;
    year_level: string | null;
    section: string | null;
    student_photo_url: string | null;
    enrollment_status: string;
    classification: string | null;
    drop_request: DropRequestInfo | null;
};

type PaginatedStudents = {
    data: Student[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    students: PaginatedStudents;
    totalDropped: number;
    filters: {
        search?: string;
        program?: string;
        year_level?: string;
    };
};

export default function DroppedStudents({ students, totalDropped, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(
            '/registrar/dropped-students',
            { search },
            { preserveState: true, replace: true }
        );
    };

    const handleReactivate = (student: Student) => {
        if (!confirm(`Reactivate ${student.full_name}? They will be able to log in and enroll again.`)) return;
        router.post(`/registrar/students/${student.id}/reactivate`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <RegistrarLayout>
            <Head title="Dropped Students" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Dropped Students"
                    description="Students who have been officially dropped after completing the full approval flow"
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Dropped</CardTitle>
                            <UserX className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{totalDropped}</div>
                            <p className="text-xs text-muted-foreground">Officially dropped students</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5" />
                            Dropped Students List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by student name or LRN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleSearch}>Search</Button>
                        </div>

                        {students.data.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No dropped students found.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Program</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Approved By</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.data.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={student.student_photo_url ?? undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {student.full_name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{student.full_name}</p>
                                                        <p className="text-xs text-muted-foreground">{student.lrn}</p>
                                                        <p className="text-xs text-muted-foreground">{student.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{student.program}</p>
                                                    <p className="text-muted-foreground">{student.year_level} {student.section}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.drop_request ? (
                                                    <p className="text-sm max-w-[180px] truncate" title={student.drop_request.reason}>
                                                        {student.drop_request.reason}
                                                    </p>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {student.drop_request ? (
                                                    <div className="text-sm">
                                                        <p>{student.drop_request.semester}</p>
                                                        <p className="text-muted-foreground">{student.drop_request.school_year}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {student.drop_request ? (
                                                    <div className="text-xs space-y-1">
                                                        <div>
                                                            <span className="text-muted-foreground">Registrar: </span>
                                                            <span>{student.drop_request.registrar_approved_by ?? '-'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Accounting: </span>
                                                            <span>{student.drop_request.accounting_approved_by ?? '-'}</span>
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {student.drop_request.accounting_approved_at}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800 border border-red-200">
                                                    <UserX className="h-3 w-3 mr-1" />
                                                    Dropped
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() => handleReactivate(student)}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Reactivate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
                        {students.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {students.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </RegistrarLayout>
    );
}
