import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
    Twitter,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { login, register } from '@/routes';

interface AppSettings {
    app_name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color?: string;
}

interface FacultyMember {
    id: number;
    full_name: string;
    specialization: string | null;
    photo_url: string | null;
    department: string;
}

type Props = {
    canRegister: boolean;
    faculty?: Record<string, FacultyMember[]>;
};

export default function Welcome({ canRegister, faculty = {} }: Props) {
    const { appSettings } = usePage<{ appSettings?: AppSettings }>().props;
    const appName = appSettings?.app_name || 'SchoolHub';
    const logoUrl = appSettings?.logo_url;
    const primaryColor = appSettings?.primary_color || '#2563eb';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const facultyCategories = Object.entries(faculty);

    const navLinks = [
        { label: 'Home', href: '#home' },
        { label: 'Features', href: '#features' },
        { label: 'Faculty', href: '#faculty' },
        { label: 'Contact', href: '#contact' },
    ];

    const getInitials = (name: string) => {
        return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">

                {/* ── Navbar ─────────────────────────────────────────────── */}
                <header
                    className="sticky top-0 z-50 border-b border-white/20 shadow-sm backdrop-blur-md"
                    style={{ backgroundColor: `${primaryColor}ee` }}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        {/* Logo + Name */}
                        <div className="flex items-center space-x-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt={appName} className="h-10 w-10 rounded-lg object-contain bg-white p-1" />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg font-bold text-white leading-tight">{appName}</h1>
                                <p className="text-xs text-white/70 leading-tight">Management System</p>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navLinks.map(link => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="hidden sm:inline-flex text-white border-white/30 hover:bg-white/20 hover:text-white" asChild>
                                <Link href={login()}>Sign In</Link>
                            </Button>
                            {canRegister && (
                                <Button className="hidden sm:inline-flex bg-white font-semibold hover:bg-white/90" style={{ color: primaryColor }} asChild>
                                    <Link href={register()}>Get Started</Link>
                                </Button>
                            )}
                            {/* Mobile menu button */}
                            <button
                                className="md:hidden rounded-lg p-2 text-white hover:bg-white/20"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-white/20 px-4 py-3 space-y-1">
                            {navLinks.map(link => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="block rounded-lg px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/20"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-2 flex flex-col gap-2">
                                <Button variant="outline" className="w-full text-white border-white/40 hover:bg-white/20" asChild>
                                    <Link href={login()}>Sign In</Link>
                                </Button>
                                {canRegister && (
                                    <Button className="w-full bg-white font-semibold" style={{ color: primaryColor }} asChild>
                                        <Link href={register()}>Get Started</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                {/* ── Hero ───────────────────────────────────────────────── */}
                <section id="home" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                    <div className="text-center">
                        <div
                            className="mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium"
                            style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10`, color: primaryColor }}
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Trusted by educational institutions
                        </div>

                        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
                            Modern School
                            <br />
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #7c3aed)` }}
                            >
                                Management System
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400">
                            Streamline your educational institution with our comprehensive platform.
                            Manage students, track finances, and enhance administrative efficiency—all in one place.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button
                                size="lg"
                                className="min-w-48 text-white shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                                asChild
                            >
                                <Link href={login()}>
                                    Sign In to Portal
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <a href="#features">
                                <Button size="lg" variant="outline" className="min-w-48">
                                    Learn More
                                </Button>
                            </a>
                        </div>

                        {/* Quick stats */}
                        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-2xl mx-auto">
                            {[
                                { label: 'Student Records', value: '100%' },
                                { label: 'Uptime', value: '99.9%' },
                                { label: 'Modules', value: '10+' },
                                { label: 'User Roles', value: '8' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl font-bold" style={{ color: primaryColor }}>{stat.value}</div>
                                    <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ───────────────────────────────────────────── */}
                <section id="features" className="bg-white py-20 dark:bg-neutral-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <Badge
                                className="mb-4 text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Platform Features
                            </Badge>
                            <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
                                Everything you need
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                                Powerful features designed to simplify school administration and enhance operational efficiency.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                primaryColor={primaryColor}
                                icon={<Users className="h-6 w-6" />}
                                title="Student Management"
                                description="Comprehensive student records, enrollment tracking, and academic progress monitoring."
                            />
                            <FeatureCard
                                primaryColor={primaryColor}
                                icon={<TrendingUp className="h-6 w-6" />}
                                title="Financial Dashboard"
                                description="Real-time financial insights, revenue tracking, and department-wise analytics."
                            />
                            <FeatureCard
                                primaryColor={primaryColor}
                                icon={<BookOpen className="h-6 w-6" />}
                                title="Document Management"
                                description="Centralized document storage, request tracking, and automated workflows."
                            />
                            <FeatureCard
                                primaryColor={primaryColor}
                                icon={<CheckCircle className="h-6 w-6" />}
                                title="Requirements Tracking"
                                description="Monitor student requirements, deadlines, and compliance status effortlessly."
                            />
                            <FeatureCard
                                primaryColor={primaryColor}
                                icon={<Shield className="h-6 w-6" />}
                                title="Role-Based Access"
                                description="Secure multi-level access control for administrators, registrars, and students."
                            />
                            <FeatureCard
                                primaryColor={primaryColor}
                                icon={<GraduationCap className="h-6 w-6" />}
                                title="Academic Analytics"
                                description="Detailed reports and insights to drive data-informed educational decisions."
                            />
                        </div>
                    </div>
                </section>

                {/* ── Faculty ────────────────────────────────────────────── */}
                {facultyCategories.length > 0 && (
                    <section id="faculty" className="py-20 bg-neutral-50 dark:bg-neutral-950">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-16 text-center">
                                <Badge
                                    className="mb-4 text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Our Team
                                </Badge>
                                <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
                                    Meet Our Faculty
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                                    Dedicated educators and professionals committed to excellence in education.
                                </p>
                            </div>

                            <div className="space-y-16">
                                {facultyCategories.map(([category, members]) => (
                                    <div key={category}>
                                        {/* Category header */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <div
                                                className="h-1 flex-1 rounded-full opacity-30"
                                                style={{ backgroundColor: primaryColor }}
                                            />
                                            <h3
                                                className="text-xl font-bold px-4 py-1 rounded-full text-white whitespace-nowrap"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {category}
                                            </h3>
                                            <div
                                                className="h-1 flex-1 rounded-full opacity-30"
                                                style={{ backgroundColor: primaryColor }}
                                            />
                                        </div>

                                        {/* Faculty grid */}
                                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {(members as FacultyMember[]).map(member => (
                                                <div
                                                    key={member.id}
                                                    className="group flex flex-col items-center rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                                >
                                                    <Avatar className="h-20 w-20 mb-4 ring-4 transition-all" style={{ '--tw-ring-color': `${primaryColor}40` } as React.CSSProperties}>
                                                        <AvatarImage src={member.photo_url ?? undefined} alt={member.full_name} />
                                                        <AvatarFallback
                                                            className="text-white text-lg font-semibold"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {getInitials(member.full_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <h4 className="font-semibold text-neutral-900 dark:text-white leading-tight">
                                                        {member.full_name}
                                                    </h4>
                                                    {member.specialization && (
                                                        <p className="mt-1 text-sm font-medium" style={{ color: primaryColor }}>
                                                            {member.specialization}
                                                        </p>
                                                    )}
                                                    <Badge
                                                        variant="secondary"
                                                        className="mt-3 text-xs"
                                                    >
                                                        {member.department}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── CTA ────────────────────────────────────────────────── */}
                <section
                    className="py-20"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, #7c3aed)` }}
                >
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-4xl font-bold text-white">
                            Ready to transform your institution?
                        </h2>
                        <p className="mb-8 text-lg text-blue-100">
                            Join schools already using {appName} to streamline their operations.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button size="lg" className="min-w-48 bg-white font-semibold hover:bg-white/90" style={{ color: primaryColor }} asChild>
                                <Link href={login()}>Access Portal</Link>
                            </Button>
                            {canRegister && (
                                <Button size="lg" variant="outline" className="min-w-48 border-white/50 text-white hover:bg-white/20" asChild>
                                    <Link href={register()}>Get Started Today</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <footer id="contact" className="border-t border-neutral-200 bg-neutral-900 dark:border-neutral-800">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-4 sm:grid-cols-2">
                            {/* Brand */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-3 mb-4">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={appName} className="h-10 w-10 rounded-lg object-contain bg-white p-1" />
                                    ) : (
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{appName}</h3>
                                        <p className="text-xs text-neutral-400">Management System</p>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
                                    A comprehensive school management platform designed to streamline
                                    administrative processes and enhance educational outcomes.
                                </p>
                                <div className="mt-6 flex space-x-3">
                                    <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition-colors hover:text-white" style={{ ['--hover-bg' as string]: primaryColor }}>
                                        <Facebook className="h-4 w-4" />
                                    </a>
                                    <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition-colors hover:text-white">
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
                                <ul className="space-y-2">
                                    {navLinks.map(link => (
                                        <li key={link.label}>
                                            <a
                                                href={link.href}
                                                className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                                            >
                                                <ChevronRight className="h-3 w-3" />
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                    <li>
                                        <Link
                                            href={login()}
                                            className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                            Sign In
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                                        <span className="text-sm text-neutral-400">School Address,<br />City, Province</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 flex-shrink-0" style={{ color: primaryColor }} />
                                        <span className="text-sm text-neutral-400">(+63) 000-000-0000</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 flex-shrink-0" style={{ color: primaryColor }} />
                                        <span className="text-sm text-neutral-400">info@school.edu.ph</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-neutral-500">
                                &copy; {new Date().getFullYear()} {appName}. All rights reserved.
                            </p>
                            <div className="flex items-center gap-1 text-sm text-neutral-500">
                                Built with
                                <span className="mx-1" style={{ color: primaryColor }}>♥</span>
                                for Education
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    primaryColor,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    primaryColor: string;
}) {
    return (
        <div className="group relative rounded-2xl border border-neutral-200 bg-white p-8 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
            <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white transition-all"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
                <div
                    className="group-hover:opacity-100 transition-all"
                    style={{ color: primaryColor }}
                >
                    {icon}
                </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
                {description}
            </p>
        </div>
    );
}
