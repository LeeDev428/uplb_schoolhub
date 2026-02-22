import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import React from 'react';
import {
    BookOpen,
    CheckCircle,
    GraduationCap,
    Shield,
    TrendingUp,
    Users,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Menu,
    X,
    ChevronRight,
    Quote,
    BarChart2,
    Bell,
    Briefcase,
    Calendar,
    ClipboardList,
    CreditCard,
    FileText,
    Globe,
    Heart,
    Home,
    Key,
    Layers,
    LifeBuoy,
    Lock,
    PieChart,
    Settings,
    Star,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { login, register } from '@/routes';

const ICON_MAP: Record<string, React.ElementType> = {
    Users, TrendingUp, BookOpen, CheckCircle, Shield, GraduationCap, BarChart2,
    Bell, Briefcase, Calendar, ClipboardList, CreditCard, FileText, Globe,
    Heart, Home, Key, Layers, LifeBuoy, Lock, Mail, PieChart, Settings,
    Star, Zap, Phone, MapPin,
};

const DEFAULT_FEATURES = [
    { icon_name: 'Users',        title: 'Student Management',   description: 'Comprehensive student records, enrollment tracking, and academic progress monitoring.' },
    { icon_name: 'TrendingUp',   title: 'Financial Dashboard',  description: 'Real-time financial insights, revenue tracking, and analytics.' },
    { icon_name: 'BookOpen',     title: 'Document Management',  description: 'Centralized document storage, request tracking, and automated workflows.' },
    { icon_name: 'CheckCircle',  title: 'Requirements Tracking',description: 'Monitor student requirements, deadlines, and compliance status effortlessly.' },
    { icon_name: 'Shield',       title: 'Role-Based Access',    description: 'Secure multi-level access control for administrators, registrars, and students.' },
    { icon_name: 'GraduationCap',title: 'Academic Analytics',   description: 'Detailed reports and insights to drive data-informed educational decisions.' },
];

interface FeatureItem {
    icon_name: string;
    title: string;
    description: string;
}

interface AppSettings {
    app_name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color?: string;
    // Landing
    hero_title?: string | null;
    hero_subtitle?: string | null;
    hero_image_urls?: string[];
    faculty_section_title?: string | null;
    faculty_section_subtitle?: string | null;
    message_title?: string | null;
    message_content?: string | null;
    message_author?: string | null;
    message_author_title?: string | null;
    message_author_photo_url?: string | null;
    alumni_section_title?: string | null;
    alumni_section_subtitle?: string | null;
    alumni_items?: AlumniItem[];
    footer_tagline?: string | null;
    footer_address?: string | null;
    footer_phone?: string | null;
    footer_email?: string | null;
    footer_facebook?: string | null;
    nav_links?: NavLink[];
    // Features section
    features_section_title?: string | null;
    features_section_subtitle?: string | null;
    features_show?: boolean;
    features_items?: FeatureItem[];
}

interface FacultyMember {
    id: number;
    full_name: string;
    specialization: string | null;
    bio: string | null;
    photo_url: string | null;
    department: string;
}

interface AlumniItem {
    name: string;
    description: string;
    batch: string;
    photo_url?: string | null;
}

interface NavLink {
    label: string;
    href: string;
}

type Props = {
    canRegister: boolean;
    faculty?: Record<string, FacultyMember[]>;
};

const DEFAULT_NAV: NavLink[] = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'Faculty', href: '#faculty' },
    { label: 'Contact', href: '#contact' },
];

function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function Welcome({ canRegister, faculty = {} }: Props) {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;

    const appName    = appSettings?.app_name || 'SchoolHub';
    const logoUrl    = appSettings?.logo_url;
    const primary    = appSettings?.primary_color || '#2563eb';
    const navLinks   = appSettings?.nav_links?.length ? appSettings.nav_links : DEFAULT_NAV;
    const heroImages = appSettings?.hero_image_urls ?? [];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [heroIdx, setHeroIdx] = useState(0);

    useEffect(() => {
        if (heroImages.length <= 1) return;
        const id = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000);
        return () => clearInterval(id);
    }, [heroImages.length]);

    const facultyCategories = Object.entries(faculty);
    const alumniItems       = appSettings?.alumni_items ?? [];
    const hasMessage        = !!(appSettings?.message_content);
    const hasAlumni         = alumniItems.length > 0;
    const showFeatures      = appSettings?.features_show !== false;
    const featureItems: FeatureItem[] = (appSettings?.features_items?.length ? appSettings.features_items : DEFAULT_FEATURES);

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen overflow-x-hidden bg-background text-foreground">

                {/* ── Navbar ─────────────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-neutral-900/95">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt={appName} className="h-9 w-9 rounded-lg object-contain" />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                            )}
                            <span className="text-base font-bold text-neutral-900 dark:text-white">{appName}</span>
                        </div>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <a key={link.label} href={link.href}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white">
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                                <Link href={login()}>Sign In</Link>
                            </Button>
                            {canRegister && (
                                <Button size="sm" className="hidden sm:inline-flex text-white" style={{ backgroundColor: primary }} asChild>
                                    <Link href={register()}>Get Started</Link>
                                </Button>
                            )}
                            <button
                                className="md:hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t bg-white dark:bg-neutral-900 px-4 py-3 space-y-1">
                            {navLinks.map(link => (
                                <a key={link.label} href={link.href}
                                    className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-2 flex flex-col gap-2 border-t mt-2">
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href={login()}>Sign In</Link>
                                </Button>
                                {canRegister && (
                                    <Button size="sm" className="w-full text-white" style={{ backgroundColor: primary }} asChild>
                                        <Link href={register()}>Get Started</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                {/* ── Hero ───────────────────────────────────────────── */}
                <section id="home" className="relative flex min-h-[85vh] items-center overflow-hidden">
                    {heroImages.length > 0 && (
                        <div className="absolute inset-0 z-0">
                            <img
                                key={heroIdx}
                                src={heroImages[heroIdx]}
                                alt=""
                                className="h-full w-full object-cover transition-opacity duration-1000"
                            />
                            <div className="absolute inset-0 bg-black/55" />
                        </div>
                    )}

                    {heroImages.length === 0 && (
                        <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(135deg, ${primary}10 0%, transparent 60%)` }} />
                    )}

                    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <div
                                className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
                                style={{
                                    borderColor: heroImages.length > 0 ? 'rgba(255,255,255,0.25)' : `${primary}40`,
                                    backgroundColor: heroImages.length > 0 ? 'rgba(255,255,255,0.12)' : `${primary}10`,
                                    color: heroImages.length > 0 ? '#fff' : primary,
                                }}
                            >
                                <Shield className="h-4 w-4" />
                                Trusted by educational institutions
                            </div>

                            <h1 className={`mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl leading-tight ${heroImages.length > 0 ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                                {appSettings?.hero_title || `Welcome to ${appName}`}
                            </h1>

                            <p className={`mb-10 max-w-2xl text-lg sm:text-xl ${heroImages.length > 0 ? 'text-white/80' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                {appSettings?.hero_subtitle || 'Streamline your educational institution with our comprehensive management platform.'}
                            </p>

                            <div className="flex flex-col items-start gap-4 sm:flex-row">
                                <Button size="lg" className="min-w-44 text-white shadow-lg hover:opacity-90" style={{ backgroundColor: primary }} asChild>
                                    <Link href={login()}>
                                        Sign In to Portal
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                {showFeatures && (
                                    <Button size="lg" variant="outline"
                                        className={`min-w-44 ${heroImages.length > 0 ? 'border-white/40 text-white bg-transparent hover:bg-white/15' : ''}`}
                                        asChild>
                                        <a href="#features">Explore Features</a>
                                    </Button>
                                )}
                            </div>

                            {heroImages.length > 1 && (
                                <div className="mt-10 flex gap-2">
                                    {heroImages.map((_, i) => (
                                        <button key={i} onClick={() => setHeroIdx(i)}
                                            className={`h-2 rounded-full transition-all ${i === heroIdx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Features ───────────────────────────────────────── */}
                {showFeatures && (
                    <section id="features" className="py-20 border-t">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-14 text-center">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>
                                    Platform Features
                                </p>
                                <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
                                    {appSettings?.features_section_title || 'Everything you need'}
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
                                    {appSettings?.features_section_subtitle || 'Powerful tools designed to simplify school administration and enhance operational efficiency.'}
                                </p>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {featureItems.map(feat => {
                                    const IconComponent = ICON_MAP[feat.icon_name] ?? Shield;
                                    return (
                                        <div key={feat.title}
                                            className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
                                            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: `${primary}12`, color: primary }}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-semibold">{feat.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Faculty ────────────────────────────────────────── */}
                {facultyCategories.length > 0 && (
                    <section id="faculty" className="py-20 border-t bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-14 text-center">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>Our Team</p>
                                <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
                                    {appSettings?.faculty_section_title || 'Meet Our Faculty'}
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
                                    {appSettings?.faculty_section_subtitle || 'Dedicated educators and professionals committed to excellence in education.'}
                                </p>
                            </div>
                            <div className="space-y-16">
                                {facultyCategories.map(([category, members]) => (
                                    <div key={category}>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="rounded-full px-4 py-1 text-sm font-semibold text-white whitespace-nowrap" style={{ backgroundColor: primary }}>
                                                {category}
                                            </span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {(members as FacultyMember[]).map(member => (
                                                <div key={member.id} className="flex flex-col items-center rounded-xl border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                                                    <Avatar className="h-18 w-18 mb-4">
                                                        <AvatarImage src={member.photo_url ?? undefined} alt={member.full_name} />
                                                        <AvatarFallback className="text-white font-semibold text-base" style={{ backgroundColor: primary }}>
                                                            {getInitials(member.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <h4 className="font-semibold text-sm leading-tight">{member.full_name}</h4>
                                                    {member.specialization && (
                                                        <p className="mt-1 text-xs font-medium" style={{ color: primary }}>{member.specialization}</p>
                                                    )}
                                                    {member.bio && (
                                                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{member.bio}</p>
                                                    )}
                                                    <span className="mt-3 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                        {member.department}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Principal's Message ────────────────────────────── */}
                {hasMessage && (
                    <section id="message" className="py-20 border-t">
                        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 text-center">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>Message</p>
                                <h2 className="text-4xl font-bold text-neutral-900 dark:text-white">
                                    {appSettings?.message_title || "A Message from our Principal"}
                                </h2>
                            </div>
                            <div className="rounded-2xl border bg-card p-8 md:p-12 shadow-sm">
                                <Quote className="mb-6 h-10 w-10 opacity-15" style={{ color: primary }} />
                                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                                    {appSettings!.message_content}
                                </p>
                                {appSettings?.message_author && (
                                    <div className="mt-8 flex items-center gap-4 border-t pt-6">
                                        {appSettings?.message_author_photo_url && (
                                            <Avatar className="h-14 w-14 flex-shrink-0">
                                                <AvatarImage src={appSettings.message_author_photo_url} />
                                                <AvatarFallback className="text-white font-bold" style={{ backgroundColor: primary }}>
                                                    {getInitials(appSettings.message_author)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div>
                                            <p className="font-semibold">{appSettings.message_author}</p>
                                            {appSettings?.message_author_title && (
                                                <p className="text-sm text-muted-foreground">{appSettings.message_author_title}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Alumni ─────────────────────────────────────────── */}
                {hasAlumni && (
                    <section id="alumni" className="py-20 border-t bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-14 text-center">
                                <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: primary }}>Alumni</p>
                                <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
                                    {appSettings?.alumni_section_title || 'Notable Graduates & Alumni'}
                                </h2>
                                {appSettings?.alumni_section_subtitle && (
                                    <p className="mx-auto max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
                                        {appSettings.alumni_section_subtitle}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {alumniItems.map((a, i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                                        {a.photo_url ? (
                                            <img src={a.photo_url} alt={a.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0 border-2" style={{ borderColor: `${primary}30` }} />
                                        ) : (
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white font-bold" style={{ backgroundColor: primary }}>
                                                {a.name ? a.name[0].toUpperCase() : '?'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm leading-tight">{a.name}</p>
                                            {a.batch && <p className="text-xs text-muted-foreground mt-0.5">Batch {a.batch}</p>}
                                            {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── CTA ────────────────────────────────────────────── */}
                <section className="py-20 border-t" style={{ backgroundColor: primary }}>
                    <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-4 text-4xl font-bold text-white">Ready to transform your institution?</h2>
                        <p className="mb-8 text-lg text-white/75">
                            Join schools already using {appName} to streamline their operations.
                        </p>
                        <Button size="lg" className="min-w-44 bg-white font-semibold hover:bg-white/95" style={{ color: primary }} asChild>
                            <Link href={login()}>Access Portal</Link>
                        </Button>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer id="contact" className="border-t bg-neutral-900 text-neutral-400">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Brand */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={appName} className="h-9 w-9 rounded-lg object-contain bg-white p-1" />
                                    ) : (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ backgroundColor: primary }}>
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                    )}
                                    <span className="text-base font-bold text-white">{appName}</span>
                                </div>
                                <p className="text-sm leading-relaxed max-w-xs">
                                    {appSettings?.footer_tagline || 'A comprehensive school management platform designed to streamline administrative processes.'}
                                </p>
                                {appSettings?.footer_facebook && (
                                    <a href={appSettings.footer_facebook} target="_blank" rel="noreferrer"
                                        className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 transition-colors hover:text-white">
                                        <Facebook className="h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Quick Links</h4>
                                <ul className="space-y-2">
                                    {navLinks.map(link => (
                                        <li key={link.label}>
                                            <a href={link.href} className="flex items-center gap-1 text-sm hover:text-white transition-colors">
                                                <ChevronRight className="h-3 w-3" /> {link.label}
                                            </a>
                                        </li>
                                    ))}
                                    <li>
                                        <Link href={login()} className="flex items-center gap-1 text-sm hover:text-white transition-colors">
                                            <ChevronRight className="h-3 w-3" /> Sign In
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Contact</h4>
                                <ul className="space-y-3 text-sm">
                                    {appSettings?.footer_address && (
                                        <li className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                            <span className="whitespace-pre-line">{appSettings.footer_address}</span>
                                        </li>
                                    )}
                                    {appSettings?.footer_phone && (
                                        <li className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                            <span>{appSettings.footer_phone}</span>
                                        </li>
                                    )}
                                    {appSettings?.footer_email && (
                                        <li className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                            <span>{appSettings.footer_email}</span>
                                        </li>
                                    )}
                                    {!appSettings?.footer_address && !appSettings?.footer_phone && !appSettings?.footer_email && (
                                        <>
                                            <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: primary }} /><span>School Address,<br />City, Province</span></li>
                                            <li className="flex items-center gap-3"><Phone className="h-4 w-4 flex-shrink-0" style={{ color: primary }} /><span>(+63) 000-000-0000</span></li>
                                            <li className="flex items-center gap-3"><Mail className="h-4 w-4 flex-shrink-0" style={{ color: primary }} /><span>info@school.edu.ph</span></li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 sm:flex-row">
                            <p className="text-xs text-neutral-500">&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
                            <p className="text-xs text-neutral-500">Built for Education</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

