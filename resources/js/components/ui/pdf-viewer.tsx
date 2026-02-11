import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface PdfViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    filePath: string;
}

export function PdfViewer({ open, onOpenChange, title, filePath }: PdfViewerProps) {
    const url = `/storage/${filePath}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col">
                <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between gap-4">
                    <DialogTitle className="truncate">{title}</DialogTitle>
                    <div className="flex gap-2 mr-8">
                        <Button variant="outline" size="sm" asChild>
                            <a href={url} download>
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
                <div className="flex-1 min-h-0">
                    <object
                        data={url}
                        type="application/pdf"
                        className="w-full h-full rounded-lg border"
                    >
                        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
