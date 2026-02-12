import { Head } from '@inertiajs/react';
import { Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner/owner-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calendar',
        href: '/owner/calendar',
    },
];

interface CalendarEvent {
    id: string | number;
    title: string;
    date: string;
    type: 'deadline';
    category?: string;
    requirements_count?: number;
    description?: string;
}

interface CalendarProps {
    events: CalendarEvent[];
    currentMonth: number;
    currentYear: number;
    monthName: string;
}

export default function OwnerCalendar({ events, currentMonth, currentYear, monthName }: CalendarProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const getDaysInMonth = () => {
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        // Padding for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const getEventsForDate = (day: number): CalendarEvent[] => {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(event => event.date === dateStr);
    };

    const selectedEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

    return (
        <OwnerLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Academic Calendar</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            View schedules, deadlines, and events
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline">Previous</Button>
                        <span className="text-lg font-semibold">{monthName}</span>
                        <Button variant="outline">Next</Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendar Grid */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Calendar View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                                        {day}
                                    </div>
                                ))}
                                {getDaysInMonth().map((day, index) => {
                                    if (day === null) {
                                        return <div key={`empty-${index}`} className="p-2" />;
                                    }
                                    
                                    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const dayEvents = getEventsForDate(day);
                                    const hasEvents = dayEvents.length > 0;

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(dateStr)}
                                            className={cn(
                                                'aspect-square rounded-lg border p-2 text-left transition-colors hover:bg-muted',
                                                selectedDate === dateStr && 'bg-primary text-primary-foreground',
                                                hasEvents && 'border-primary'
                                            )}
                                        >
                                            <div className="text-sm font-semibold">{day}</div>
                                            {hasEvents && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {dayEvents.slice(0, 2).map((event, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="h-1.5 w-1.5 rounded-full bg-red-500"
                                                        />
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <span className="text-xs">+{dayEvents.length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Event Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedDate 
                                    ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                    : 'Select a Date'
                                }
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedEvents.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No events scheduled for this date</p>
                            ) : (
                                selectedEvents.map((event) => (
                                    <div key={event.id} className="space-y-2 rounded-lg border p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-red-500" />
                                                <Badge variant="destructive">
                                                    {event.type}
                                                </Badge>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold">{event.title}</h4>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        )}
                                        {event.category && (
                                            <p className="text-sm text-muted-foreground">Category: {event.category}</p>
                                        )}
                                        {event.requirements_count && event.requirements_count > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                Requirements: {event.requirements_count}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Legend */}
                <Card>
                    <CardContent className="flex items-center gap-6 p-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span className="text-sm">Academic Deadlines</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </OwnerLayout>
    );
}
