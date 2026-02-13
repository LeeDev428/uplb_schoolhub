import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Props {
    open: boolean;
    onClose: () => void;
    studentName: string;
    enrollmentHistory: EnrollmentHistory[];
}

const getStatusBadgeColor = (status: string) => {
    switch (status) {
        case 'officially_enrolled':
            return 'bg-green-100 text-green-700';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700';
        case 'dropped':
            return 'bg-red-100 text-red-700';
        case 'graduated':
            return 'bg-blue-100 text-blue-700';
        case 'transferred':
            return 'bg-purple-100 text-purple-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const formatStatus = (status: string) => {
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export function EnrollmentHistoryModal({ open, onClose, studentName, enrollmentHistory }: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div>
                        <DialogTitle className="text-xl">Enrollment History</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enrollment History for {studentName}
                        </p>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto py-4">
                    {enrollmentHistory.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            No enrollment history found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">School Year</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Date Enrolled</TableHead>
                                    <TableHead className="font-semibold">Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollmentHistory.map((history) => (
                                    <TableRow key={history.id}>
                                        <TableCell className="font-medium">
                                            {history.school_year}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(getStatusBadgeColor(history.status))}>
                                                {formatStatus(history.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {history.enrolled_at 
                                                ? new Date(history.enrolled_at).toLocaleString('en-US', {
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <span className="border-l-4 border-blue-400 pl-2 italic text-sm text-muted-foreground">
                                                {history.remarks || '-'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <div className="flex justify-end border-t pt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
