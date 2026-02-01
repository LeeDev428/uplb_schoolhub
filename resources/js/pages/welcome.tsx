import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    GraduationCap,
    Shield,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

type Props = {
    canRegister: boolean;
};

export default function Welcome({ canRegister }: Props) {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                {/* Header */}
                <header className="border-b border-neutral-200/50 backdrop-blur-sm dark:border-neutral-800/50">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    SchoolHub
                                </h1>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Management System
                                </p>
                            </div>
                        </div>

                        <nav className="flex items-center space-x-3">
                            <Button variant="ghost" asChild>
                                <Link href={login()}>Login</Link>
                            </Button>
                            {canRegister && (
                                <Button asChild>
                                    <Link href={register()}>Get Started</Link>
                                </Button>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                            <Shield className="mr-2 h-4 w-4" />
                            Trusted by educational institutions
                        </div>

                        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
                            Modern School
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                Management System
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400">
                            Streamline your educational institution with our
                            comprehensive platform. Manage students, track
                            finances, and enhance administrative efficiency—all
                            in one place.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {canRegister && (
                                <Button size="lg" asChild className="min-w-48">
                                    <Link href={register()}>
                                        Start Free Trial
                                    </Link>
                                </Button>
                            )}
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="min-w-48"
                            >
                                <Link href={login()}>Sign In</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white py-20 dark:bg-neutral-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-neutral-900 dark:text-white">
                                Everything you need
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                                Powerful features designed to simplify school
                                administration and enhance operational
                                efficiency.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<Users className="h-6 w-6" />}
                                title="Student Management"
                                description="Comprehensive student records, enrollment tracking, and academic progress monitoring."
                            />
                            <FeatureCard
                                icon={<TrendingUp className="h-6 w-6" />}
                                title="Financial Dashboard"
                                description="Real-time financial insights, revenue tracking, and department-wise analytics."
                            />
                            <FeatureCard
                                icon={<BookOpen className="h-6 w-6" />}
                                title="Document Management"
                                description="Centralized document storage, request tracking, and automated workflows."
                            />
                            <FeatureCard
                                icon={<CheckCircle className="h-6 w-6" />}
                                title="Requirements Tracking"
                                description="Monitor student requirements, deadlines, and compliance status effortlessly."
                            />
                            <FeatureCard
                                icon={<Shield className="h-6 w-6" />}
                                title="Role-Based Access"
                                description="Secure multi-level access control for administrators, registrars, and students."
                            />
                            <FeatureCard
                                icon={<GraduationCap className="h-6 w-6" />}
                                title="Academic Analytics"
                                description="Detailed reports and insights to drive data-informed educational decisions."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-violet-600 py-20">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="mb-6 text-4xl font-bold text-white">
                            Ready to transform your institution?
                        </h2>
                        <p className="mb-8 text-lg text-blue-100">
                            Join thousands of schools already using SchoolHub to
                            streamline their operations.
                        </p>
                        {canRegister && (
                            <Button
                                size="lg"
                                variant="secondary"
                                asChild
                                className="min-w-48"
                            >
                                <Link href={register()}>Get Started Today</Link>
                            </Button>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-neutral-200 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                            <p>
                                &copy; {new Date().getFullYear()} SchoolHub. All
                                rights reserved.
                            </p>
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
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group relative rounded-2xl border border-neutral-200 bg-white p-8 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-400">
                {icon}
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
