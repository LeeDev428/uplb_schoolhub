import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { useState } from 'react';

interface ImageViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    imagePath: string;
}

export function ImageViewer({ open, onOpenChange, title, imagePath }: ImageViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const url = imagePath.startsWith('/storage/') ? imagePath : `/storage/${imagePath}`;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(100);
        setRotation(0);
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) handleReset();
            onOpenChange(newOpen);
        }}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>{title}</DialogTitle>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 border rounded-md p-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= 25}
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm px-2 min-w-[4rem] text-center">{zoom}%</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= 200}
                                    title="Zoom In"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRotate}
                                title="Rotate"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                title="Reset"
                            >
                                Reset
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a href={url} download={title}>
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-auto bg-muted/20 rounded-lg flex items-center justify-center">
                    <img
                        src={url}
                        alt={title}
                        className="max-w-full transition-transform duration-200"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transformOrigin: 'center'
                        }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                    <div class="flex flex-col items-center gap-4 p-8">
                                        <p class="text-muted-foreground">Unable to load image.</p>
                                        <p class="text-sm text-muted-foreground">The image file may be corrupted or in an unsupported format.</p>
                                    </div>
                                `;
                            }
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
