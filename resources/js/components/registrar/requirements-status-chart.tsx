import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

interface RequirementsStatusProps {
    status: {
        complete: number;
        pending: number;
        overdue: number;
    };
}

export function RequirementsStatus({ status }: RequirementsStatusProps) {
    const total = status.complete + status.pending + status.overdue;
    
    const percentages = useMemo(() => ({
        complete: total > 0 ? (status.complete / total) * 100 : 0,
        pending: total > 0 ? (status.pending / total) * 100 : 0,
        overdue: total > 0 ? (status.overdue / total) * 100 : 0,
    }), [status, total]);

    // Calculate stroke dash arrays for the donut chart
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    
    const completeArc = (percentages.complete / 100) * circumference;
    const pendingArc = (percentages.pending / 100) * circumference;
    const overdueArc = (percentages.overdue / 100) * circumference;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Requirements Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="relative w-64 h-64">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
                        {/* Background circle */}
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="40"
                        />
                        
                        {/* Complete segment (green) */}
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="40"
                            strokeDasharray={`${completeArc} ${circumference}`}
                            strokeDashoffset="0"
                        />
                        
                        {/* Pending segment (yellow) */}
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            fill="none"
                            stroke="#eab308"
                            strokeWidth="40"
                            strokeDasharray={`${pendingArc} ${circumference}`}
                            strokeDashoffset={-completeArc}
                        />
                        
                        {/* Overdue segment (red) */}
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="40"
                            strokeDasharray={`${overdueArc} ${circumference}`}
                            strokeDashoffset={-(completeArc + pendingArc)}
                        />
                    </svg>
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Complete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">Overdue</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
