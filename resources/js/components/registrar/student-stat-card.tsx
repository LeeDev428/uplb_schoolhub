import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    value: number;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'sky' | 'red';
    label: string;
};

const colorVariants = {
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
    green: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
    orange:
        'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950',
    purple:
        'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950',
    sky: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950',
    red: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
};

const textColorVariants = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    purple: 'text-purple-600 dark:text-purple-400',
    sky: 'text-sky-600 dark:text-sky-400',
    red: 'text-red-600 dark:text-red-400',
};

export function StudentStatCard({
    title,
    value,
    color,
    label,
}: StatCardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border-2 p-6 transition-all hover:shadow-md',
                colorVariants[color],
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <h3
                        className={cn(
                            'mt-2 text-4xl font-bold',
                            textColorVariants[color],
                        )}
                    >
                        {value}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {title}
                    </p>
                </div>
            </div>
        </div>
    );
}
