import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Props {
    logs: ActionLog[];
}

const getActionTypeBadgeColor = (actionType: string) => {
    switch (actionType) {
        case 'requirements_updated':
            return 'bg-blue-100 text-blue-700';
        case 'information_updated':
            return 'bg-purple-100 text-purple-700';
        case 'enrollment_status_changed':
            return 'bg-green-100 text-green-700';
        case 'clearance_updated':
            return 'bg-yellow-100 text-yellow-700';
        case 'grades_updated':
            return 'bg-indigo-100 text-indigo-700';
        case 'schedule_changed':
            return 'bg-pink-100 text-pink-700';
        case 'payment_recorded':
            return 'bg-emerald-100 text-emerald-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const formatActionType = (actionType: string) => {
    return actionType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export function UpdateHistory({ logs }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    Update History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        No update history found.
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold w-[180px]">Date</TableHead>
                                    <TableHead className="font-semibold w-[160px]">Type</TableHead>
                                    <TableHead className="font-semibold">Action</TableHead>
                                    <TableHead className="font-semibold">Notes</TableHead>
                                    <TableHead className="font-semibold w-[150px]">Updated By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(getActionTypeBadgeColor(log.action_type))}>
                                                {formatActionType(log.action_type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{log.action}</div>
                                            {log.details && (
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {log.details}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {log.notes ? (
                                                <p className="text-sm italic text-muted-foreground border-l-2 border-blue-400 pl-2">
                                                    {log.notes}
                                                </p>
                                            ) : (
                                                <span className="text-muted-foreground/50">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {log.performer?.name || 'System'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
