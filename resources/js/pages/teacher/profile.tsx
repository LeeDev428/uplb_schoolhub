import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Camera,
    Save,
    Trash2,
    User,
    Mail,
    Phone,
    Building2,
    BookOpen,
    Eye,
    EyeOff,
    BadgeCheck,
} from 'lucide-react';
import TeacherLayout from '@/layouts/teacher/teacher-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profile', href: '/teacher/profile' },
];

interface TeacherProfile {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    bio: string | null;
    specialization: string | null;
    department: string | null;
    employee_id: string | null;
    photo_url: string | null;
    show_on_landing: boolean;
}

interface Props {
    teacher: TeacherProfile;
}

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function TeacherProfile({ teacher }: Props) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        first_name:       teacher.first_name ?? '',
        last_name:        teacher.last_name ?? '',
        phone:            teacher.phone ?? '',
        bio:              teacher.bio ?? '',
        specialization:   teacher.specialization ?? '',
        show_on_landing:  teacher.show_on_landing,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(teacher.photo_url);
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/teacher/profile', {
            preserveScroll: true,
            onSuccess: () => toast.success('Profile saved successfully'),
            onError: () => toast.error('Failed to save profile'),
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload immediately
        const formData = new FormData();
        formData.append('photo', file);
        setPhotoUploading(true);
        router.post('/teacher/profile/photo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Photo updated');
                setPhotoUploading(false);
            },
            onError: () => {
                toast.error('Failed to upload photo');
                setPhotoPreview(teacher.photo_url);
                setPhotoUploading(false);
            },
        });
    };

    const handleDeletePhoto = () => {
        if (!photoPreview) return;
        router.delete('/teacher/profile/photo', {
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                toast.success('Photo removed');
            },
        });
    };

    return (
        <TeacherLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />

            <div className="space-y-6 p-6 max-w-3xl">
                <PageHeader
                    title="My Profile"
                    description="Update your personal information and photo"
                />

                {/* ── Photo Section ─────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            Profile Photo
                        </CardTitle>
                        <CardDescription>
                            This photo is shown in faculty listings and on your profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 ring-4 ring-muted">
                                    <AvatarImage src={photoPreview ?? undefined} alt={teacher.full_name} />
                                    <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                        {getInitials(teacher.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                {photoUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => photoInputRef.current?.click()}
                                        disabled={photoUploading}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                    </Button>
                                    {photoPreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={handleDeletePhoto}
                                            disabled={photoUploading}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG, WebP — max 3 MB. Recommended: 400×400 px.
                                </p>
                            </div>

                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ── Info Form ─────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Read-only info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BadgeCheck className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                            <CardDescription>
                                These fields are managed by administration and cannot be edited here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium truncate">{teacher.email || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Employee ID</p>
                                        <p className="text-sm font-medium truncate">{teacher.employee_id || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Department</p>
                                        <p className="text-sm font-medium truncate">{teacher.department || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                    <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Role</p>
                                        <Badge variant="secondary" className="mt-0.5">Teacher</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Editable info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="First name"
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-destructive">{errors.first_name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Last name"
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-destructive">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    <Phone className="mr-1 inline h-3.5 w-3.5" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+63 9XX XXX XXXX"
                                    type="tel"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="specialization">Specialization / Subject Area</Label>
                                <Input
                                    id="specialization"
                                    value={data.specialization}
                                    onChange={(e) => setData('specialization', e.target.value)}
                                    placeholder="e.g., Mathematics, Science, English"
                                />
                                {errors.specialization && (
                                    <p className="text-sm text-destructive">{errors.specialization}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio / About</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Brief description about yourself, your teaching experience, or areas of expertise…"
                                    rows={4}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {data.bio.length}/1000
                                </p>
                                {errors.bio && (
                                    <p className="text-sm text-destructive">{errors.bio}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Landing page visibility */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {data.show_on_landing ? (
                                    <Eye className="h-5 w-5" />
                                ) : (
                                    <EyeOff className="h-5 w-5" />
                                )}
                                Public Visibility
                            </CardTitle>
                            <CardDescription>
                                Control whether your profile card appears in the Faculty section of the public landing page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">Show on landing page</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your name, photo, and specialization will be visible to the public.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.show_on_landing}
                                    onCheckedChange={(val) => setData('show_on_landing', val)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="flex items-center justify-end gap-4">
                        {recentlySuccessful && (
                            <p className="text-sm text-green-600 dark:text-green-400">Saved!</p>
                        )}
                        <Button type="submit" disabled={processing} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving…' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </div>
        </TeacherLayout>
    );
}
