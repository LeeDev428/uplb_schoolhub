import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface StudentPhotoProps {
    /** The URL of the student's photo */
    src?: string | null;
    /** Student's first name for generating fallback initials */
    firstName?: string;
    /** Student's last name for generating fallback initials */
    lastName?: string;
    /** Alternative text for the image */
    alt?: string;
    /** Size variant - defaults to 'md' */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Additional className for the container */
    className?: string;
    /** Whether to show a border (useful for profile views) */
    bordered?: boolean;
    /** Custom fallback content instead of initials */
    fallback?: React.ReactNode;
}

const sizeClasses = {
    xs: 'size-6 text-xs',
    sm: 'size-8 text-sm',
    md: 'size-10 text-base',
    lg: 'size-12 text-lg',
    xl: 'size-16 text-xl',
    '2xl': 'size-24 text-2xl',
} as const;

const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
    '2xl': 'h-12 w-12',
} as const;

/**
 * StudentPhoto - A reusable component for displaying student photos with consistent styling.
 * 
 * Features:
 * - Automatic fallback to initials when no photo is provided
 * - Multiple size variants for different use cases
 * - Consistent styling across the application
 * - Optional border styling for profile views
 * 
 * @example
 * // Basic usage
 * <StudentPhoto src={student.student_photo_url} firstName="John" lastName="Doe" />
 * 
 * // Large profile photo with border
 * <StudentPhoto src={student.student_photo_url} firstName="John" lastName="Doe" size="2xl" bordered />
 * 
 * // Small inline photo
 * <StudentPhoto src={student.student_photo_url} firstName="John" lastName="Doe" size="sm" />
 */
export function StudentPhoto({
    src,
    firstName = '',
    lastName = '',
    alt,
    size = 'md',
    className,
    bordered = false,
    fallback,
}: StudentPhotoProps) {
    // Generate initials from first and last name
    const initials = React.useMemo(() => {
        const first = firstName.charAt(0).toUpperCase();
        const last = lastName.charAt(0).toUpperCase();
        return first || last ? `${first}${last}` : '';
    }, [firstName, lastName]);

    // Generate alt text
    const altText = alt || (firstName && lastName ? `${firstName} ${lastName}'s photo` : 'Student photo');

    return (
        <Avatar
            className={cn(
                sizeClasses[size],
                bordered && 'ring-2 ring-gray-200 ring-offset-2',
                className
            )}
        >
            <AvatarImage src={src || undefined} alt={altText} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {fallback ?? (initials || <User className={cn(iconSizes[size], 'text-gray-400')} />)}
            </AvatarFallback>
        </Avatar>
    );
}

/**
 * StudentPhotoGrid - Display multiple student photos in a compact overlapping grid
 * Useful for showing class members or group participants
 */
export interface StudentPhotoGridProps {
    students: Array<{
        id: number | string;
        first_name?: string;
        last_name?: string;
        student_photo_url?: string | null;
    }>;
    /** Maximum number of photos to display */
    max?: number;
    /** Size of individual photos */
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}

export function StudentPhotoGrid({
    students,
    max = 5,
    size = 'sm',
    className,
}: StudentPhotoGridProps) {
    const displayStudents = students.slice(0, max);
    const remaining = students.length - max;

    return (
        <div className={cn('flex -space-x-2', className)}>
            {displayStudents.map((student) => (
                <StudentPhoto
                    key={student.id}
                    src={student.student_photo_url}
                    firstName={student.first_name}
                    lastName={student.last_name}
                    size={size}
                    className="ring-2 ring-white"
                />
            ))}
            {remaining > 0 && (
                <Avatar className={cn(sizeClasses[size], 'ring-2 ring-white')}>
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                        +{remaining}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}

export default StudentPhoto;
