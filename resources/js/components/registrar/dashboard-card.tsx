import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    title: string;
    count: number;
    subtitle?: string;
    icon: 'users' | 'alert' | 'check' | 'file';
    color: 'blue' | 'green' | 'yellow' | 'gray';
}

const icons = {
    users: Users,
    alert: AlertCircle,
    check: CheckCircle,
    file: FileText,
};

const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500',
};

export function DashboardCard({ title, count, subtitle, icon, color }: DashboardCardProps) {
    const Icon = icons[icon];

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h3 className="mt-2 text-3xl font-bold">{count}</h3>
                        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    <div className={cn('p-3 rounded-full text-white', colorStyles[color])}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
