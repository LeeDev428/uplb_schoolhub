import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, Image as ImageIcon, File } from 'lucide-react';

interface FileViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    filePath: string;
    fileType?: string; // MIME type
    fileName?: string; // Original file name
}

// Get file type category from MIME type
const getFileCategory = (mimeType?: string, fileName?: string): 'pdf' | 'image' | 'document' | 'unknown' => {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType?.includes('document') || mimeType?.includes('msword')) return 'document';
    
    // Fallback to file extension
    if (fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (['doc', 'docx'].includes(ext || '')) return 'document';
    }
    
    return 'unknown';
};

// Get icon for file type
const getFileIcon = (category: string) => {
    switch (category) {
        case 'pdf':
            return <FileText className="h-16 w-16 text-red-500" />;
        case 'image':
            return <ImageIcon className="h-16 w-16 text-blue-500" />;
        case 'document':
            return <FileText className="h-16 w-16 text-blue-600" />;
        default:
            return <File className="h-16 w-16 text-gray-500" />;
    }
};

export function FileViewer({ open, onOpenChange, title, filePath, fileType, fileName }: FileViewerProps) {
    const url = filePath.startsWith('/storage/') ? filePath : `/storage/${filePath}`;
    const fileCategory = getFileCategory(fileType, fileName || title);

    const renderContent = () => {
        switch (fileCategory) {
            case 'pdf':
                return (
                    <object
                        data={url}
                        type="application/pdf"
                        className="w-full h-full rounded-lg border"
                    >
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                            {getFileIcon('pdf')}
                            <p className="text-muted-foreground text-center">
                                Unable to display PDF. Your browser may not support inline PDF viewing.
                            </p>
                            <Button asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    Open PDF in New Tab
                                </a>
                            </Button>
                        </div>
                    </object>
                );
            
            case 'image':
                return (
                    <div className="w-full h-full flex items-center justify-center overflow-auto bg-muted/20 rounded-lg border">
                        <img
                            src={url}
                            alt={title}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `
                                    <div class="flex flex-col items-center gap-4 p-8">
                                        <p class="text-muted-foreground">Unable to load image.</p>
                                    </div>
                                `;
                            }}
                        />
                    </div>
                );
            
            case 'document':
                return (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-muted/20 rounded-lg border">
                        {getFileIcon('document')}
                        <p className="text-lg font-medium">{fileName || title}</p>
                        <p className="text-muted-foreground text-center">
                            Document preview is not available. Please download or open the file.
                        </p>
                        <div className="flex gap-4">
                            <Button asChild>
                                <a href={url} download={fileName}>
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
                );
            
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-muted/20 rounded-lg border">
                        {getFileIcon('unknown')}
                        <p className="text-lg font-medium">{fileName || title}</p>
                        <p className="text-muted-foreground text-center">
                            File preview is not available. Please download or open the file.
                        </p>
                        <div className="flex gap-4">
                            <Button asChild>
                                <a href={url} download={fileName}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between gap-4 border-b pb-4">
                    <DialogTitle className="truncate flex items-center gap-2">
                        {getFileIcon(fileCategory)}
                        <span className="ml-2">{title}</span>
                    </DialogTitle>
                    <div className="flex gap-2 mr-8">
                        <Button variant="outline" size="sm" asChild>
                            <a href={url} download={fileName || title}>
                                <Download className="mr-1 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Open
                            </a>
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 min-h-0 mt-4">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Re-export as PdfViewer for backward compatibility
export function PdfViewer(props: FileViewerProps) {
    return <FileViewer {...props} />;
}
