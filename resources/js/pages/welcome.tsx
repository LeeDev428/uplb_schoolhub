import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen, CheckCircle, GraduationCap, Shield, TrendingUp, Users,
    Mail, Phone, MapPin, Facebook, Menu, X, ChevronRight, Quote,
    BarChart2, Bell, Briefcase, Calendar, ClipboardList, CreditCard,
    FileText, Globe, Heart, Home, Key, Layers, LifeBuoy, Lock,
    PieChart, Settings, Star, Zap, Award, ArrowRight, Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

const ICON_MAP: Record<string, React.ElementType> = {
    Users, TrendingUp, BookOpen, CheckCircle, Shield, GraduationCap, BarChart2,
    Bell, Briefcase, Calendar, ClipboardList, CreditCard, FileText, Globe,
    Heart, Home, Key, Layers, LifeBuoy, Lock, Mail, PieChart, Settings,
    Star, Zap, Phone, MapPin, Award,
};

const DEFAULT_FEATURES = [
    { icon_name: 'Users',        title: 'Student Management',    description: 'Comprehensive student records, enrollment tracking, and academic progress monitoring.' },
    { icon_name: 'TrendingUp',   title: 'Financial Dashboard',   description: 'Real-time financial insights, revenue tracking, and analytics.' },
    { icon_name: 'BookOpen',     title: 'Document Management',   description: 'Centralized document storage, request tracking, and automated workflows.' },
    { icon_name: 'CheckCircle',  title: 'Requirements Tracking', description: 'Monitor student requirements, deadlines, and compliance status effortlessly.' },
    { icon_name: 'Shield',       title: 'Role-Based Access',     description: 'Secure multi-level access control for administrators, registrars, and students.' },
    { icon_name: 'GraduationCap',title: 'Academic Analytics',    description: 'Detailed reports and insights to drive data-informed educational decisions.' },
];

interface FeatureItem   { icon_name: string; title: string; description: string; }
interface AppSettings {
    app_name: string; logo_url: string | null; primary_color: string; secondary_color?: string;
    hero_title?: string | null; hero_subtitle?: string | null; hero_image_urls?: string[];
    faculty_section_title?: string | null; faculty_section_subtitle?: string | null;
    message_title?: string | null; message_content?: string | null;
    message_author?: string | null; message_author_title?: string | null; message_author_photo_url?: string | null;
    alumni_section_title?: string | null; alumni_section_subtitle?: string | null; alumni_items?: AlumniItem[];
    footer_tagline?: string | null; footer_address?: string | null; footer_phone?: string | null;
    footer_email?: string | null; footer_facebook?: string | null; nav_links?: NavLink[];
    features_section_title?: string | null; features_section_subtitle?: string | null;
    features_show?: boolean; features_items?: FeatureItem[];
}
interface FacultyMember { id: number; full_name: string; specialization: string | null; bio: string | null; photo_url: string | null; department: string; }
interface AlumniItem    { name: string; description: string; batch: string; photo_url?: string | null; }
interface NavLink       { label: string; href: string; }

type Props = { canRegister: boolean; faculty?: Record<string, FacultyMember[]>; };

const DEFAULT_NAV: NavLink[] = [
    { label: 'Home',     href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'Faculty',  href: '#faculty' },
    { label: 'Contact',  href: '#contact' },
];

export default function Welcome({ canRegister, faculty = {} }: Props) {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;

    const appName    = appSettings?.app_name || 'SchoolHub';
    const logoUrl    = appSettings?.logo_url;
    const primary    = appSettings?.primary_color || '#2563eb';
    const navLinks   = appSettings?.nav_links?.length ? appSettings.nav_links : DEFAULT_NAV;
    const heroImages = appSettings?.hero_image_urls ?? [];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [heroIdx, setHeroIdx]               = useState(0);
    const [scrolled, setScrolled]             = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (heroImages.length <= 1) return;
        const id = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5500);
        return () => clearInterval(id);
    }, [heroImages.length]);

    const facultyCategories = Object.entries(faculty);
    const alumniItems       = appSettings?.alumni_items ?? [];
    const hasMessage        = !!(appSettings?.message_content);
    const hasAlumni         = alumniItems.length > 0;
    const showFeatures      = appSettings?.features_show !== false;
    const featureItems: FeatureItem[] = appSettings?.features_items?.length ? appSettings.features_items : DEFAULT_FEATURES;

    // Hex → RGB helper for rgba() usage
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(primary.length === 7 ? primary : '#2563eb');

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen overflow-x-hidden bg-sky-50/50 text-neutral-900 antialiased relative">
                {/* Decorative background shapes - similar to login page */}
                <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                    {/* Large circle top-left */}
                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-200/40" />
                    {/* Medium rounded square top-right */}
                    <div className="absolute -right-20 top-24 h-64 w-64 rounded-3xl bg-blue-100/50 rotate-12" />
                    {/* Small circle mid-left */}
                    <div className="absolute left-12 top-1/2 h-24 w-24 rounded-full bg-indigo-100/60" />
                    {/* Large rounded square bottom-right */}
                    <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-3xl bg-sky-200/30 -rotate-6" />
                    {/* Medium circle bottom-left */}
                    <div className="absolute -bottom-20 left-24 h-64 w-64 rounded-full bg-blue-100/40" />
                    {/* Tiny circle center-right */}
                    <div className="absolute right-1/4 top-1/3 h-12 w-12 rounded-full bg-sky-300/30" />
                    {/* Thin rounded rect mid-top */}
                    <div className="absolute left-1/3 top-8 h-10 w-40 rounded-full bg-indigo-100/40 rotate-12" />
                    {/* Dot pattern overlay */}
                    <div className="absolute inset-0"
                        style={{ backgroundImage: 'radial-gradient(circle, #bae6fd 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.25 }}
                    />
                </div>

                {/* ════════════════════════════════════════
                    NAVBAR
                ════════════════════════════════════════ */}
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100'
                        : heroImages.length > 0 ? 'bg-transparent' : 'bg-transparent'
                }`}>
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                        {/* Logo */}
                        <a href="#home" className="flex items-center gap-3 group">
                            {logoUrl ? (
                                <img src={logoUrl} alt={appName}
                                    className="h-10 w-10 rounded-xl object-contain transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105"
                                    style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                            )}
                            <span className={`text-base font-bold tracking-tight transition-colors ${scrolled ? 'text-neutral-900' : heroImages.length > 0 ? 'text-white' : 'text-neutral-900'}`}>
                                {appName}
                            </span>
                        </a>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <a key={link.label} href={link.href}
                                    className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        scrolled
                                            ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                            : heroImages.length > 0
                                                ? 'text-white/85 hover:text-white hover:bg-white/10'
                                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                    }`}>
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        {/* Auth buttons */}
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" size="sm"
                                className={scrolled || heroImages.length === 0
                                    ? 'text-neutral-700 hover:text-neutral-900'
                                    : 'text-white hover:text-white hover:bg-white/15 border-0'}
                                asChild>
                                <Link href={login()}>Sign In</Link>
                            </Button>
                            {canRegister && (
                                <Button size="sm" className="text-white px-5 shadow-sm hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: primary }} asChild>
                                    <Link href={register()}>
                                        Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className={`md:hidden rounded-lg p-2 transition-colors ${
                                scrolled || heroImages.length === 0
                                    ? 'text-neutral-600 hover:bg-neutral-100'
                                    : 'text-white hover:bg-white/15'
                            }`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Mobile drawer */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-neutral-100 shadow-lg px-5 py-4 space-y-1">
                            {navLinks.map(link => (
                                <a key={link.label} href={link.href}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    <ChevronRight className="h-3.5 w-3.5" style={{ color: primary }} />
                                    {link.label}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 pt-3 border-t border-neutral-100 mt-2">
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

                {/* ════════════════════════════════════════
                    HERO
                ════════════════════════════════════════ */}
                <section id="home" className="relative z-10 flex min-h-screen items-center overflow-hidden">
                    {/* Background */}
                    {heroImages.length > 0 ? (
                        <>
                            {heroImages.map((img, i) => (
                                <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                </div>
                            ))}
                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20 z-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
                        </>
                    ) : (
                        <div className="absolute inset-0">
                            <div className="absolute inset-0" style={{
                                background: `linear-gradient(135deg, rgba(${rgb},0.06) 0%, rgba(${rgb},0.02) 50%, transparent 100%)`
                            }} />
                            {/* Decorative circles */}
                            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.06]"
                                style={{ background: `radial-gradient(circle, ${primary}, transparent)` }} />
                            <div className="absolute top-1/2 -left-48 h-[500px] w-[500px] rounded-full opacity-[0.04]"
                                style={{ background: `radial-gradient(circle, ${primary}, transparent)` }} />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-20 mx-auto w-full max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:px-10">
                        <div className="max-w-2xl xl:max-w-3xl">
                            {/* Badge */}
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                                style={{
                                    background: heroImages.length > 0 ? 'rgba(255,255,255,0.15)' : `rgba(${rgb},0.08)`,
                                    color: heroImages.length > 0 ? '#fff' : primary,
                                    border: `1px solid ${heroImages.length > 0 ? 'rgba(255,255,255,0.25)' : `rgba(${rgb},0.2)`}`,
                                }}>
                                <Sparkles className="h-3.5 w-3.5" />
                                Excellence in Education
                            </div>

                            {/* Heading */}
                            <h1 className={`mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight ${
                                heroImages.length > 0 ? 'text-white' : 'text-neutral-900'
                            }`}>
                                {appSettings?.hero_title || `Welcome to\n${appName}`}
                            </h1>

                            {/* Subtitle */}
                            <p className={`mb-10 text-base sm:text-lg leading-relaxed max-w-xl ${
                                heroImages.length > 0 ? 'text-white/80' : 'text-neutral-500'
                            }`}>
                                {appSettings?.hero_subtitle || 'Streamline your educational institution with our comprehensive management platform.'}
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap items-center gap-4">
                                <Button size="lg"
                                    className="text-white px-7 h-12 rounded-xl shadow-lg hover:opacity-90 transition-opacity text-sm font-semibold"
                                    style={{ backgroundColor: primary }} asChild>
                                    <Link href={login()}>
                                        Access Portal
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                {showFeatures && (
                                    <a href="#features"
                                        className={`inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold transition-all ${
                                            heroImages.length > 0
                                                ? 'text-white border border-white/35 hover:bg-white/15'
                                                : 'text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                        }`}>
                                        Explore Features
                                        <ChevronRight className="h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            {/* Carousel dots */}
                            {heroImages.length > 1 && (
                                <div className="mt-12 flex gap-2">
                                    {heroImages.map((_, i) => (
                                        <button key={i} onClick={() => setHeroIdx(i)}
                                            className={`rounded-full transition-all duration-300 ${
                                                i === heroIdx ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                                            }`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom fade */}
                    {heroImages.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-32 z-20"
                            style={{ background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, transparent 100%)' }} />
                    )}
                </section>

                {/* ════════════════════════════════════════
                    FEATURES
                ════════════════════════════════════════ */}
                {showFeatures && (
                    <section id="features" className="relative z-10 py-24 bg-white/80 backdrop-blur-sm">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

                            {/* Section header */}
                            <div className="mb-16 max-w-2xl mx-auto text-center">
                                <span className="inline-block mb-3 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                    style={{ color: primary, background: `rgba(${rgb},0.08)` }}>
                                    Platform Features
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">
                                    {appSettings?.features_section_title || 'Everything you need'}
                                </h2>
                                <p className="text-neutral-500 text-base sm:text-lg leading-relaxed">
                                    {appSettings?.features_section_subtitle || 'Powerful tools designed to simplify school administration and enhance operational efficiency.'}
                                </p>
                            </div>

                            {/* Features grid */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {featureItems.map((feat, idx) => {
                                    const IconComponent = ICON_MAP[feat.icon_name] ?? Shield;
                                    return (
                                        <div key={feat.title}
                                            className="group relative rounded-2xl border border-neutral-100 bg-white p-7 shadow-sm hover:shadow-lg hover:border-neutral-200 transition-all duration-300 overflow-hidden">
                                            {/* Accent corner */}
                                            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.04] transition-opacity group-hover:opacity-[0.06]"
                                                style={{ backgroundColor: primary }} />

                                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                                                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <h3 className="mb-2 text-base font-bold text-neutral-900 group-hover:text-neutral-900 transition-colors">
                                                {feat.title}
                                            </h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">
                                                {feat.description}
                                            </p>

                                            <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                                                style={{ color: primary }}>
                                                Learn more <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════
                    FACULTY
                ════════════════════════════════════════ */}
                {facultyCategories.length > 0 && (
                    <section id="faculty" className="relative z-10 py-24 bg-white/60 backdrop-blur-sm" style={{ background: `linear-gradient(180deg, rgba(${rgb},0.03) 0%, rgba(255,255,255,0.9) 100%)` }}>
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

                            {/* Section header */}
                            <div className="mb-16 max-w-2xl mx-auto text-center">
                                <span className="inline-block mb-3 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                    style={{ color: primary, background: `rgba(${rgb},0.08)` }}>
                                    Our Team
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">
                                    {appSettings?.faculty_section_title || 'Meet Our Faculty'}
                                </h2>
                                <p className="text-neutral-500 text-base sm:text-lg leading-relaxed">
                                    {appSettings?.faculty_section_subtitle || 'Dedicated educators and professionals committed to excellence in education.'}
                                </p>
                            </div>

                            {/* Department groups */}
                            <div className="space-y-16">
                                {facultyCategories.map(([category, members]) => (
                                    <div key={category}>
                                        {/* Department label */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-px flex-1" style={{ background: `rgba(${rgb},0.15)` }} />
                                            <div className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-sm"
                                                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                                <GraduationCap className="h-4 w-4" />
                                                {category}
                                            </div>
                                            <div className="h-px flex-1" style={{ background: `rgba(${rgb},0.15)` }} />
                                        </div>

                                        {/* Cards */}
                                        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {(members as FacultyMember[]).map(member => (
                                                <div key={member.id}
                                                    className="group relative flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                                    {/* Top accent bar */}
                                                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: primary }} />

                                                    {/* Avatar */}
                                                    <div className="relative mb-4 mt-2">
                                                        <div className="absolute inset-0 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            style={{ background: `radial-gradient(circle, rgba(${rgb},0.12), transparent)` }} />
                                                        <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                                                            <AvatarImage src={member.photo_url ?? undefined} alt={member.full_name} />
                                                            <AvatarFallback className="text-white font-bold text-lg"
                                                                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                                                {getInitials(member.full_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>

                                                    <h4 className="font-bold text-sm text-neutral-900 leading-tight mb-1">{member.full_name}</h4>

                                                    {member.specialization && (
                                                        <p className="text-xs font-semibold mb-2" style={{ color: primary }}>
                                                            {member.specialization}
                                                        </p>
                                                    )}

                                                    {member.bio && (
                                                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 mb-3">
                                                            {member.bio}
                                                        </p>
                                                    )}

                                                    <span className="mt-auto text-[11px] font-medium px-3 py-1 rounded-full border text-neutral-500"
                                                        style={{ borderColor: `rgba(${rgb},0.2)`, background: `rgba(${rgb},0.04)` }}>
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

                {/* ════════════════════════════════════════
                    PRINCIPAL'S MESSAGE
                ════════════════════════════════════════ */}
                {hasMessage && (
                    <section id="message" className="relative z-10 py-24 bg-neutral-950 overflow-hidden">
                        {/* Decorative blobs */}
                        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                            style={{ backgroundColor: primary }} />
                        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full opacity-10 blur-3xl pointer-events-none"
                            style={{ backgroundColor: primary }} />

                        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
                            <div className="text-center mb-12">
                                <span className="inline-block mb-3 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-neutral-400"
                                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                                    From the Administration
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    {appSettings?.message_title || 'A Message from our Principal'}
                                </h2>
                            </div>

                            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-12 shadow-2xl">
                                {/* Large quote mark */}
                                <Quote className="absolute top-8 left-8 h-16 w-16 opacity-[0.08] text-white" />

                                <div className="relative">
                                    <p className="text-base sm:text-lg text-neutral-300 leading-[1.9] whitespace-pre-line pl-6 border-l-2" style={{ borderColor: primary }}>
                                        {appSettings!.message_content}
                                    </p>
                                </div>

                                {appSettings?.message_author && (
                                    <div className="mt-10 flex items-center gap-5 pt-8 border-t border-white/10">
                                        {appSettings?.message_author_photo_url ? (
                                            <Avatar className="h-16 w-16 flex-shrink-0 border-2 shadow-lg" style={{ borderColor: primary }}>
                                                <AvatarImage src={appSettings.message_author_photo_url} />
                                                <AvatarFallback className="text-white font-bold text-base"
                                                    style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                                    {getInitials(appSettings.message_author)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                                {appSettings.message_author[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-white text-base">{appSettings.message_author}</p>
                                            {appSettings?.message_author_title && (
                                                <p className="text-sm text-neutral-400 mt-0.5">{appSettings.message_author_title}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════
                    ALUMNI
                ════════════════════════════════════════ */}
                {hasAlumni && (
                    <section id="alumni" className="relative z-10 py-24 bg-white/80 backdrop-blur-sm">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

                            <div className="mb-16 max-w-2xl mx-auto text-center">
                                <span className="inline-block mb-3 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                    style={{ color: primary, background: `rgba(${rgb},0.08)` }}>
                                    Alumni
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-4 tracking-tight">
                                    {appSettings?.alumni_section_title || 'Notable Graduates & Alumni'}
                                </h2>
                                {appSettings?.alumni_section_subtitle && (
                                    <p className="text-neutral-500 text-base sm:text-lg leading-relaxed">
                                        {appSettings.alumni_section_subtitle}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {alumniItems.map((a, i) => (
                                    <div key={i}
                                        className="group relative flex gap-5 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-neutral-200 transition-all duration-300 overflow-hidden">
                                        {/* Accent */}
                                        <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
                                            style={{ backgroundColor: primary }} />

                                        {a.photo_url ? (
                                            <img src={a.photo_url} alt={a.name}
                                                className="h-14 w-14 rounded-full object-cover flex-shrink-0 border-2 shadow-sm"
                                                style={{ borderColor: `rgba(${rgb},0.2)` }} />
                                        ) : (
                                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white font-bold text-lg shadow-sm"
                                                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                                {a.name ? a.name[0].toUpperCase() : '?'}
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold text-sm text-neutral-900 leading-tight">{a.name}</p>
                                                {a.batch && (
                                                    <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                                                        style={{ backgroundColor: primary }}>
                                                        {a.batch}
                                                    </span>
                                                )}
                                            </div>
                                            {a.description && (
                                                <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">{a.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════
                    CTA
                ════════════════════════════════════════ */}
                <section className="relative z-10 py-28 overflow-hidden" style={{ backgroundColor: primary }}>
                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                            backgroundSize: '32px 32px',
                        }} />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white mb-6">
                            <Star className="h-3.5 w-3.5" />
                            Start Today
                        </div>
                        <h2 className="mb-5 text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            Ready to transform your institution?
                        </h2>
                        <p className="mb-10 text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
                            Join schools already using {appName} to streamline operations and improve outcomes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg"
                                className="min-w-44 bg-white font-bold hover:bg-white/95 h-13 px-8 rounded-xl shadow-lg text-sm"
                                style={{ color: primary }} asChild>
                                <Link href={login()}>
                                    Access Portal <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            {appSettings?.footer_email && (
                                <a href={`mailto:${appSettings.footer_email}`}
                                    className="inline-flex items-center gap-2 h-13 px-8 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors">
                                    <Mail className="h-4 w-4" /> Contact Us
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
                    FOOTER
                ════════════════════════════════════════ */}
                <footer id="contact" className="relative z-10 bg-neutral-950 text-neutral-400">
                    <div className="mx-auto max-w-7xl px-5 pt-16 pb-8 sm:px-8 lg:px-10">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-white/5">

                            {/* Brand */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-3 mb-5">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={appName} className="h-10 w-10 rounded-xl object-contain bg-white/5 p-1.5" />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                                            style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
                                            <GraduationCap className="h-5 w-5" />
                                        </div>
                                    )}
                                    <span className="text-base font-bold text-white">{appName}</span>
                                </div>
                                <p className="text-sm leading-relaxed max-w-xs text-neutral-500 mb-6">
                                    {appSettings?.footer_tagline || 'A comprehensive school management platform designed to streamline administrative processes.'}
                                </p>
                                {appSettings?.footer_facebook && (
                                    <a href={appSettings.footer_facebook} target="_blank" rel="noreferrer"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/6 border border-white/8 text-neutral-400 transition-all hover:text-white hover:bg-white/12">
                                        <Facebook className="h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Quick Links</h4>
                                <ul className="space-y-2.5">
                                    {navLinks.map(link => (
                                        <li key={link.label}>
                                            <a href={link.href}
                                                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
                                                <div className="h-1 w-3 rounded-full transition-all" style={{ backgroundColor: primary }} />
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                    <li>
                                        <Link href={login()}
                                            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors">
                                            <div className="h-1 w-3 rounded-full" style={{ backgroundColor: primary }} />
                                            Sign In
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Contact</h4>
                                <ul className="space-y-4 text-sm">
                                    {appSettings?.footer_address && (
                                        <li className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                            <span className="text-neutral-500 whitespace-pre-line leading-relaxed">{appSettings.footer_address}</span>
                                        </li>
                                    )}
                                    {appSettings?.footer_phone && (
                                        <li className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                            <a href={`tel:${appSettings.footer_phone}`} className="text-neutral-500 hover:text-white transition-colors">
                                                {appSettings.footer_phone}
                                            </a>
                                        </li>
                                    )}
                                    {appSettings?.footer_email && (
                                        <li className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                            <a href={`mailto:${appSettings.footer_email}`} className="text-neutral-500 hover:text-white transition-colors">
                                                {appSettings.footer_email}
                                            </a>
                                        </li>
                                    )}
                                    {!appSettings?.footer_address && !appSettings?.footer_phone && !appSettings?.footer_email && (
                                        <>
                                            <li className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                                <span className="text-neutral-500">School Address,<br/>City, Province</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                                <span className="text-neutral-500">(+63) 000-000-0000</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />
                                                <span className="text-neutral-500">info@school.edu.ph</span>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="flex flex-col items-center justify-between gap-3 pt-8 sm:flex-row">
                            <p className="text-xs text-neutral-600">
                                &copy; {new Date().getFullYear()} {appName}. All rights reserved.
                            </p>
                            <p className="text-xs text-neutral-600">Built for Education</p>
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

