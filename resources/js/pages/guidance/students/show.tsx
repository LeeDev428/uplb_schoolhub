import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GuidanceLayout from '@/layouts/guidance/guidance-layout';
import { ArrowLeft, Calendar, User, AlertTriangle } from 'lucide-react';

interface GuidanceRecord {
    id: number;
    title: string;
    record_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    description: string | null;
    action_taken: string | null;
    recommendations: string | null;
    incident_date: string | null;
    follow_up_date: string | null;
    is_confidential: boolean;
    created_at: string;
    counselor: { name: string } | null;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    lrn: string | null;
    enrollment_status: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    department: { name: string } | null;
    section: {
        name: string;
        year_level: { name: string } | null;
    } | null;
    guidance_records: GuidanceRecord[];
}

interface Props {
    student: Student;
}

const SEVERITY_COLORS: Record<string, string> = {
    low:      'bg-blue-100 text-blue-700 border-blue-200',
    medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    high:     'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_COLORS: Record<string, string> = {
    open:        'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    resolved:    'bg-gray-100 text-gray-600',
    closed:      'bg-gray-200 text-gray-500',
};

function formatDate(d: string | null) {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GuidanceStudentShow({ student }: Props) {
    const records = student.guidance_records ?? [];

    return (
        <GuidanceLayout>
            <Head title={`${student.last_name}, ${student.first_name} — Guidance`} />
            <div className="space-y-6 p-6">
                {/* Back */}
                <Link href="/guidance/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Students
                </Link>

                {/* Student Header */}
                <Card>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{student.last_name}, {student.first_name}</h1>
                            {student.lrn && <p className="text-sm text-muted-foreground">LRN: {student.lrn}</p>}
                            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                                {student.department && <span>{student.department.name}</span>}
                                {student.section && (
                                    <>
                                        <span>·</span>
                                        <span>
                                            {student.section.year_level?.name}
                                            {student.section.name ? ` — ${student.section.name}` : ''}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                student.enrollment_status === 'enrolled'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {student.enrollment_status.replace(/_/g, ' ')}
                            </span>
                            {records.length > 0 && (
                                <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-medium flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {records.length} Record{records.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact info */}
                {(student.email || student.phone || student.address) && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
                            {student.email && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p>{student.email}</p>
                                </div>
                            )}
                            {student.phone && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p>{student.phone}</p>
                                </div>
                            )}
                            {student.address && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Address</p>
                                    <p>{student.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Guidance Records */}
                <div>
                    <h2 className="text-lg font-semibold mb-3">Guidance Records</h2>
                    {records.length === 0 ? (
                        <Card>
                            <CardContent className="py-10 text-center text-muted-foreground text-sm">
                                No guidance records for this student.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {records.map(record => (
                                <Card key={record.id} className={record.is_confidential ? 'border-orange-200' : ''}>
                                    <CardHeader className="pb-2 pt-4">
                                        <div className="flex flex-wrap items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{record.title}</p>
                                                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                                    {record.record_type.replace(/_/g, ' ')}
                                                    {record.is_confidential && <span className="ml-1 text-orange-600 font-medium">· Confidential</span>}
                                                </p>
                                            </div>
                                            <div className="flex gap-1.5 flex-wrap">
                                                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${SEVERITY_COLORS[record.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {record.severity}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[record.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {record.status.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {record.description && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                                                <p className="text-sm whitespace-pre-line">{record.description}</p>
                                            </div>
                                        )}
                                        {record.action_taken && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Action Taken</p>
                                                <p className="text-sm whitespace-pre-line">{record.action_taken}</p>
                                            </div>
                                        )}
                                        {record.recommendations && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Recommendations</p>
                                                <p className="text-sm whitespace-pre-line">{record.recommendations}</p>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1 border-t">
                                            {record.incident_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Incident: {formatDate(record.incident_date)}
                                                </span>
                                            )}
                                            {record.follow_up_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Follow-up: {formatDate(record.follow_up_date)}
                                                </span>
                                            )}
                                            {record.counselor && (
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {record.counselor.name}
                                                </span>
                                            )}
                                            <span>Added: {formatDate(record.created_at)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GuidanceLayout>
    );
}
