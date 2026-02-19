import { CheckCircle2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router, usePage } from '@inertiajs/react';
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

interface StudentInfo {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    suffix?: string | null;
    lrn?: string;
    student_number?: string;
    program?: string;
    year_level?: string;
    section?: string | null;
    school_year?: string;
    gender?: string;
    date_of_birth?: string;
    complete_address?: string;
    guardian_name?: string;
}

interface Props {
    studentId: number;
    clearance?: EnrollmentClearance;
    student?: StudentInfo;
}

export function EnrollmentClearanceProgress({ studentId, clearance, student }: Props) {
    const { props } = usePage<{ appSettings?: { app_name?: string } }>();
    const appName = props.appSettings?.app_name || 'School Management System';

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

    const handlePrintCoe = () => {
        const studentName = student
            ? `${student.first_name}${student.middle_name ? ' ' + student.middle_name : ''} ${student.last_name}${student.suffix ? ' ' + student.suffix : ''}`
            : 'N/A';
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) return;

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>Certificate of Enrollment</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
        .header h1 { font-size: 16px; font-weight: bold; text-transform: uppercase; }
        .header h2 { font-size: 12px; font-weight: normal; }
        .header h3 { font-size: 14px; font-weight: bold; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin-bottom: 10px; }
        .info-row { display: flex; gap: 6px; padding: 2px 0; border-bottom: 1px solid #ccc; }
        .info-label { font-weight: bold; min-width: 120px; font-size: 10px; }
        .info-value { flex: 1; font-size: 10px; }
        .section-title { font-weight: bold; background: #333; color: #fff; padding: 3px 6px; margin: 8px 0 4px; font-size: 10px; text-transform: uppercase; }
        .clearance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
        .clearance-box { border: 1px solid #000; padding: 6px; text-align: center; }
        .clearance-box .status { font-size: 16px; }
        .clearance-box .label { font-size: 9px; font-weight: bold; text-transform: uppercase; margin-top: 2px; }
        .signature-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
        .sig-box { text-align: center; }
        .sig-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 4px; font-size: 10px; font-weight: bold; }
        .sig-title { font-size: 9px; color: #555; }
        .cert-text { border: 2px solid #000; padding: 10px; margin: 10px 0; text-align: justify; font-size: 10px; line-height: 1.6; }
        .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; opacity: 0.05; color: #000; font-weight: bold; pointer-events: none; }
        @media print { body { padding: 10px; } .watermark { position: fixed; } }
    </style>
</head>
<body>
    <div class="watermark">ENROLLED</div>
    <div class="header">
        <h1>${appName}</h1>
        <h2>Office of the Registrar</h2>
        <h3>Certificate of Enrollment</h3>
        <div style="font-size:10px; margin-top:4px;">Academic Year ${student?.school_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)}</div>
    </div>

    <div class="cert-text">
        This is to certify that <strong>${studentName}</strong>, 
        with Student No. <strong>${student?.student_number || 'N/A'}</strong> and LRN <strong>${student?.lrn || 'N/A'}</strong>, 
        is officially enrolled at <strong>${appName}</strong> for the Academic Year 
        <strong>${student?.school_year || 'N/A'}</strong>, 
        taking up <strong>${student?.program || 'N/A'}</strong>, 
        Year/Grade Level <strong>${student?.year_level || 'N/A'}</strong>${student?.section ? `, Section <strong>${student.section}</strong>` : ''}.
    </div>

    <div class="section-title">Student Information</div>
    <div class="info-grid">
        <div class="info-row"><span class="info-label">Student No.:</span><span class="info-value">${student?.student_number || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">LRN:</span><span class="info-value">${student?.lrn || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Full Name:</span><span class="info-value">${studentName}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth:</span><span class="info-value">${student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-PH') : 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Program/Course:</span><span class="info-value">${student?.program || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Year Level:</span><span class="info-value">${student?.year_level || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Section:</span><span class="info-value">${student?.section || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">School Year:</span><span class="info-value">${student?.school_year || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Sex/Gender:</span><span class="info-value">${student?.gender || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Guardian Name:</span><span class="info-value">${student?.guardian_name || 'N/A'}</span></div>
    </div>

    <div class="section-title">Enrollment Clearance Status</div>
    <div class="clearance-grid">
        <div class="clearance-box">
            <div class="status">${clearance?.requirements_complete ? '✓' : '○'}</div>
            <div class="label">Requirements</div>
        </div>
        <div class="clearance-box">
            <div class="status">${clearance?.registrar_clearance ? '✓' : '○'}</div>
            <div class="label">Registrar Clearance</div>
        </div>
        <div class="clearance-box">
            <div class="status">${clearance?.accounting_clearance ? '✓' : '○'}</div>
            <div class="label">Accounting Clearance</div>
        </div>
        <div class="clearance-box">
            <div class="status">${clearance?.official_enrollment ? '✓' : '○'}</div>
            <div class="label">Official Enrollment</div>
        </div>
    </div>

    <div class="signature-section">
        <div class="sig-box">
            <div class="sig-line">_______________________</div>
            <div class="sig-title">Student's Signature</div>
        </div>
        <div class="sig-box">
            <div class="sig-line">_______________________</div>
            <div class="sig-title">Registrar</div>
        </div>
        <div class="sig-box">
            <div class="sig-line">_______________________</div>
            <div class="sig-title">School Director / Principal</div>
        </div>
    </div>

    <div style="text-align:center; margin-top:14px; font-size:9px; color:#555;">
        Issued on: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;|&nbsp; ${appName} — Office of the Registrar
    </div>

    <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`);
        printWindow.document.close();
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
                                <div className="ml-4 flex flex-col gap-2">
                                    <Button
                                        variant={step.completed ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => handleToggleClearance(step.key, step.completed)}
                                    >
                                        {step.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                    </Button>
                                    {step.id === 4 && step.completed && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                            onClick={handlePrintCoe}
                                        >
                                            <Printer className="h-4 w-4 mr-1" />
                                            Print COE
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
