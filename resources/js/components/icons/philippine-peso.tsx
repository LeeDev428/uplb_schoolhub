import { forwardRef, SVGAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PhilippinePesoProps extends SVGAttributes<SVGSVGElement> {
    size?: number | string;
}

/**
 * PhilippinePeso icon component - a ₱ symbol styled like Lucide icons.
 */
export const PhilippinePeso = forwardRef<SVGSVGElement, PhilippinePesoProps>(
    ({ className, size = 24, ...props }, ref) => {
        return (
            <svg
                ref={ref}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn('lucide', className)}
                {...props}
            >
                {/* P shape with two horizontal bars for ₱ */}
                <path d="M6 3v18" />
                <path d="M6 3h6a5 5 0 0 1 0 10H6" />
                <path d="M4 8h14" />
                <path d="M4 11h14" />
            </svg>
        );
    }
);

PhilippinePeso.displayName = 'PhilippinePeso';

export default PhilippinePeso;
