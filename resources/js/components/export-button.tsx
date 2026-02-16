import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ExportButtonProps {
    exportUrl: string;
    filters?: Record<string, any>;
    buttonText?: string;
    buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({
    exportUrl,
    filters = {},
    buttonText = 'Export',
    buttonVariant = 'outline',
    buttonSize = 'default',
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (type: 'excel' | 'csv' | 'pdf') => {
        setIsExporting(true);

        // Build query params
        const params = new URLSearchParams();
        params.append('type', type);
        
        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                params.append(key, value.toString());
            }
        });

        // Create the export URL
        const fullUrl = `${exportUrl}?${params.toString()}`;

        // Trigger download
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = `export-${new Date().getTime()}.${type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            setIsExporting(false);
        }, 1000);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            {buttonText}
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
