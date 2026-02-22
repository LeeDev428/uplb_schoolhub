import { Head, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Upload, Save, Palette, Globe, Image as ImageIcon, GraduationCap,
    Layout, Users, MessageSquare, Trophy, Footprints, Navigation,
    Plus, Trash2, GripVertical, X, Camera,
} from 'lucide-react';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'App Settings', href: '/owner/app-settings' },
];

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
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    favicon_url: string | null;
    has_k12: boolean;
    has_college: boolean;
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
}

interface Props {
    settings: AppSettingsData;
}

export default function AppSettings({ settings }: Props) {
    // ── General / branding ────────────────────────────────
    const { data, setData, post, processing, errors } = useForm({
        app_name:        settings.app_name || '',
        primary_color:   settings.primary_color || '#2563eb',
        secondary_color: settings.secondary_color || '#64748b',
        logo:    null as File | null,
        favicon: null as File | null,
    });

    const [hasK12, setHasK12]          = useState<boolean>(settings.has_k12);
    const [hasCollege, setHasCollege]  = useState<boolean>(settings.has_college);
    const [academicSaving, setAcademicSaving] = useState(false);

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

    const [footerTagline, setFooterTagline]   = useState(settings.footer_tagline ?? '');
    const [footerAddress, setFooterAddress]   = useState(settings.footer_address ?? '');
    const [footerPhone, setFooterPhone]       = useState(settings.footer_phone ?? '');
    const [footerEmail, setFooterEmail]       = useState(settings.footer_email ?? '');
    const [footerFacebook, setFooterFacebook] = useState(settings.footer_facebook ?? '');

    const [navLinks, setNavLinks]     = useState<NavLink[]>(settings.nav_links ?? []);
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
            onSuccess: () => { toast.success('Alumni saved'); setAlumniSaving(false); },
            onError:   () => { toast.error('Failed');          setAlumniSaving(false); },
        });
    };

    const handleNavSave = () => {
        setNavSaving(true);
        router.post('/owner/app-settings/nav-links', { nav_links: JSON.stringify(navLinks) }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Nav links saved'); setNavSaving(false); },
            onError:   () => { toast.error('Failed');             setNavSaving(false); },
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
                        <TabsTrigger value="general"  className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> General</TabsTrigger>
                        <TabsTrigger value="landing"  className="flex items-center gap-1.5"><Layout className="h-4 w-4" /> Landing Page</TabsTrigger>
                        <TabsTrigger value="alumni"   className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> Alumni</TabsTrigger>
                        <TabsTrigger value="nav"      className="flex items-center gap-1.5"><Navigation className="h-4 w-4" /> Navigation</TabsTrigger>
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
                                                onClick={() => setAlumniItems(p => p.filter((_, idx) => idx !== i))}>
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
                                        {item.photo_url && (
                                            <div className="flex items-center gap-3">
                                                <img src={item.photo_url} alt={item.name} className="h-12 w-12 rounded-full object-cover border" />
                                                <p className="text-xs text-muted-foreground">Save first to update photo via the photo endpoint.</p>
                                            </div>
                                        )}
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
                                                <Input value={link.href} onChange={e => setNavLinks(p => p.map((x, idx) => idx === i ? { ...x, href: e.target.value } : x))} placeholder="#about" maxLength={200} />
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
                </Tabs>
            </div>
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
