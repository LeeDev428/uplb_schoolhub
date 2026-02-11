import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterDropdownProps {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    showAll?: boolean;
}

export function FilterDropdown({
    label,
    value,
    options,
    onChange,
    placeholder = 'Select...',
    showAll = true,
}: FilterDropdownProps) {
    // Prevent doubling: don't render built-in "All" if options already include value="all"
    const hasAllOption = options.some(o => o.value === 'all');
    const shouldShowAll = showAll && !hasAllOption;

    return (
        <div className="space-y-2">
            <Label className="text-xs text-gray-600">{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full min-w-[140px]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {shouldShowAll && <SelectItem value="all">All</SelectItem>}
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
