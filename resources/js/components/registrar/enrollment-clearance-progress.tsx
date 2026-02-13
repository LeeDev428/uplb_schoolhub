import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnrollmentClearance {
    requirements_complete: boolean;
    requirements_complete_percentage: number;
    registrar_clearance: boolean;
    accounting_clearance: boolean;
    official_enrollment: boolean;
    enrollment_status: string;
}

interface Props {
    studentId: number;
    clearance?: EnrollmentClearance;
}

export function EnrollmentClearanceProgress({ studentId, clearance }: Props) {
    const handleToggleClearance = (clearanceType: string, currentStatus: boolean) => {
        router.put(`/registrar/students/${studentId}/clearance`, {
            clearance_type: clearanceType,
            status: !currentStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${clearanceType.replace('_', ' ')} ${!currentStatus ? 'marked as complete' : 'unmarked'}`);
            },
            onError: () => {
                toast.error('Failed to update clearance status');
            },
        });
    };

    const clearanceSteps = [
        {
            id: 1,
            title: 'Requirements Complete',
            description: clearance ? 
                (clearance.requirements_complete ? 'Completed' : `${clearance.requirements_complete_percentage}% Complete`) : 
                'Pending',
            completed: clearance?.requirements_complete || false,
            percentage: clearance?.requirements_complete_percentage || 0,
            color: 'bg-green-500',
            key: 'requirements_complete',
            canToggle: false, // Auto-calculated based on submitted requirements
        },
        {
            id: 2,
            title: 'Registrar Clearance',
            description: clearance?.registrar_clearance ? 'Completed' : 'Pending',
            completed: clearance?.registrar_clearance || false,
            percentage: clearance?.registrar_clearance ? 100 : 0,
            color: 'bg-blue-500',
            key: 'registrar_clearance',
            canToggle: true,
        },
        {
            id: 3,
            title: 'Accounting Clearance',
            description: clearance?.accounting_clearance ? 'Cleared by Accounting' : 'Pending from Accounting',
            completed: clearance?.accounting_clearance || false,
            percentage: clearance?.accounting_clearance ? 100 : 0,
            color: 'bg-orange-500',
            key: 'accounting_clearance',
            canToggle: false, // Only accounting department can toggle this
        },
        {
            id: 4,
            title: 'Official Enrollment',
            description: clearance?.official_enrollment ? 'Completed' : 'Pending',
            completed: clearance?.official_enrollment || false,
            percentage: clearance?.official_enrollment ? 100 : 0,
            color: 'bg-purple-500',
            key: 'official_enrollment',
            canToggle: true,
        },
    ];

    const overallProgress = clearanceSteps.filter(step => step.completed).length;
    const overallPercentage = (overallProgress / clearanceSteps.length) * 100;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Enrollment Clearance Progress</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track student progress through enrollment clearance steps
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                        {Math.round(overallPercentage)}% Complete
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {clearanceSteps.map((step, index) => (
                    <div 
                        key={step.id} 
                        className={cn(
                            "relative p-4 rounded-lg border-l-4 transition-all",
                            step.completed ? "bg-green-50 border-green-500" : "bg-gray-50 border-gray-300"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                                {/* Step Number/Icon */}
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full",
                                    step.completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                                )}>
                                    {step.completed ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-bold">{step.id}</span>
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{step.title}</h3>
                                    <p className={cn(
                                        "text-sm italic",
                                        step.completed ? "text-green-700" : "text-gray-600"
                                    )}>
                                        {step.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={cn("h-full transition-all duration-500", step.color)}
                                            style={{ width: `${step.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Percentage */}
                                <div className="text-right">
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        step.completed ? "text-green-600" : "text-gray-500"
                                    )}>
                                        {step.percentage}%
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Button */}
                            {step.canToggle && (
                                <Button
                                    variant={step.completed ? "outline" : "default"}
                                    size="sm"
                                    className="ml-4"
                                    onClick={() => handleToggleClearance(step.key, step.completed)}
                                >
                                    {step.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
