import { Edit, Eye, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Student = {
    id: string;
    lrn: string;
    name: string;
    email: string;
    avatar?: string;
    type: 'new' | 'transferee' | 'returnee';
    program: string;
    yearSection: string;
    requirementsStatus: 'complete' | 'pending' | 'incomplete';
    requirementsPercentage: number;
    enrollmentStatus:
        | 'enrolled'
        | 'pending-accounting'
        | 'pending-registrar'
        | 'not-enrolled';
    remarks?: string;
};

type StudentTableProps = {
    students: Student[];
};

const typeColors = {
    new: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
    transferee:
        'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900',
    returnee:
        'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
};

const requirementsStatusColors = {
    complete:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
    pending:
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900',
    incomplete:
        'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
};

const enrollmentStatusColors = {
    enrolled:
        'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
    'pending-accounting':
        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900',
    'pending-registrar':
        'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
    'not-enrolled':
        'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-950 dark:text-neutral-300 dark:border-neutral-900',
};

export function StudentTable({ students }: StudentTableProps) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="border-b border-neutral-200 bg-neutral-900 px-6 py-4 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                        Student List
                    </h2>
                    <p className="text-sm text-neutral-400">
                        Total: {students.length} students
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student ID/LRN</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Year & Section</TableHead>
                            <TableHead>Requirements Status</TableHead>
                            <TableHead>Enrollment Status</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {student.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            LRN: {student.lrn}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={student.avatar}
                                                alt={student.name}
                                            />
                                            <AvatarFallback>
                                                {student.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'capitalize',
                                            typeColors[student.type],
                                        )}
                                    >
                                        {student.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    <p className="truncate text-sm">
                                        {student.program}
                                    </p>
                                </TableCell>
                                <TableCell>{student.yearSection}</TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'capitalize',
                                                requirementsStatusColors[
                                                    student.requirementsStatus
                                                ],
                                            )}
                                        >
                                            {student.requirementsStatus}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">
                                            {student.requirementsPercentage}%
                                            completed
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'whitespace-nowrap',
                                            enrollmentStatusColors[
                                                student.enrollmentStatus
                                            ],
                                        )}
                                    >
                                        {student.enrollmentStatus ===
                                        'enrolled'
                                            ? 'Officially Enrolled'
                                            : student.enrollmentStatus ===
                                                'pending-accounting'
                                              ? 'Accounting Pending'
                                              : student.enrollmentStatus ===
                                                  'pending-registrar'
                                                ? 'Registrar Pending'
                                                : 'Not Enrolled'}
                                    </Badge>
                                    {student.enrollmentStatus === 'enrolled' && (
                                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                            100% complete
                                        </p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {student.remarks && (
                                        <Badge
                                            variant="outline"
                                            className="capitalize"
                                        >
                                            {student.remarks}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
