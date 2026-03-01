import { Head, router, useForm } from '@inertiajs/react';
import {
    Building2, Calendar, Camera, ChevronDown, ChevronRight,
    GraduationCap, GripVertical, Globe, Image as ImageIcon,
    Layout, MessageSquare, Navigation, Palette, Pencil,
    Plus, Save, Trophy, Trash2, Upload, UserPlus, Users, X,
    Footprints,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import OwnerLayout from '@/layouts/owner/owner-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'App Settings', href: '/owner/app-settings' },
];

interface FeatureItem {
    icon_name: string;
    title: string;
    description: string;
}

const SECTION_ANCHORS = [
    { value: '#home',     label: 'Home (#home)' },
    { value: '#features', label: 'Features (#features)' },
    { value: '#faculty',  label: 'Faculty (#faculty)' },
    { value: '#message',  label: 'Message (#message)' },
    { value: '#alumni',   label: 'Alumni (#alumni)' },
    { value: '#contact',  label: 'Contact (#contact)' },
    { value: '/login',    label: 'Login (/login)' },
    { value: '_custom',   label: 'Custom URL...' },
];

const ICON_NAMES = [
    'Users','TrendingUp','BookOpen','CheckCircle','Shield','GraduationCap',
    'BarChart2','Bell','Briefcase','Calendar','ClipboardList','CreditCard',
    'FileText','Globe','Heart','Home','Key','Layers','LifeBuoy','Lock',
    'Mail','PieChart','Settings','Star','Zap',
];

interface FacultyMember {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    employee_id: string;
    email: string;
    specialization: string | null;
    photo_url: string | null;
    is_active: boolean;
    show_on_landing: boolean;
    employment_status: string;
}

interface DepartmentItem {
    id: number;
    classification: 'K-12' | 'College';
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    teachers: FacultyMember[];
}

interface AlumniItem {
    name: string;
    description: string;
    batch: string;
    photo_url?: string;
    photo_path?: string;
}

interface NavLink {
    label: string;
    href: string;
}

interface AppSettingsData {
    app_name: string;
    school_year: string;
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    favicon_url: string | null;
    has_k12: boolean;
    has_college: boolean;
    // Enrollment period settings
    active_semester: number;
    k12_enrollment_open: boolean;
    k12_enrollment_start: string | null;
    k12_enrollment_end: string | null;
    college_enrollment_open: boolean;
    college_enrollment_start: string | null;
    college_enrollment_end: string | null;
    // Landing page
    hero_title: string | null;
    hero_subtitle: string | null;
    hero_image_urls: string[];
    hero_images: string[];
    faculty_section_title: string | null;
    faculty_section_subtitle: string | null;
    message_title: string | null;
    message_content: string | null;
    message_author: string | null;
    message_author_title: string | null;
    message_author_photo_url: string | null;
    alumni_section_title: string | null;
    alumni_section_subtitle: string | null;
    alumni_items: AlumniItem[];
    footer_tagline: string | null;
    footer_address: string | null;
    footer_phone: string | null;
    footer_email: string | null;
    footer_facebook: string | null;
    nav_links: NavLink[];
    // Features section
    features_section_title: string | null;
    features_section_subtitle: string | null;
    features_show: boolean;
    features_items: FeatureItem[];
}

interface Props {
    settings: AppSettingsData;
    departments: DepartmentItem[];
}

export default function AppSettings({ settings, departments }: Props) {
    // ── General / branding ────────────────────────────────
    const { data, setData, post, processing, errors } = useForm({
        app_name:        settings.app_name || '',
        school_year:     settings.school_year || '2024-2025',
        primary_color:   settings.primary_color || '#2563eb',
        secondary_color: settings.secondary_color || '#64748b',
        logo:    null as File | null,
        favicon: null as File | null,
    });

    const [hasK12, setHasK12]          = useState<boolean>(settings.has_k12);
    const [hasCollege, setHasCollege]  = useState<boolean>(settings.has_college);
    const [academicSaving, setAcademicSaving] = useState(false);

    // Enrollment period state
    const [activeSemester, setActiveSemester] = useState<number>(settings.active_semester || 1);
    const [k12EnrollmentOpen, setK12EnrollmentOpen] = useState<boolean>(settings.k12_enrollment_open);
    const [k12EnrollmentStart, setK12EnrollmentStart] = useState<string>(settings.k12_enrollment_start || '');
    const [k12EnrollmentEnd, setK12EnrollmentEnd] = useState<string>(settings.k12_enrollment_end || '');
    const [collegeEnrollmentOpen, setCollegeEnrollmentOpen] = useState<boolean>(settings.college_enrollment_open);
    const [collegeEnrollmentStart, setCollegeEnrollmentStart] = useState<string>(settings.college_enrollment_start || '');
    const [collegeEnrollmentEnd, setCollegeEnrollmentEnd] = useState<string>(settings.college_enrollment_end || '');
    const [enrollmentSaving, setEnrollmentSaving] = useState(false);

    const handleAcademicToggle = (field: 'has_k12' | 'has_college', value: boolean) => {
        const next = { has_k12: hasK12, has_college: hasCollege, [field]: value };
        if (field === 'has_k12') setHasK12(value); else setHasCollege(value);
        setAcademicSaving(true);
        router.patch('/owner/app-settings/academic-structure', next, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Academic structure saved'); setAcademicSaving(false); },
            onError:   () => { toast.error('Failed to save');              setAcademicSaving(false); },
        });
    };

    const handleEnrollmentPeriodSave = () => {
        setEnrollmentSaving(true);
        router.patch('/owner/app-settings/enrollment-period', {
            active_semester: activeSemester,
            k12_enrollment_open: k12EnrollmentOpen,
            k12_enrollment_start: k12EnrollmentStart || null,
            k12_enrollment_end: k12EnrollmentEnd || null,
            college_enrollment_open: collegeEnrollmentOpen,
            college_enrollment_start: collegeEnrollmentStart || null,
            college_enrollment_end: collegeEnrollmentEnd || null,
        }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Enrollment period settings saved'); setEnrollmentSaving(false); },
            onError:   () => { toast.error('Failed to save enrollment settings'); setEnrollmentSaving(false); },
        });
    };

    const [logoPreview, setLogoPreview]       = useState<string | null>(settings.logo_url);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.favicon_url);

    const handleBrandingFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { if (type === 'logo') setLogoPreview(ev.target?.result as string); else setFaviconPreview(ev.target?.result as string); };
        reader.readAsDataURL(file);
        setData(type, file);
    };

    const handleGeneralSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/owner/app-settings', {
            forceFormData: true,
            onSuccess: () => toast.success('App settings saved'),
            onError:   () => toast.error('Failed to save settings'),
        });
    };

    // ── Landing page ──────────────────────────────────────
    const [heroTitle, setHeroTitle]         = useState(settings.hero_title ?? '');
    const [heroSubtitle, setHeroSubtitle]   = useState(settings.hero_subtitle ?? '');
    const [heroImages, setHeroImages]       = useState<string[]>(settings.hero_image_urls ?? []);
    const [heroNewFiles, setHeroNewFiles]   = useState<File[]>([]);
    const [heroRemoveIdx, setHeroRemoveIdx] = useState<number[]>([]);
    const heroInputRef = useRef<HTMLInputElement>(null);

    const [facultyTitle, setFacultyTitle]       = useState(settings.faculty_section_title ?? '');
    const [facultySubtitle, setFacultySubtitle] = useState(settings.faculty_section_subtitle ?? '');

    const [msgTitle, setMsgTitle]           = useState(settings.message_title ?? '');
    const [msgContent, setMsgContent]       = useState(settings.message_content ?? '');
    const [msgAuthor, setMsgAuthor]         = useState(settings.message_author ?? '');
    const [msgAuthorTitle, setMsgAuthorTitle] = useState(settings.message_author_title ?? '');
    const [msgAuthorPhoto, setMsgAuthorPhoto] = useState<string | null>(settings.message_author_photo_url);
    const [msgAuthorFile, setMsgAuthorFile] = useState<File | null>(null);
    const msgPhotoRef = useRef<HTMLInputElement>(null);

    const [alumniTitle, setAlumniTitle]       = useState(settings.alumni_section_title ?? '');
    const [alumniSubtitle, setAlumniSubtitle] = useState(settings.alumni_section_subtitle ?? '');
    const [alumniItems, setAlumniItems]       = useState<AlumniItem[]>(settings.alumni_items ?? []);
    const [alumniPhotoFiles, setAlumniPhotoFiles]             = useState<Record<number, File>>({});
    const [alumniPhotoLocalPreviews, setAlumniPhotoLocalPreviews] = useState<Record<number, string>>({});

    const [footerTagline, setFooterTagline]   = useState(settings.footer_tagline ?? '');
    const [footerAddress, setFooterAddress]   = useState(settings.footer_address ?? '');
    const [footerPhone, setFooterPhone]       = useState(settings.footer_phone ?? '');
    const [footerEmail, setFooterEmail]       = useState(settings.footer_email ?? '');
    const [footerFacebook, setFooterFacebook] = useState(settings.footer_facebook ?? '');

    const [navLinks, setNavLinks]     = useState<NavLink[]>(settings.nav_links ?? []);

    // Features section
    const [featuresShow, setFeaturesShow]           = useState<boolean>(settings.features_show !== false);
    const [featuresTitle, setFeaturesTitle]         = useState(settings.features_section_title ?? '');
    const [featuresSubtitle, setFeaturesSubtitle]   = useState(settings.features_section_subtitle ?? '');
    const [featuresItems, setFeaturesItems]         = useState<FeatureItem[]>(
        settings.features_items?.length ? settings.features_items : [
            { icon_name: 'Users',         title: 'Student Management',    description: 'Comprehensive student records, enrollment tracking.' },
            { icon_name: 'TrendingUp',    title: 'Financial Dashboard',   description: 'Real-time financial insights and analytics.' },
            { icon_name: 'BookOpen',      title: 'Document Management',   description: 'Centralized document storage and workflows.' },
            { icon_name: 'CheckCircle',   title: 'Requirements Tracking', description: 'Monitor deadlines and compliance status.' },
            { icon_name: 'Shield',        title: 'Role-Based Access',     description: 'Secure multi-level access control.' },
            { icon_name: 'GraduationCap', title: 'Academic Analytics',    description: 'Detailed reports for data-informed decisions.' },
        ]
    );

    const [landingSaving, setLandingSaving] = useState(false);
    const [alumniSaving, setAlumniSaving]   = useState(false);
    const [navSaving, setNavSaving]         = useState(false);

    const handleHeroAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setHeroNewFiles(prev => [...prev, ...files]);
        files.forEach(f => { const r = new FileReader(); r.onload = ev => setHeroImages(prev => [...prev, ev.target?.result as string]); r.readAsDataURL(f); });
        e.target.value = '';
    };

    const handleHeroRemove = (i: number) => {
        setHeroImages(prev => prev.filter((_, idx) => idx !== i));
        setHeroRemoveIdx(prev => [...prev, i]);
    };

    const handleMsgPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        setMsgAuthorFile(f);
        const r = new FileReader(); r.onload = ev => setMsgAuthorPhoto(ev.target?.result as string); r.readAsDataURL(f);
    };

    const handleLandingSave = () => {
        const fd = new FormData();
        fd.append('hero_title', heroTitle);
        fd.append('hero_subtitle', heroSubtitle);
        fd.append('hero_remove_indices', JSON.stringify(heroRemoveIdx));
        heroNewFiles.forEach(f => fd.append('hero_new_images[]', f));
        fd.append('faculty_section_title', facultyTitle);
        fd.append('faculty_section_subtitle', facultySubtitle);
        fd.append('message_title', msgTitle);
        fd.append('message_content', msgContent);
        fd.append('message_author', msgAuthor);
        fd.append('message_author_title', msgAuthorTitle);
        if (msgAuthorFile) fd.append('message_author_photo', msgAuthorFile);
        fd.append('alumni_section_title', alumniTitle);
        fd.append('alumni_section_subtitle', alumniSubtitle);
        fd.append('footer_tagline', footerTagline);
        fd.append('footer_address', footerAddress);
        fd.append('footer_phone', footerPhone);
        fd.append('footer_email', footerEmail);
        fd.append('footer_facebook', footerFacebook);
        fd.append('features_show', featuresShow ? '1' : '0');
        fd.append('features_section_title', featuresTitle);
        fd.append('features_section_subtitle', featuresSubtitle);
        fd.append('features_items', JSON.stringify(featuresItems));

        setLandingSaving(true);
        router.post('/owner/app-settings/landing-page', fd, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { toast.success('Landing page saved'); setHeroNewFiles([]); setHeroRemoveIdx([]); setMsgAuthorFile(null); setLandingSaving(false); },
            onError:   () => { toast.error('Failed to save'); setLandingSaving(false); },
        });
    };

    const handleAlumniSave = () => {
        setAlumniSaving(true);
        router.post('/owner/app-settings/alumni', { alumni: JSON.stringify(alumniItems) }, {
            preserveScroll: true,
            onSuccess: () => {
                const pending = Object.entries(alumniPhotoFiles);
                if (pending.length === 0) {
                    toast.success('Alumni saved');
                    setAlumniSaving(false);
                    return;
                }
                // Upload photos sequentially
                let remaining = pending.length;
                pending.forEach(([idxStr, file]) => {
                    const fd = new FormData();
                    fd.append('photo', file);
                    fd.append('index', idxStr);
                    router.post('/owner/app-settings/alumni-photo', fd, {
                        forceFormData: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            remaining--;
                            if (remaining === 0) {
                                toast.success('Alumni saved with photos');
                                setAlumniPhotoFiles({});
                                setAlumniPhotoLocalPreviews({});
                                setAlumniSaving(false);
                            }
                        },
                        onError: () => {
                            remaining--;
                            if (remaining === 0) {
                                toast.error('Some photos failed to upload');
                                setAlumniSaving(false);
                            }
                        },
                    });
                });
            },
            onError: () => { toast.error('Failed'); setAlumniSaving(false); },
        });
    };

    const handleAlumniPhotoSelect = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAlumniPhotoFiles(prev => ({ ...prev, [i]: file }));
        const reader = new FileReader();
        reader.onload = ev => setAlumniPhotoLocalPreviews(prev => ({ ...prev, [i]: ev.target?.result as string }));
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleNavSave = () => {
        setNavSaving(true);
        router.post('/owner/app-settings/nav-links', { nav_links: JSON.stringify(navLinks) }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Nav links saved'); setNavSaving(false); },
            onError:   () => { toast.error('Failed');             setNavSaving(false); },
        });
    };

    // ── Departments & Faculty ─────────────────────────────
    const emptyDeptForm = { classification: 'K-12' as 'K-12' | 'College', name: '', code: '', description: '', is_active: true };
    const emptyFacultyForm = { first_name: '', last_name: '', middle_name: '', suffix: '', employee_id: '', email: '', specialization: '', employment_status: 'full-time', is_active: true, show_on_landing: true };

    const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
    const [deptModalOpen, setDeptModalOpen] = useState(false);
    const [editingDept, setEditingDept]     = useState<DepartmentItem | null>(null);
    const [deptForm, setDeptForm]           = useState(emptyDeptForm);
    const [deptSaving, setDeptSaving]       = useState(false);

    const [facultyModalOpen, setFacultyModalOpen]   = useState(false);
    const [editingFaculty, setEditingFaculty]       = useState<FacultyMember | null>(null);
    const [currentDeptId, setCurrentDeptId]         = useState<number | null>(null);
    const [facultyForm, setFacultyForm]             = useState(emptyFacultyForm);
    const [facultyPhotoFile, setFacultyPhotoFile]   = useState<File | null>(null);
    const [facultyPhotoPreview, setFacultyPhotoPreview] = useState<string | null>(null);
    const [facultySaving, setFacultySaving]         = useState(false);

    const toggleDeptExpand = (id: number) => setExpandedDepts(prev => {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); } else { next.add(id); }
        return next;
    });

    const openAddDeptModal = () => {
        setEditingDept(null);
        setDeptForm(emptyDeptForm);
        setDeptModalOpen(true);
    };

    const openEditDeptModal = (dept: DepartmentItem) => {
        setEditingDept(dept);
        setDeptForm({ classification: dept.classification, name: dept.name, code: dept.code, description: dept.description ?? '', is_active: dept.is_active });
        setDeptModalOpen(true);
    };

    const handleDeptSubmit = () => {
        setDeptSaving(true);
        if (editingDept) {
            router.put(`/owner/departments/${editingDept.id}`, deptForm, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Department updated'); setDeptModalOpen(false); setDeptSaving(false); },
                onError:   () => { toast.error('Failed to save');        setDeptSaving(false); },
            });
        } else {
            router.post('/owner/departments', deptForm, {
                preserveScroll: true,
                onSuccess: () => { toast.success('Department added'); setDeptModalOpen(false); setDeptSaving(false); },
                onError:   () => { toast.error('Failed to save');      setDeptSaving(false); },
            });
        }
    };

    const handleDeptDelete = (id: number) => {
        if (!confirm('Delete this department? This cannot be undone.')) return;
        router.delete(`/owner/departments/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Department deleted'),
            onError:   () => toast.error('Failed to delete'),
        });
    };

    const openAddFacultyModal = (deptId: number) => {
        setEditingFaculty(null);
        setCurrentDeptId(deptId);
        setFacultyForm(emptyFacultyForm);
        setFacultyPhotoFile(null);
        setFacultyPhotoPreview(null);
        setFacultyModalOpen(true);
    };

    const openEditFacultyModal = (t: FacultyMember, deptId: number) => {
        setEditingFaculty(t);
        setCurrentDeptId(deptId);
        setFacultyForm({ first_name: t.first_name, last_name: t.last_name, middle_name: t.middle_name ?? '', suffix: t.suffix ?? '', employee_id: t.employee_id, email: t.email, specialization: t.specialization ?? '', employment_status: t.employment_status, is_active: t.is_active, show_on_landing: t.show_on_landing });
        setFacultyPhotoFile(null);
        setFacultyPhotoPreview(t.photo_url);
        setFacultyModalOpen(true);
    };

    const handleFacultySubmit = () => {
        const fd = new FormData();
        fd.append('department_id', String(currentDeptId));
        Object.entries(facultyForm).forEach(([k, v]) =>
            fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
        );
        if (facultyPhotoFile) fd.append('photo', facultyPhotoFile);
        setFacultySaving(true);
        const url = editingFaculty ? `/owner/faculty/${editingFaculty.id}` : '/owner/faculty';
        router.post(url, fd, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { toast.success(editingFaculty ? 'Faculty updated' : 'Faculty added'); setFacultyModalOpen(false); setFacultySaving(false); },
            onError:   () => { toast.error('Failed to save'); setFacultySaving(false); },
        });
    };

    const handleFacultyDelete = (id: number) => {
        if (!confirm('Remove this faculty member?')) return;
        router.delete(`/owner/faculty/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Faculty removed'),
            onError:   () => toast.error('Failed to remove'),
        });
    };

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="App Settings" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="App Settings"
                    description="Customize branding, landing page content, and navigation for all users"
                />

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="flex flex-wrap gap-1 h-auto">
                        <TabsTrigger value="general"     className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> General</TabsTrigger>
                        <TabsTrigger value="landing"     className="flex items-center gap-1.5"><Layout className="h-4 w-4" /> Landing Page</TabsTrigger>
                        <TabsTrigger value="alumni"      className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> Alumni</TabsTrigger>
                        <TabsTrigger value="nav"         className="flex items-center gap-1.5"><Navigation className="h-4 w-4" /> Navigation</TabsTrigger>
                        <TabsTrigger value="departments" className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> Departments</TabsTrigger>
                    </TabsList>

                    {/* ══ GENERAL ══════════════════════════════════════════ */}
                    <TabsContent value="general">
                        <form onSubmit={handleGeneralSubmit} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> General</CardTitle>
                                    <CardDescription>Basic application identity settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_name">Application Name</Label>
                                        <Input id="app_name" value={data.app_name} onChange={e => setData('app_name', e.target.value)}
                                            placeholder="e.g., St. Mary's School" maxLength={100} />
                                        {errors.app_name && <p className="text-sm text-destructive">{errors.app_name}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            Appears in the browser tab, sidebar, and printed documents (COE, receipts).
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="school_year">Current School Year</Label>
                                        <Input id="school_year" value={data.school_year} onChange={e => setData('school_year', e.target.value)}
                                            placeholder="e.g., 2025-2026" maxLength={20} />
                                        {errors.school_year && <p className="text-sm text-destructive">{errors.school_year}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            Used across fees, enrollment, and reports. Format: YYYY-YYYY (e.g., 2025-2026).
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Academic Structure</CardTitle>
                                    <CardDescription>Enable the academic tracks your school offers.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div><p className="font-medium">K-12</p><p className="text-sm text-muted-foreground">Senior / Junior High School tracks</p></div>
                                        <Switch checked={hasK12} disabled={academicSaving} onCheckedChange={v => handleAcademicToggle('has_k12', v)} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div><p className="font-medium">College</p><p className="text-sm text-muted-foreground">Tertiary / Higher Education programs</p></div>
                                        <Switch checked={hasCollege} disabled={academicSaving} onCheckedChange={v => handleAcademicToggle('has_college', v)} />
                                    </div>
                                    {!hasK12 && !hasCollege && <p className="text-sm text-destructive">At least one track must be enabled.</p>}
                                </CardContent>
                            </Card>

                            {/* Active Semester & Enrollment Period Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Active Semester & Enrollment Period</CardTitle>
                                    <CardDescription>Set the current active semester and control when students can enroll. K-12 and College can have different enrollment periods.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Active Semester Selector */}
                                    <div className="rounded-lg border p-4 space-y-3">
                                        <div>
                                            <p className="font-medium">Active Semester</p>
                                            <p className="text-sm text-muted-foreground">Set the current semester for subject enrollment. College students can only enroll in subjects offered in the active semester.</p>
                                        </div>
                                        <Select
                                            value={activeSemester.toString()}
                                            onValueChange={(val) => setActiveSemester(parseInt(val))}
                                        >
                                            <SelectTrigger className="w-[240px]">
                                                <SelectValue placeholder="Select active semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1st Semester</SelectItem>
                                                <SelectItem value="2">2nd Semester</SelectItem>
                                                <SelectItem value="3">Summer / Midyear</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* K-12 Enrollment */}
                                    {hasK12 && (
                                        <div className="rounded-lg border p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">K-12 Enrollment</p>
                                                    <p className="text-sm text-muted-foreground">Open enrollment for K-12 students</p>
                                                </div>
                                                <Switch 
                                                    checked={k12EnrollmentOpen} 
                                                    disabled={enrollmentSaving} 
                                                    onCheckedChange={setK12EnrollmentOpen} 
                                                />
                                            </div>
                                            {k12EnrollmentOpen && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="k12_start">Start Date (optional)</Label>
                                                        <Input 
                                                            id="k12_start" 
                                                            type="date" 
                                                            value={k12EnrollmentStart}
                                                            onChange={e => setK12EnrollmentStart(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="k12_end">End Date (optional)</Label>
                                                        <Input 
                                                            id="k12_end" 
                                                            type="date" 
                                                            value={k12EnrollmentEnd}
                                                            onChange={e => setK12EnrollmentEnd(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* College Enrollment */}
                                    {hasCollege && (
                                        <div className="rounded-lg border p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">College Enrollment</p>
                                                    <p className="text-sm text-muted-foreground">Open enrollment for College students</p>
                                                </div>
                                                <Switch 
                                                    checked={collegeEnrollmentOpen} 
                                                    disabled={enrollmentSaving} 
                                                    onCheckedChange={setCollegeEnrollmentOpen} 
                                                />
                                            </div>
                                            {collegeEnrollmentOpen && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="college_start">Start Date (optional)</Label>
                                                        <Input 
                                                            id="college_start" 
                                                            type="date" 
                                                            value={collegeEnrollmentStart}
                                                            onChange={e => setCollegeEnrollmentStart(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="college_end">End Date (optional)</Label>
                                                        <Input 
                                                            id="college_end" 
                                                            type="date" 
                                                            value={collegeEnrollmentEnd}
                                                            onChange={e => setCollegeEnrollmentEnd(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!hasK12 && !hasCollege && (
                                        <p className="text-sm text-muted-foreground">Enable at least one academic track above to configure enrollment periods.</p>
                                    )}

                                    <div className="flex justify-end">
                                        <Button 
                                            type="button" 
                                            onClick={handleEnrollmentPeriodSave} 
                                            disabled={enrollmentSaving || (!hasK12 && !hasCollege)}
                                        >
                                            {enrollmentSaving ? 'Saving...' : 'Save Enrollment Settings'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Theme Colors</CardTitle>
                                    <CardDescription>Customize the color scheme for all users</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label>Primary Color</Label>
                                            <div className="flex items-center gap-3">
                                                <input type="color" value={data.primary_color} onChange={e => setData('primary_color', e.target.value)} className="h-10 w-16 cursor-pointer rounded border p-1" />
                                                <Input value={data.primary_color} onChange={e => setData('primary_color', e.target.value)} placeholder="#2563eb" className="font-mono uppercase" maxLength={7} />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Secondary Color</Label>
                                            <div className="flex items-center gap-3">
                                                <input type="color" value={data.secondary_color} onChange={e => setData('secondary_color', e.target.value)} className="h-10 w-16 cursor-pointer rounded border p-1" />
                                                <Input value={data.secondary_color} onChange={e => setData('secondary_color', e.target.value)} placeholder="#64748b" className="font-mono uppercase" maxLength={7} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border p-4 space-y-2">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Preview</p>
                                        <div className="flex gap-3">
                                            <div className="h-10 w-32 rounded flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: data.primary_color }}>Primary</div>
                                            <div className="h-10 w-32 rounded flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: data.secondary_color }}>Secondary</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Branding</CardTitle>
                                    <CardDescription>Upload your school logo and favicon</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <UploadZone label="School Logo" preview={logoPreview} hint="PNG, JPG, SVG — max 2 MB" accept="image/*" inputId="logo-upload" onChange={e => handleBrandingFileChange(e, 'logo')} />
                                        <UploadZone label="Favicon" preview={faviconPreview} hint="PNG, ICO — max 512 KB" accept="image/png,image/x-icon,.ico" inputId="favicon-upload" onChange={e => handleBrandingFileChange(e, 'favicon')} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing} size="lg">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving…' : 'Save Settings'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* ══ LANDING PAGE ═════════════════════════════════════ */}
                    <TabsContent value="landing" className="space-y-6">

                        {/* ── TOP: Live Preview at full width ───────────── */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Layout className="h-4 w-4" />
                                    Live Preview
                                </p>
                                <a href="/" target="_blank" rel="noreferrer"
                                    className="text-xs text-primary hover:underline">
                                    Open full page ↗
                                </a>
                            </div>
                            {/* Outer container clips to a viewport-height window with its own scrollbar */}
                            <div className="rounded-lg border overflow-hidden bg-white shadow-sm" style={{ height: '85vh' }}>
                                <iframe
                                    src="/"
                                    title="Landing Page Preview"
                                    className="w-full"
                                    style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
                                />
                            </div>
                        </div>

                        {/* ── BELOW: Editor forms ───────────────────────── */}
                        <div className="space-y-6">

                        {/* Hero */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" /> Hero Section</CardTitle>
                                <CardDescription>The first thing visitors see on the landing page</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Headline</Label>
                                    <Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Welcome to Our School" maxLength={200} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tagline / Subtitle</Label>
                                    <Textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} placeholder="Empowering students to achieve excellence…" rows={2} maxLength={400} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Background Images</Label>
                                    <p className="text-xs text-muted-foreground">Images rotate as a carousel. Recommended: 1920×1080 px landscape.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {heroImages.map((url, i) => (
                                            <div key={i} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                                                <img src={url} alt={`Hero ${i+1}`} className="h-full w-full object-cover" />
                                                <button type="button" onClick={() => handleHeroRemove(i)}
                                                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => heroInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 aspect-video text-muted-foreground hover:border-muted-foreground/60 transition-colors">
                                            <Plus className="h-5 w-5 mb-1" />
                                            <span className="text-xs">Add</span>
                                        </button>
                                    </div>
                                    <input ref={heroInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleHeroAdd} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5" /> Features Section</CardTitle>
                                        <CardDescription className="mt-1">"Everything you need" section on the landing page</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="features-show" className="text-sm">Show section</Label>
                                        <Switch id="features-show" checked={featuresShow} onCheckedChange={setFeaturesShow} />
                                    </div>
                                </div>
                            </CardHeader>
                            {featuresShow && (
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Section Title</Label>
                                        <Input value={featuresTitle} onChange={e => setFeaturesTitle(e.target.value)} placeholder="Everything you need" maxLength={200} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Section Subtitle</Label>
                                        <Textarea value={featuresSubtitle} onChange={e => setFeaturesSubtitle(e.target.value)} placeholder="Powerful tools designed to simplify administration…" rows={2} maxLength={400} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Feature Cards</p>
                                        <Button type="button" variant="outline" size="sm"
                                            onClick={() => setFeaturesItems(p => [...p, { icon_name: 'Star', title: '', description: '' }])}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Feature
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {featuresItems.map((item, i) => (
                                            <div key={i} className="rounded-lg border p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-semibold text-muted-foreground">Feature {i + 1}</p>
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                                                        onClick={() => setFeaturesItems(p => p.filter((_, idx) => idx !== i))}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-3">
                                                    <div className="grid gap-1">
                                                        <Label className="text-xs">Icon</Label>
                                                        <Select value={item.icon_name} onValueChange={v => setFeaturesItems(p => p.map((x, idx) => idx === i ? { ...x, icon_name: v } : x))}>
                                                            <SelectTrigger className="h-9 text-xs">
                                                                <SelectValue placeholder="Select icon" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ICON_NAMES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label className="text-xs">Title</Label>
                                                        <Input value={item.title} onChange={e => setFeaturesItems(p => p.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} placeholder="Feature title" maxLength={100} className="h-9 text-sm" />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <Label className="text-xs">Description</Label>
                                                        <Input value={item.description} onChange={e => setFeaturesItems(p => p.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} placeholder="Brief description…" maxLength={300} className="h-9 text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Faculty */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Faculty Section</CardTitle>
                                <CardDescription>
                                    Faculty cards come from teacher records with "Show on landing page" enabled.
                                    Manage individual visibility from each teacher's profile.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Section Title</Label>
                                    <Input value={facultyTitle} onChange={e => setFacultyTitle(e.target.value)} placeholder="Meet Our Faculty" maxLength={200} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Section Subtitle</Label>
                                    <Textarea value={facultySubtitle} onChange={e => setFacultySubtitle(e.target.value)} placeholder="Dedicated educators committed to excellence…" rows={2} maxLength={400} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Principal's Message</CardTitle>
                                <CardDescription>Administrator's message shown on the landing page</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Message Title</Label>
                                    <Input value={msgTitle} onChange={e => setMsgTitle(e.target.value)} placeholder="A Message from our Principal" maxLength={200} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Message Content</Label>
                                    <Textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} placeholder="Welcome to our school…" rows={6} maxLength={5000} />
                                    <p className="text-xs text-muted-foreground text-right">{msgContent.length}/5000</p>
                                </div>
                                <Separator />
                                <p className="text-sm font-medium">Author / Signatory</p>
                                <div className="flex items-start gap-6">
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <Avatar className="h-20 w-20 ring-2 ring-muted">
                                            <AvatarImage src={msgAuthorPhoto ?? undefined} />
                                            <AvatarFallback className="text-xl font-bold">
                                                {msgAuthor ? msgAuthor.split(' ').slice(0,2).map(n => n[0]).join('') : '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button type="button" variant="outline" size="sm" onClick={() => msgPhotoRef.current?.click()}>
                                            <Camera className="mr-1 h-3.5 w-3.5" /> Photo
                                        </Button>
                                        <input ref={msgPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleMsgPhoto} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="grid gap-2">
                                            <Label>Name</Label>
                                            <Input value={msgAuthor} onChange={e => setMsgAuthor(e.target.value)} placeholder="Dr. Juan dela Cruz" maxLength={100} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Position / Title</Label>
                                            <Input value={msgAuthorTitle} onChange={e => setMsgAuthorTitle(e.target.value)} placeholder="School Principal" maxLength={100} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Footer */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Footer</CardTitle>
                                <CardDescription>Contact information displayed in the footer</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Tagline</Label>
                                    <Input value={footerTagline} onChange={e => setFooterTagline(e.target.value)} placeholder="Excellence in Education since 1990" maxLength={300} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Address</Label>
                                        <Textarea value={footerAddress} onChange={e => setFooterAddress(e.target.value)} placeholder="123 School St., City, Province" rows={2} maxLength={300} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid gap-2">
                                            <Label>Phone</Label>
                                            <Input value={footerPhone} onChange={e => setFooterPhone(e.target.value)} placeholder="(+63) 000-000-0000" maxLength={50} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <Input value={footerEmail} onChange={e => setFooterEmail(e.target.value)} placeholder="info@school.edu.ph" type="email" maxLength={100} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label>Facebook Page URL</Label>
                                        <Input value={footerFacebook} onChange={e => setFooterFacebook(e.target.value)} placeholder="https://www.facebook.com/yourschool" maxLength={200} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />
                        <div className="flex justify-end">
                            <Button type="button" onClick={handleLandingSave} disabled={landingSaving} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                {landingSaving ? 'Saving…' : 'Save Landing Page'}
                            </Button>
                        </div>
                        </div>{/* end editor forms */}

                    </TabsContent>

                    {/* ══ ALUMNI ═══════════════════════════════════════════ */}
                    <TabsContent value="alumni" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Alumni Section Heading</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Section Title</Label>
                                    <Input value={alumniTitle} onChange={e => setAlumniTitle(e.target.value)} placeholder="Notable Graduates & Alumni" maxLength={200} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Section Subtitle</Label>
                                    <Textarea value={alumniSubtitle} onChange={e => setAlumniSubtitle(e.target.value)} placeholder="Our graduates who have made a difference…" rows={2} maxLength={400} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Alumni Cards</CardTitle>
                                        <CardDescription className="mt-1">{alumniItems.length} entries</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setAlumniItems(p => [...p, { name: '', description: '', batch: '' }])}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Entry
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {alumniItems.length === 0 && (
                                    <p className="text-center text-muted-foreground text-sm py-8">No alumni entries yet.</p>
                                )}
                                {alumniItems.map((item, i) => (
                                    <div key={i} className="relative rounded-lg border p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <GripVertical className="h-4 w-4" />
                                                <span className="text-xs font-medium">Entry #{i + 1}</span>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setAlumniItems(p => p.filter((_, idx) => idx !== i));
                                                    // Re-index photo state: shift entries above i down by 1
                                                    setAlumniPhotoFiles(prev => {
                                                        const next: Record<number, File> = {};
                                                        Object.entries(prev).forEach(([k, v]) => {
                                                            const ki = parseInt(k);
                                                            if (ki < i) next[ki] = v;
                                                            else if (ki > i) next[ki - 1] = v;
                                                        });
                                                        return next;
                                                    });
                                                    setAlumniPhotoLocalPreviews(prev => {
                                                        const next: Record<number, string> = {};
                                                        Object.entries(prev).forEach(([k, v]) => {
                                                            const ki = parseInt(k);
                                                            if (ki < i) next[ki] = v;
                                                            else if (ki > i) next[ki - 1] = v;
                                                        });
                                                        return next;
                                                    });
                                                }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="grid gap-1">
                                                <Label className="text-xs">Name</Label>
                                                <Input value={item.name} onChange={e => setAlumniItems(p => p.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Full Name" maxLength={100} />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label className="text-xs">Batch / Year</Label>
                                                <Input value={item.batch} onChange={e => setAlumniItems(p => p.map((x, idx) => idx === i ? { ...x, batch: e.target.value } : x))} placeholder="2020" maxLength={20} />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label className="text-xs">Achievement / Description</Label>
                                                <Input value={item.description} onChange={e => setAlumniItems(p => p.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} placeholder="Engineer, CPA…" maxLength={300} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="relative group cursor-pointer" onClick={() => document.getElementById(`alumni-photo-${i}`)?.click()}>
                                                <Avatar className="h-14 w-14">
                                                    <AvatarImage
                                                        src={alumniPhotoLocalPreviews[i] ?? item.photo_url ?? undefined}
                                                        alt={item.name}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="text-lg">
                                                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <Button type="button" variant="outline" size="sm"
                                                    onClick={() => document.getElementById(`alumni-photo-${i}`)?.click()}>
                                                    <Upload className="mr-2 h-3 w-3" />
                                                    {alumniPhotoLocalPreviews[i] ? 'Change Photo' : (item.photo_url ? 'Replace Photo' : 'Upload Photo')}
                                                </Button>
                                                {alumniPhotoLocalPreviews[i] && (
                                                    <p className="text-xs text-amber-600 mt-1">Photo staged — will upload when you save.</p>
                                                )}
                                            </div>
                                            <input
                                                id={`alumni-photo-${i}`}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={e => handleAlumniPhotoSelect(i, e)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Separator />
                        <div className="flex justify-end">
                            <Button type="button" onClick={handleAlumniSave} disabled={alumniSaving} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                {alumniSaving ? 'Saving…' : 'Save Alumni'}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ══ NAVIGATION ═══════════════════════════════════════ */}
                    <TabsContent value="nav" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5" /> Navbar Links</CardTitle>
                                        <CardDescription className="mt-1">Links in the public landing page navbar. Add anchors (#section) or full paths (/about).</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setNavLinks(p => [...p, { label: '', href: '#' }])}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Link
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {navLinks.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No nav links. Default hardcoded links will be used.</p>}
                                {navLinks.map((link, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 grid gap-3 sm:grid-cols-2">
                                            <div className="grid gap-1">
                                                <Label className="text-xs">Label</Label>
                                                <Input value={link.label} onChange={e => setNavLinks(p => p.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} placeholder="About Us" maxLength={50} />
                                            </div>
                                            <div className="grid gap-1">
                                                <Label className="text-xs">URL / Anchor</Label>
                                                <Select
                                                    value={SECTION_ANCHORS.some(a => a.value === link.href) ? link.href : '_custom'}
                                                    onValueChange={v => {
                                                        if (v !== '_custom') {
                                                            setNavLinks(p => p.map((x, idx) => idx === i ? { ...x, href: v } : x));
                                                        } else {
                                                            setNavLinks(p => p.map((x, idx) => idx === i ? { ...x, href: '' } : x));
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="h-9 text-sm">
                                                        <SelectValue placeholder="Select section…" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SECTION_ANCHORS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                {(!SECTION_ANCHORS.some(a => a.value !== '_custom' && a.value === link.href)) && (
                                                    <Input
                                                        value={link.href}
                                                        onChange={e => setNavLinks(p => p.map((x, idx) => idx === i ? { ...x, href: e.target.value } : x))}
                                                        placeholder="/custom-path or #anchor"
                                                        maxLength={200}
                                                        className="mt-1 h-9 text-sm"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                                            onClick={() => setNavLinks(p => p.filter((_, idx) => idx !== i))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Separator />
                        <div className="flex justify-end">
                            <Button type="button" onClick={handleNavSave} disabled={navSaving} size="lg">
                                <Save className="mr-2 h-4 w-4" />
                                {navSaving ? 'Saving…' : 'Save Navigation'}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ══ DEPARTMENTS ═══════════════════════════════════════ */}
                    <TabsContent value="departments" className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Departments &amp; Faculty</CardTitle>
                                    <CardDescription>Manage departments and the faculty assigned to each</CardDescription>
                                </div>
                                <Button type="button" size="sm" onClick={openAddDeptModal} className="flex-shrink-0">
                                    <Plus className="mr-2 h-4 w-4" /> Add Department
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {departments.length === 0 && (
                                    <p className="text-center text-muted-foreground text-sm py-8">No departments yet. Click "Add Department" to get started.</p>
                                )}
                                {(['K-12', 'College'] as const).map(cls => {
                                    const clsDepts = departments.filter(d => d.classification === cls);
                                    if (clsDepts.length === 0) return null;
                                    return (
                                        <div key={cls}>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{cls}</p>
                                            <div className="space-y-2">
                                                {clsDepts.map(dept => (
                                                    <div key={dept.id} className="rounded-lg border">
                                                        {/* Department row */}
                                                        <div className="flex items-center gap-2 p-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleDeptExpand(dept.id)}
                                                                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                                                            >
                                                                {expandedDepts.has(dept.id)
                                                                    ? <ChevronDown className="h-4 w-4" />
                                                                    : <ChevronRight className="h-4 w-4" />}
                                                            </button>
                                                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded flex-shrink-0">{dept.code}</span>
                                                            <span className="font-medium flex-1 truncate">{dept.name}</span>
                                                            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded flex-shrink-0 bg-muted text-muted-foreground">
                                                                {dept.teachers.length} faculty
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${dept.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                                                {dept.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => openEditDeptModal(dept)}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-destructive hover:text-destructive" onClick={() => handleDeptDelete(dept.id)}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                        {/* Faculty section */}
                                                        {expandedDepts.has(dept.id) && (
                                                            <div className="border-t bg-muted/30 px-3 py-3 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-medium text-muted-foreground">Faculty ({dept.teachers.length})</p>
                                                                    <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => openAddFacultyModal(dept.id)}>
                                                                        <UserPlus className="mr-1.5 h-3 w-3" /> Add Faculty
                                                                    </Button>
                                                                </div>
                                                                {dept.teachers.length === 0 && (
                                                                    <p className="text-xs text-muted-foreground text-center py-3">No faculty assigned yet.</p>
                                                                )}
                                                                {dept.teachers.map(t => (
                                                                    <div key={t.id} className="flex items-center gap-3 rounded-md bg-background border p-2">
                                                                        <Avatar className="h-9 w-9 flex-shrink-0">
                                                                            <AvatarImage src={t.photo_url ?? undefined} />
                                                                            <AvatarFallback className="text-xs">{t.first_name[0]}{t.last_name[0]}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">{t.full_name}</p>
                                                                            <p className="text-xs text-muted-foreground truncate">{t.specialization || t.employment_status}</p>
                                                                        </div>
                                                                        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                                                                {t.is_active ? 'Active' : 'Inactive'}
                                                                            </span>
                                                                            {t.show_on_landing && (
                                                                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Landing</span>
                                                                            )}
                                                                        </div>
                                                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => openEditFacultyModal(t, dept.id)}>
                                                                            <Pencil className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-destructive hover:text-destructive" onClick={() => handleFacultyDelete(t.id)}>
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Department Dialog ───────────────────────────── */}
            <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid gap-1.5">
                            <label className="text-sm font-medium">Classification *</label>
                            <Select value={deptForm.classification} onValueChange={v => setDeptForm(p => ({ ...p, classification: v as 'K-12' | 'College' }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="K-12">K-12</SelectItem>
                                    <SelectItem value="College">College</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Name *</Label>
                            <Input value={deptForm.name} onChange={e => setDeptForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Junior High School" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Code *</Label>
                            <Input value={deptForm.code} onChange={e => setDeptForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g., JHS, BSIT" maxLength={50} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Description</Label>
                            <Textarea value={deptForm.description} onChange={e => setDeptForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={deptForm.is_active} onCheckedChange={v => setDeptForm(p => ({ ...p, is_active: v }))} id="dept_modal_active" />
                            <Label htmlFor="dept_modal_active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeptModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeptSubmit} disabled={deptSaving || !deptForm.name || !deptForm.code}>
                            {deptSaving ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Faculty Dialog ──────────────────────────────── */}
            <Dialog open={facultyModalOpen} onOpenChange={setFacultyModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* Photo */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={facultyPhotoPreview ?? undefined} />
                                <AvatarFallback><Users className="h-6 w-6" /></AvatarFallback>
                            </Avatar>
                            <div>
                                <Label htmlFor="faculty_photo_input" className="cursor-pointer text-sm text-primary hover:underline">
                                    {facultyPhotoPreview ? 'Change Photo' : 'Upload Photo'}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP, max 2 MB</p>
                                <input id="faculty_photo_input" type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden"
                                    onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        setFacultyPhotoFile(f);
                                        const r = new FileReader();
                                        r.onload = ev => setFacultyPhotoPreview(ev.target?.result as string);
                                        r.readAsDataURL(f);
                                        e.target.value = '';
                                    }} />
                            </div>
                        </div>
                        {/* Name fields */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>First Name *</Label>
                                <Input value={facultyForm.first_name} onChange={e => setFacultyForm(p => ({ ...p, first_name: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Last Name *</Label>
                                <Input value={facultyForm.last_name} onChange={e => setFacultyForm(p => ({ ...p, last_name: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Middle Name</Label>
                                <Input value={facultyForm.middle_name} onChange={e => setFacultyForm(p => ({ ...p, middle_name: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Suffix</Label>
                                <Input value={facultyForm.suffix} onChange={e => setFacultyForm(p => ({ ...p, suffix: e.target.value }))} placeholder="Jr., Sr., III" />
                            </div>
                        </div>
                        {/* IDs */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Employee ID *</Label>
                                <Input value={facultyForm.employee_id} onChange={e => setFacultyForm(p => ({ ...p, employee_id: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Email *</Label>
                                <Input type="email" value={facultyForm.email} onChange={e => setFacultyForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Specialization</Label>
                            <Input value={facultyForm.specialization} onChange={e => setFacultyForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g., Mathematics, Computer Science" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Employment Status</Label>
                            <Select value={facultyForm.employment_status} onValueChange={v => setFacultyForm(p => ({ ...p, employment_status: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="contractual">Contractual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-3 pt-1">
                            <div className="flex items-center gap-2">
                                <Switch checked={facultyForm.is_active} onCheckedChange={v => setFacultyForm(p => ({ ...p, is_active: v }))} id="fac_modal_active" />
                                <Label htmlFor="fac_modal_active">Active</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={facultyForm.show_on_landing} onCheckedChange={v => setFacultyForm(p => ({ ...p, show_on_landing: v }))} id="fac_modal_landing" />
                                <Label htmlFor="fac_modal_landing">Show on Landing Page</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFacultyModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleFacultySubmit}
                            disabled={facultySaving || !facultyForm.first_name || !facultyForm.last_name || !facultyForm.employee_id || !facultyForm.email}
                        >
                            {facultySaving ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </OwnerLayout>
    );
}

// ── Shared UploadZone ─────────────────────────────────────────────
function UploadZone({ label, preview, hint, accept, inputId, onChange }: {
    label: string; preview: string | null; hint: string; accept: string; inputId: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="space-y-3">
            <Label>{label}</Label>
            <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 hover:border-muted-foreground/50 transition-colors">
                {preview
                    ? <img src={preview} alt={label} className="h-20 w-auto object-contain" />
                    : <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted"><Upload className="h-8 w-8 text-muted-foreground" /></div>
                }
                <div className="text-center">
                    <Label htmlFor={inputId} className="cursor-pointer text-sm text-primary hover:underline">
                        {preview ? `Change ${label}` : `Upload ${label}`}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                </div>
                <input id={inputId} type="file" accept={accept} className="hidden" onChange={onChange} />
            </div>
        </div>
    );
}
