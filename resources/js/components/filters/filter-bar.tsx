import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface FilterBarProps {
    children: React.ReactNode;
    onReset?: () => void;
    showReset?: boolean;
}

export function FilterBar({ children, onReset, showReset = true }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg border">
            {children}
            {showReset && onReset && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="ml-auto"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Filters
                </Button>
            )}
        </div>
    );
}
