"use client";

import React, { useRef, useState } from "react";
import { Image as X, Paperclip, Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
    label?: string;
    accept?: string;
    onUpload?: (url: string, isVideo?: boolean) => void;
    onError?: (msg: string) => void;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    error?: string;
    url?: string;
}

export default function FileUpload({ label, accept = "*", onUpload, onError }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const uploadFile = async (file: File, id: string) => {
        setUploadingFiles(prev => [...prev, { id, file, progress: 0 }]);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucket', 'products');

            const isVideo = file.type.startsWith('video/');

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            // Success
            setUploadingFiles(prev =>
                prev.map(f => f.id === id ? { ...f, progress: 100, url: data.url } : f)
            );

            onUpload?.(data.url, isVideo);

            // Remove from local "uploading" list after a brief delay so they join the MediaManager list
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f => f.id !== id));
            }, 1000);

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            onError?.(`Failed to upload ${file.name}: ${msg}`);
            setUploadingFiles(prev =>
                prev.map(f => f.id === id ? { ...f, error: msg } : f)
            );
        }
    };

    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);

        newFiles.forEach(file => {
            if (file.size > 50 * 1024 * 1024) {
                onError?.(`File ${file.name} exceeds 50MB limit`);
                return;
            }

            const id = Math.random().toString(36).substring(7);
            uploadFile(file, id);
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const removeFailedUpload = (id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="w-full space-y-6">
            {label && <label className="block text-sm font-medium text-stone-300">{label}</label>}

            {/* Dropzone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full py-10 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center text-center 
                    ${isDragging ? 'border-white bg-stone-800' : 'border-stone-700 bg-stone-900/50 hover:bg-stone-800 hover:border-stone-500'}`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    multiple
                    onChange={handleFileChange}
                />
                <Upload className="h-5 w-5 text-stone-300 mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">Click or drag files here</h3>
                <p className="text-xs text-stone-500">Maximum 50 MB per file</p>
            </div>

            {/* Display actively uploading files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-stone-300">Uploading...</h4>
                    <div className="flex flex-col gap-2">
                        {uploadingFiles.map((f) => (
                            <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-700 bg-stone-800/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {f.error ? (
                                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                    ) : f.progress === 100 ? (
                                        <Paperclip className="h-4 w-4 text-green-400 shrink-0" />
                                    ) : (
                                        <Loader2 className="h-4 w-4 text-stone-400 shrink-0 animate-spin" />
                                    )}
                                    <span className={`text-sm font-medium truncate ${f.error ? 'text-red-400' : 'text-stone-200'}`}>
                                        {f.file.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    <span className="text-xs text-stone-400">{formatSize(f.file.size)}</span>
                                    {f.error && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-400 hover:text-white" onClick={() => removeFailedUpload(f.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
