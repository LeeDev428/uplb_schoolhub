import { Head, useForm, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    Info,
    Plus,
    XCircle,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import StudentLayout from '@/layouts/student/student-layout';

type DropRequestType = {
    id: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    semester: string | null;
    school_year: string | null;
    registrar_notes: string | null;
    processed_by: string | null;
    processed_at: string | null;
    created_at: string;
};

type Props = {
    requests: DropRequestType[];
    hasPendingRequest: boolean;
    hasApprovedRequest: boolean;
    isDropped: boolean;
    currentSchoolYear: string;
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'approved':
            return (
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                </Badge>
            );
        case 'rejected':
            return (
                <Badge className="bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="h-3 w-3 mr-1" /> Rejected
                </Badge>
            );
        default:
            return (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>
            );
    }
};

export default function DropRequestIndex({
    requests,
    hasPendingRequest,
    hasApprovedRequest,
    isDropped,
    currentSchoolYear,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        reason: '',
        semester: '',
        school_year: currentSchoolYear,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/student/drop-request', {
            onSuccess: () => {
                setIsOpen(false);
                form.reset();
            },
        });
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this drop request?')) {
            router.delete(`/student/drop-request/${id}`);
        }
    };

    const pending = requests.filter((r) => r.status === 'pending').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;

    return (
        <StudentLayout>
            <Head title="Drop Request" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Drop Request</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Request to drop from your current enrollment.
                        </p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={hasPendingRequest || isDropped}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Drop Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Submit Drop Request</DialogTitle>
                                    <DialogDescription>
                                        Please provide a reason for your drop request. The registrar will review and process it.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Important Notice</AlertTitle>
                                        <AlertDescription>
                                            Dropping from enrollment is a serious decision:
                                            <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                                                <li>Your account will be deactivated once approved</li>
                                                <li>You will not be able to log in until reactivated by the registrar</li>
                                                <li>You may request a refund after your drop is approved</li>
                                                <li>This action may affect your academic standing</li>
                                            </ul>
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-2">
                                        <Label htmlFor="school_year">School Year</Label>
                                        <Input
                                            id="school_year"
                                            value={form.data.school_year}
                                            onChange={(e) => form.setData('school_year', e.target.value)}
                                            placeholder="2024-2025"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester (Optional)</Label>
                                        <Input
                                            id="semester"
                                            value={form.data.semester}
                                            onChange={(e) => form.setData('semester', e.target.value)}
                                            placeholder="1st Semester"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reason">
                                            Reason for Dropping <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            value={form.data.reason}
                                            onChange={(e) => form.setData('reason', e.target.value)}
                                            placeholder="Please explain your reason for dropping (minimum 20 characters)..."
                                            rows={5}
                                            className="resize-none"
                                        />
                                        {form.errors.reason && (
                                            <p className="text-sm text-destructive">{form.errors.reason}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {form.data.reason.length}/2000 characters (min: 20)
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={form.processing || form.data.reason.length < 20}
                                    >
                                        Submit Drop Request
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Warning Banner */}
                <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Before You Drop</AlertTitle>
                    <AlertDescription className="text-amber-700">
                        Dropping from enrollment is a significant decision. Once approved, your account will be
                        deactivated and you will need to visit the registrar's office physically to reactivate it.
                        After your drop is approved, you may then request a refund for any payments made.
                    </AlertDescription>
                </Alert>

                {/* Status Indicators */}
                {isDropped && (
                    <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">You Have Been Dropped</AlertTitle>
                        <AlertDescription className="text-red-700">
                            Your enrollment has been dropped. Please visit the accounting office for any refund concerns.
                        </AlertDescription>
                    </Alert>
                )}

                {hasPendingRequest && !isDropped && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Pending Request</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            You have a pending drop request. Please wait for the registrar to review and process it.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request History</CardTitle>
                        <CardDescription>Your drop request submissions and their status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requests.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No Drop Requests</h3>
                                <p className="text-muted-foreground mt-1">
                                    You haven't submitted any drop requests yet.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>School Year</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Registrar Notes</TableHead>
                                        <TableHead>Processed</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.created_at}</TableCell>
                                            <TableCell>{req.school_year || '—'}</TableCell>
                                            <TableCell>{req.semester || '—'}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={req.reason}>
                                                {req.reason}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={req.status} />
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate" title={req.registrar_notes || ''}>
                                                {req.registrar_notes || '—'}
                                            </TableCell>
                                            <TableCell>
                                                {req.processed_at ? (
                                                    <div className="text-sm">
                                                        <div>{req.processed_at}</div>
                                                        <div className="text-muted-foreground">{req.processed_by}</div>
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleCancel(req.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
