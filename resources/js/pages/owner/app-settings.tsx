import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, Save, Palette, Globe, Image, GraduationCap } from 'lucide-react';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'App Settings', href: '/owner/app-settings' },
];

interface AppSettings {
    app_name: string;
    primary_color: string;
    secondary_color: string;
    logo_url: string | null;
    favicon_url: string | null;
    has_k12: boolean;
    has_college: boolean;
}

interface Props {
    settings: AppSettings;
}

export default function AppSettings({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || '',
        primary_color: settings.primary_color || '#2563eb',
        secondary_color: settings.secondary_color || '#64748b',
        has_k12: settings.has_k12 ?? true,
        has_college: settings.has_college ?? true,
        logo: null as File | null,
        favicon: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo_url);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(settings.favicon_url);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo' | 'favicon',
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (type === 'logo') {
                setLogoPreview(ev.target?.result as string);
            } else {
                setFaviconPreview(ev.target?.result as string);
            }
        };
        reader.readAsDataURL(file);
        setData(type, file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/owner/app-settings', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('App settings saved successfully');
            },
            onError: () => {
                toast.error('Failed to save settings');
            },
        });
    };

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="App Settings" />

            <div className="space-y-6 p-6">
                <PageHeader
                    title="App Settings"
                    description="Customize your school's branding and application appearance for all users"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                General
                            </CardTitle>
                            <CardDescription>Basic application identity settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="app_name">Application Name</Label>
                                <Input
                                    id="app_name"
                                    value={data.app_name}
                                    onChange={(e) => setData('app_name', e.target.value)}
                                    placeholder="e.g., St. Mary's School"
                                    maxLength={100}
                                />
                                {errors.app_name && (
                                    <p className="text-sm text-red-500">{errors.app_name}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    This name appears in the browser tab, sidebar, and printed documents (COE, receipts).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Academic Structure
                            </CardTitle>
                            <CardDescription>
                                Enable the academic tracks your school offers. Disabled tracks won't appear in subject classification options.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">K-12</p>
                                    <p className="text-sm text-muted-foreground">Senior High School / Junior High School tracks</p>
                                </div>
                                <Switch
                                    checked={data.has_k12}
                                    onCheckedChange={(checked) => setData('has_k12', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">College</p>
                                    <p className="text-sm text-muted-foreground">Tertiary / Higher Education programs</p>
                                </div>
                                <Switch
                                    checked={data.has_college}
                                    onCheckedChange={(checked) => setData('has_college', checked)}
                                />
                            </div>
                            {!data.has_k12 && !data.has_college && (
                                <p className="text-sm text-destructive">At least one track must be enabled.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Theme Colors */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme Colors
                            </CardTitle>
                            <CardDescription>Customize the color scheme for all users</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="primary_color">Primary Color</Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="primary_color"
                                            type="color"
                                            value={data.primary_color}
                                            onChange={(e) => setData('primary_color', e.target.value)}
                                            className="h-10 w-16 cursor-pointer rounded border p-1"
                                        />
                                        <Input
                                            value={data.primary_color}
                                            onChange={(e) => setData('primary_color', e.target.value)}
                                            placeholder="#2563eb"
                                            className="font-mono uppercase"
                                            maxLength={7}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Used for buttons, links, and primary accents.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="secondary_color">Secondary Color</Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="secondary_color"
                                            type="color"
                                            value={data.secondary_color}
                                            onChange={(e) => setData('secondary_color', e.target.value)}
                                            className="h-10 w-16 cursor-pointer rounded border p-1"
                                        />
                                        <Input
                                            value={data.secondary_color}
                                            onChange={(e) => setData('secondary_color', e.target.value)}
                                            placeholder="#64748b"
                                            className="font-mono uppercase"
                                            maxLength={7}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Used for secondary elements and muted text.
                                    </p>
                                </div>
                            </div>

                            {/* Color Preview */}
                            <div className="rounded-lg border p-4 space-y-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Preview</p>
                                <div className="flex gap-3">
                                    <div
                                        className="h-10 w-32 rounded flex items-center justify-center text-white text-xs font-medium"
                                        style={{ backgroundColor: data.primary_color }}
                                    >
                                        Primary Button
                                    </div>
                                    <div
                                        className="h-10 w-32 rounded flex items-center justify-center text-white text-xs font-medium"
                                        style={{ backgroundColor: data.secondary_color }}
                                    >
                                        Secondary
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branding Files */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                Branding
                            </CardTitle>
                            <CardDescription>Upload your school logo and favicon</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Logo Upload */}
                                <div className="space-y-3">
                                    <Label>School Logo</Label>
                                    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 hover:border-muted-foreground/50 transition-colors">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="h-20 w-auto object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <Label
                                                htmlFor="logo-upload"
                                                className="cursor-pointer text-sm text-primary hover:underline"
                                            >
                                                {logoPreview ? 'Change logo' : 'Upload logo'}
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PNG, JPG, SVG — max 2MB. Recommended: 200×200px
                                            </p>
                                        </div>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                        />
                                    </div>
                                </div>

                                {/* Favicon Upload */}
                                <div className="space-y-3">
                                    <Label>Favicon</Label>
                                    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 hover:border-muted-foreground/50 transition-colors">
                                        {faviconPreview ? (
                                            <img
                                                src={faviconPreview}
                                                alt="Favicon preview"
                                                className="h-20 w-20 object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <Label
                                                htmlFor="favicon-upload"
                                                className="cursor-pointer text-sm text-primary hover:underline"
                                            >
                                                {faviconPreview ? 'Change favicon' : 'Upload favicon'}
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PNG, ICO — max 512KB. Recommended: 32×32px or 64×64px
                                            </p>
                                        </div>
                                        <input
                                            id="favicon-upload"
                                            type="file"
                                            accept="image/png,image/x-icon,.ico"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, 'favicon')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </OwnerLayout>
    );
}
