import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
    label?: string;
    value: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
    placeholder?: string;
}

export function DateRangePicker({
    label = 'Date Range',
    value,
    onChange,
    placeholder = 'Pick a date range',
}: DateRangePickerProps) {
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
    };

    return (
        <div className="space-y-2">
            <Label className="text-xs text-gray-600">{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full min-w-[240px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(value.from, 'LLL dd, y')
                            )
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        {value?.from && (
                            <X
                                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                                onClick={handleClear}
                            />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={onChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
