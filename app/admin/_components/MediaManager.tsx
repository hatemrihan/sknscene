"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { X, Film, GripVertical, ArrowLeft, ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";

// ─── Types ────────────────────────────────────────────────────

interface MediaManagerProps {
    mainImage: string;
    images: string[];
    videos: string[];
    onMainImageChange: (url: string) => void;
    onImagesChange: (images: string[]) => void;
    onVideosChange: (videos: string[]) => void;
    onUploadError?: (msg: string) => void;
    error?: string;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Manages product media (images + videos) for the product form.
 * Supports drag-and-drop reordering + arrow buttons for images.
 * The first image is always the "main" image.
 */
export const MediaManager: React.FC<MediaManagerProps> = ({
    mainImage,
    images,
    videos,
    onMainImageChange,
    onImagesChange,
    onVideosChange,
    onUploadError,
    error,
}) => {
    // Combine main + additional into one ordered list for reordering
    const allImages = mainImage ? [mainImage, ...images] : [...images];
    const totalMedia = allImages.length + videos.length;

    // Drag state
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragNode = useRef<HTMLDivElement | null>(null);

    const handleUpload = (url: string, isVideo = false) => {
        if (isVideo) {
            onVideosChange([...videos, url]);
        } else if (!mainImage) {
            onMainImageChange(url);
        } else {
            onImagesChange([...images, url]);
        }
    };

    // ── Reorder helpers ─────────────────────────────────────
    const applyNewOrder = (newAll: string[]) => {
        if (newAll.length === 0) {
            onMainImageChange("");
            onImagesChange([]);
        } else {
            onMainImageChange(newAll[0]);
            onImagesChange(newAll.slice(1));
        }
    };

    const moveImage = (fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx) return;
        const newAll = [...allImages];
        const [moved] = newAll.splice(fromIdx, 1);
        newAll.splice(toIdx, 0, moved);
        applyNewOrder(newAll);
    };

    const removeImage = (idx: number) => {
        const newAll = allImages.filter((_, i) => i !== idx);
        applyNewOrder(newAll);
    };

    const setAsMain = (idx: number) => {
        if (idx === 0) return;
        moveImage(idx, 0);
    };

    // ── Drag handlers ───────────────────────────────────────
    const handleDragStart = (e: React.DragEvent, idx: number) => {
        setDragIndex(idx);
        dragNode.current = e.currentTarget as HTMLDivElement;
        e.dataTransfer.effectAllowed = "move";
        // Make drag image semi-transparent
        setTimeout(() => {
            if (dragNode.current) dragNode.current.style.opacity = "0.4";
        }, 0);
    };

    const handleDragEnter = (idx: number) => {
        if (dragIndex === null || dragIndex === idx) return;
        setDragOverIndex(idx);
    };

    const handleDragEnd = () => {
        if (dragNode.current) dragNode.current.style.opacity = "1";
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            moveImage(dragIndex, dragOverIndex);
        }
        setDragIndex(null);
        setDragOverIndex(null);
        dragNode.current = null;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-white text-sm font-medium">
                    Product Media
                </Label>
                {totalMedia > 0 && (
                    <Badge
                        variant="secondary"
                        className="bg-stone-800 text-stone-300 border-stone-700 text-xs"
                    >
                        {totalMedia} file{totalMedia !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* Upload zone */}
            <FileUpload
                onUpload={handleUpload}
                onError={onUploadError}
                accept="image/*,video/*"
            />

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Reorder hint */}
            {allImages.length > 1 && (
                <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <GripVertical className="h-3 w-3" />
                    Drag to reorder. First image = main product image.
                </p>
            )}

            {/* Images grid — reorderable */}
            {allImages.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-stone-400">
                        Images
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {allImages.map((img, index) => {
                            const isMain = index === 0;
                            const isDragOver = dragOverIndex === index;
                            return (
                                <div
                                    key={`img-${index}-${img.slice(-20)}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={handleDragEnd}
                                    className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${isMain
                                        ? "border-white/40 ring-1 ring-white/10"
                                        : isDragOver
                                            ? "border-blue-500/60 scale-[1.03]"
                                            : "border-stone-700 hover:border-stone-500"
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={isMain ? "Main product image" : `Product image ${index + 1}`}
                                        width={160}
                                        height={120}
                                        className="w-full h-24 object-cover pointer-events-none"
                                        draggable={false}
                                    />

                                    {/* Grip handle */}
                                    <div className="absolute top-1 left-1 bg-black/60 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-3.5 w-3.5 text-white/70" />
                                    </div>

                                    {/* Delete button */}
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>

                                    {/* Main badge */}
                                    {isMain && (
                                        <Badge className="absolute bottom-1 left-1 bg-white/90 text-stone-900 text-[10px] px-1.5 py-0 h-4">
                                            Main
                                        </Badge>
                                    )}

                                    {/* Order controls + Set as main */}
                                    <div className="absolute bottom-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isMain && (
                                            <button
                                                type="button"
                                                onClick={() => setAsMain(index)}
                                                title="Set as main image"
                                                className="bg-black/70 hover:bg-black/90 rounded p-1 transition-colors"
                                            >
                                                <Star className="h-3 w-3 text-yellow-400" />
                                            </button>
                                        )}
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => moveImage(index, index - 1)}
                                                title="Move left"
                                                className="bg-black/70 hover:bg-black/90 rounded p-1 transition-colors"
                                            >
                                                <ArrowLeft className="h-3 w-3 text-white" />
                                            </button>
                                        )}
                                        {index < allImages.length - 1 && (
                                            <button
                                                type="button"
                                                onClick={() => moveImage(index, index + 1)}
                                                title="Move right"
                                                className="bg-black/70 hover:bg-black/90 rounded p-1 transition-colors"
                                            >
                                                <ArrowRight className="h-3 w-3 text-white" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Position indicator */}
                                    <div className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[9px] text-white/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        {index + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-stone-400">
                        Videos
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                        {videos.map((vid, index) => (
                            <div
                                key={`vid-${index}`}
                                className="relative group rounded-lg overflow-hidden border border-stone-700"
                            >
                                <video
                                    src={vid}
                                    className="w-full h-24 object-cover"
                                    muted
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                        onVideosChange(
                                            videos.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <Badge className="absolute bottom-1 left-1 bg-white/90 text-stone-900 text-[10px] px-1.5 py-0 h-4">
                                    <Film className="h-2.5 w-2.5 mr-0.5" />
                                    Video
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {totalMedia === 0 && (
                <p className="text-xs text-stone-500">
                    No media uploaded yet. The first image will automatically become the main product image.
                </p>
            )}
        </div>
    );
};
