import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, FileText, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StudentLayout from '@/layouts/student/student-layout';

interface Props {
    student: {
        first_name: string;
        last_name: string;
        enrollment_status: string;
    };
    message: string;
}

export default function NotEnrolled({ student, message }: Props) {
    return (
        <StudentLayout>
            <Head title="Access Restricted" />

            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
                <Card className="max-w-lg w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Access Restricted</CardTitle>
                        <CardDescription>
                            This page is only available to officially enrolled students
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Not Enrolled</AlertTitle>
                            <AlertDescription>
                                {message}
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Your current status is:
                            </p>
                            <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium uppercase text-sm">
                                {student.enrollment_status.replace(/-/g, ' ')}
                            </span>
                        </div>

                        <div className="text-sm text-muted-foreground text-center">
                            <p>To access this page, you need to:</p>
                            <ul className="list-disc list-inside mt-2 text-left space-y-1">
                                <li>Complete all required documents</li>
                                <li>Get clearance from the Registrar</li>
                                <li>Settle your tuition fees or promissory note</li>
                                <li>Get clearance from Accounting</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/student/dashboard">
                                <Button variant="default" className="w-full sm:w-auto">
                                    <Home className="h-4 w-4 mr-2" />
                                    Go to Dashboard
                                </Button>
                            </Link>
                            <Link href="/student/requirements">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Requirements
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
