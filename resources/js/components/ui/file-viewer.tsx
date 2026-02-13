import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { PdfViewer } from './pdf-viewer';
import { ImageViewer } from './image-viewer';

interface FileViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    filePath: string;
    fileType?: string; // MIME type
    fileName?: string; // Original file name
}

// Get file type category from MIME type, file name, or stored path extension
const getFileCategory = (mimeType?: string, fileName?: string, filePath?: string): 'pdf' | 'image' | 'other' => {
    // 1. Check MIME type first (most reliable, set by server-side finfo detection)
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    
    // 2. Fallback to original file name extension
    if (fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image';
        if (ext === 'pdf') return 'pdf';
    }

    // 3. Fallback to stored file path extension
    if (filePath) {
        const ext = filePath.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image';
        if (ext === 'pdf') return 'pdf';
    }
    
    return 'other';
};

export function FileViewer({ open, onOpenChange, title, filePath, fileType, fileName }: FileViewerProps) {
    const fileCategory = getFileCategory(fileType, fileName || title, filePath);
    const url = filePath.startsWith('/storage/') ? filePath : `/storage/${filePath}`;

    // Use specialized viewers for PDF and images
    if (fileCategory === 'pdf') {
        return (
            <PdfViewer
                open={open}
                onOpenChange={onOpenChange}
                title={title}
                filePath={filePath}
            />
        );
    }

    if (fileCategory === 'image') {
        return (
            <ImageViewer
                open={open}
                onOpenChange={onOpenChange}
                title={title}
                imagePath={filePath}
            />
        );
    }

    // Generic file viewer for other file types
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                    <FileText className="h-16 w-16 text-gray-500" />
                    <p className="text-lg font-medium">{fileName || title}</p>
                    <p className="text-muted-foreground text-center">
                        This file cannot be previewed in the browser. Please download or open it.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild>
                            <a href={url} download={fileName || title}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
