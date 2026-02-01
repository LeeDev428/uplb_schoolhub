import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type IncomeCardProps = {
    title: string;
    amount: number;
    target: number;
    achievement: number;
    period: string;
    variant: 'today' | 'overall' | 'expected';
    projected?: number;
};

const variantStyles = {
    today: {
        border: 'border-blue-200 dark:border-blue-900',
        bg: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-neutral-950',
        progress: 'bg-blue-600',
    },
    overall: {
        border: 'border-green-200 dark:border-green-900',
        bg: 'bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-neutral-950',
        progress: 'bg-green-600',
    },
    expected: {
        border: 'border-purple-200 dark:border-purple-900',
        bg: 'bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-neutral-950',
        progress: 'bg-purple-600',
    },
};

export function IncomeCard({
    title,
    amount,
    target,
    achievement,
    period,
    variant,
    projected,
}: IncomeCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const styles = variantStyles[variant];
    const isAchieved = achievement >= 100;
    const isProjected = projected && projected > 100;

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border-2 p-6 transition-all hover:shadow-lg',
                styles.border,
                styles.bg,
            )}
        >
            <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                    {title}
                </p>
                <p className="text-xs text-muted-foreground">{period}</p>
            </div>

            <div className="mb-4">
                <h3 className="text-4xl font-bold text-foreground">
                    {formatCurrency(amount)}
                </h3>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Target: {formatCurrency(target)}
                    </span>
                    <span
                        className={cn(
                            'flex items-center font-semibold',
                            isAchieved
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-orange-600 dark:text-orange-400',
                        )}
                    >
                        {isAchieved ? (
                            <TrendingUp className="mr-1 h-4 w-4" />
                        ) : (
                            <TrendingDown className="mr-1 h-4 w-4" />
                        )}
                        {achievement.toFixed(1)}%
                    </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all',
                            styles.progress,
                        )}
                        style={{ width: `${Math.min(achievement, 100)}%` }}
                    />
                </div>

                {projected && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            Annual Target: {formatCurrency(target * 12)}
                        </span>
                        <span
                            className={cn(
                                'font-semibold',
                                isProjected
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-orange-600 dark:text-orange-400',
                            )}
                        >
                            Projected: {projected.toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {variant === 'today' && (
                <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-600" />
                        Live
                    </span>
                </div>
            )}
        </div>
    );
}
