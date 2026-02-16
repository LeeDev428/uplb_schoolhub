import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportButtonProps {
    importUrl: string;
    templateUrl?: string;
    buttonText?: string;
    buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
    acceptedFormats?: string;
    title?: string;
    description?: string;
}

export function ImportButton({
    importUrl,
    templateUrl,
    buttonText = 'Import',
    buttonVariant = 'outline',
    buttonSize = 'default',
    acceptedFormats = '.xlsx,.xls,.csv',
    title = 'Import Data',
    description = 'Upload a file to import data. Download the template for the correct format.',
}: ImportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setSuccess(null);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setError('Please select a file to import');
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            router.post(importUrl, formData, {
                forceFormData: true,
                onSuccess: () => {
                    setSuccess('Data imported successfully!');
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    setTimeout(() => {
                        setIsOpen(false);
                        setSuccess(null);
                    }, 2000);
                },
                onError: (errors) => {
                    const errorMessage = Object.values(errors).flat().join(', ');
                    setError(errorMessage || 'Failed to import data. Please check your file and try again.');
                },
                onFinish: () => {
                    setIsUploading(false);
                },
            });
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        if (templateUrl) {
            window.location.href = templateUrl;
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setIsOpen(false);
            setSelectedFile(null);
            setError(null);
            setSuccess(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button variant={buttonVariant} size={buttonSize}>
                    <Upload className="h-4 w-4 mr-2" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {templateUrl && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Download Template</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                            >
                                Download
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="import-file">Select File</Label>
                        <Input
                            id="import-file"
                            ref={fileInputRef}
                            type="file"
                            accept={acceptedFormats}
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        {selectedFile && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Accepted formats: {acceptedFormats.split(',').join(', ')}
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">{success}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleImport}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? 'Importing...' : 'Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
