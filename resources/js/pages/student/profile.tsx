import { Head } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Calendar, Users, BookOpen, GraduationCap, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/layouts/student/student-layout';

type Props = {
    student: {
        id: number;
        student_id: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        full_name: string;
        date_of_birth: string | null;
        gender: string | null;
        contact_number: string | null;
        email: string | null;
        address: string | null;
        enrollment_status: string;
        lrn: string | null;
        department: string | null;
        program: string | null;
        year_level: string | null;
        section: string | null;
        guardian_name: string | null;
        guardian_relationship: string | null;
        guardian_contact: string | null;
        guardian_address: string | null;
        created_at: string;
    };
    user: {
        username: string | null;
        email: string;
    };
};

const statusColors = {
    enrolled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    dropped: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    graduated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export default function Profile({ student, user }: Props) {
    return (
        <StudentLayout>
            <Head title="My Profile" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">
                        View your personal information and enrollment details
                    </p>
                </div>

                {/* Profile Header Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
                                    <User className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{student.full_name}</CardTitle>
                                    <CardDescription>Student ID: {student.student_id}</CardDescription>
                                </div>
                            </div>
                            <Badge
                                className={`w-fit ${statusColors[student.enrollment_status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                            >
                                {student.enrollment_status.charAt(0).toUpperCase() + student.enrollment_status.slice(1)}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-base">{student.full_name}</p>
                                </div>

                                {student.date_of_birth && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-base">{student.date_of_birth}</p>
                                        </div>
                                    </div>
                                )}

                                {student.gender && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                        <p className="text-base">
                                            {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                                        </p>
                                    </div>
                                )}

                                {student.lrn && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">LRN</p>
                                        <p className="text-base">{student.lrn}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Enrolled Since</p>
                                    <p className="text-base">{student.created_at}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {student.email && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-base">{student.email}</p>
                                        </div>
                                    </div>
                                )}

                                {student.contact_number && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-base">{student.contact_number}</p>
                                        </div>
                                    </div>
                                )}

                                {student.address && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <p className="text-base">{student.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Academic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {student.department && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Department</p>
                                        <p className="text-base">{student.department}</p>
                                    </div>
                                )}

                                {student.program && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Program</p>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-base">{student.program}</p>
                                        </div>
                                    </div>
                                )}

                                {student.year_level && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Year Level</p>
                                        <p className="text-base">{student.year_level}</p>
                                    </div>
                                )}

                                {student.section && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Section</p>
                                        <p className="text-base">{student.section}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guardian Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Guardian Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                {student.guardian_name && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Guardian Name</p>
                                        <p className="text-base">{student.guardian_name}</p>
                                    </div>
                                )}

                                {student.guardian_relationship && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                                        <p className="text-base">{student.guardian_relationship}</p>
                                    </div>
                                )}

                                {student.guardian_contact && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-base">{student.guardian_contact}</p>
                                        </div>
                                    </div>
                                )}

                                {student.guardian_address && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Guardian Address</p>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <p className="text-base">{student.guardian_address}</p>
                                        </div>
                                    </div>
                                )}

                                {!student.guardian_name && !student.guardian_relationship && (
                                    <div className="py-4 text-center">
                                        <p className="text-sm text-muted-foreground">No guardian information available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {user.username && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Username</p>
                                        <p className="text-base font-mono">{user.username}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Account Email</p>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-base">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentLayout>
    );
}
