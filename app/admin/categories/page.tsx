'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, Tag, ImageIcon, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = {
    id: string;
    name: string;
    image_url?: string | null;
    visible: boolean;
    created_at: string;
    updated_at: string;
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    // Dialog state
    const [showAdd, setShowAdd] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [deleteCat, setDeleteCat] = useState<Category | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formImage, setFormImage] = useState<File | null>(null);
    const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
    const [showInfo, setShowInfo] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // ── Fetch categories ──────────────────────────────────────────────────────

    const fetchCategories = useCallback(async () => {
        setFetchError(false);
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (data.success) {
                // Default visible to true if the column doesn't exist yet
                setCategories(data.categories.map((c: Category) => ({
                    ...c,
                    visible: c.visible ?? true,
                })));
            } else {
                setFetchError(true);
            }
        } catch {
            setFetchError(true);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchCategories(), 0);
        return () => clearTimeout(timer);
    }, [fetchCategories]);

    // ── Toggle visibility ─────────────────────────────────────────────────────

    const handleToggleVisibility = async (cat: Category) => {
        const newVisible = !cat.visible;

        // Optimistic update
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, visible: newVisible } : c));
        setTogglingIds(prev => new Set(prev).add(cat.id));

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: cat.id, visible: newVisible }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            // Update with server response
            setCategories(prev => prev.map(c => c.id === data.category.id ? data.category : c));
            toast.success(newVisible ? 'Category is now visible on storefront' : 'Category hidden from storefront', { duration: 2000 });
        } catch {
            // Revert on failure
            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, visible: cat.visible } : c));
            toast.error('Failed to update visibility');
        } finally {
            setTogglingIds(prev => {
                const next = new Set(prev);
                next.delete(cat.id);
                return next;
            });
        }
    };

    // ── Handle image selection ────────────────────────────────────────────────

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        if (formImagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(formImagePreview);
        }

        setFormImage(file);
        setFormImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        if (formImagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(formImagePreview);
        }
        setFormImage(null);
        setFormImagePreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    // ── Open Add dialog ───────────────────────────────────────────────────────

    const openAdd = () => {
        setFormName('');
        clearImage();
        setShowAdd(true);
    };

    // ── Open Edit dialog ──────────────────────────────────────────────────────

    const openEdit = (cat: Category) => {
        setFormName(cat.name);
        setFormImage(null);
        setFormImagePreview(cat.image_url || null);
        setEditCat(cat);
    };

    // ── Submit (Add / Edit) ───────────────────────────────────────────────────

    const handleSubmit = async () => {
        const trimmed = formName.trim();
        if (!trimmed) {
            toast.error('Category name is required');
            return;
        }

        setSubmitting(true);
        const toastId = toast.loading(editCat ? 'Updating…' : 'Creating…');

        try {
            const isEditing = !!editCat;
            const method = isEditing ? 'PATCH' : 'POST';

            const formData = new FormData();
            formData.append('name', trimmed);
            if (isEditing) formData.append('id', editCat!.id);
            if (formImage) formData.append('image', formImage);

            const res = await fetch('/api/admin/categories', {
                method,
                body: formData,
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            toast.success(isEditing ? 'Category updated' : 'Category created', { id: toastId, duration: 2000 });

            if (isEditing) {
                setCategories(prev => prev.map(c => c.id === data.category.id ? data.category : c));
                setEditCat(null);
            } else {
                setCategories(prev => [...prev, data.category]);
                setShowAdd(false);
                setFormName('');
                clearImage();
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        if (!deleteCat) return;
        setDeleting(true);
        const toastId = toast.loading('Deleting…');

        try {
            const res = await fetch(`/api/admin/categories?id=${deleteCat.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            toast.success('Category deleted', { id: toastId, duration: 2000 });
            setCategories(prev => prev.filter(c => c.id !== deleteCat.id));
            setDeleteCat(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete', { id: toastId });
        } finally {
            setDeleting(false);
        }
    };

    // ── Loading State ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading categories…</span>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-center">
                    <span className="text-[14px] font-medium text-stone-300">Could not load categories.</span>
                    <Button onClick={fetchCategories} variant="outline" className="border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div dir="ltr" className="text-white max-w-6xl mt-6">
            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">Catalog</div>
                    <h1 className="text-xl font-semibold text-white">Categories</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowInfo(true)}
                        className="px-3 py-1.5 text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md hover:bg-indigo-500/20 transition-colors"
                    >
                        Click here Lara
                    </button>
                    <Button
                        onClick={openAdd}
                        className="bg-white text-stone-900 hover:bg-stone-200 text-[13px] font-medium h-9 gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Category
                    </Button>
                </div>
            </div>

            {showInfo && <InfoDialog onClose={() => setShowInfo(false)} />}

            {/* ── Info banner ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg bg-stone-800/40 border border-stone-800/60">
                <Eye className="h-4 w-4 text-stone-400 flex-shrink-0" />
                <p className="text-[12px] text-stone-400 leading-relaxed">
                    Use the toggle to control which categories appear on your storefront. Hidden categories won&apos;t be visible to customers.
                </p>
            </div>

            {/* ── Empty State ──────────────────────────────────────────────── */}
            {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-stone-800/60 flex items-center justify-center mb-5">
                        <Tag className="h-7 w-7 text-stone-600" />
                    </div>
                    <h2 className="text-[15px] font-medium text-stone-300 mb-1.5">No categories yet</h2>
                    <p className="text-[13px] text-stone-500 text-center max-w-sm mb-6">
                        Categories help organize your products. Create your first category to get started.
                    </p>
                    <Button
                        onClick={openAdd}
                        className="bg-white text-stone-900 hover:bg-stone-200 text-[13px] font-medium h-9 gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Create First Category
                    </Button>
                </div>

            ) : (
                /* ── Cards Grid ────────────────────────────────────────────── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`group bg-stone-800/40 border rounded-xl overflow-hidden transition-all duration-150 ${cat.visible
                                    ? 'border-stone-800/60 hover:border-stone-700/60'
                                    : 'border-stone-800/30 opacity-60'
                                }`}
                        >
                            {/* Image */}
                            <div className="relative aspect-[16/10] bg-stone-800/60">
                                {cat.image_url ? (
                                    <Image
                                        src={cat.image_url}
                                        alt={cat.name}
                                        fill
                                        className={`object-cover transition-all duration-200 ${!cat.visible ? 'grayscale' : ''}`}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ImageIcon className="h-8 w-8 text-stone-700" />
                                    </div>
                                )}

                                {/* Hidden badge overlay */}
                                {!cat.visible && (
                                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                                        <EyeOff className="h-3 w-3 text-stone-400" />
                                        <span className="text-[10px] font-medium text-stone-400">Hidden</span>
                                    </div>
                                )}

                                {/* Hover overlay with actions */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-150 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => openEdit(cat)}
                                        className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setDeleteCat(cat)}
                                        className="h-8 w-8 rounded-lg bg-red-500/10 backdrop-blur-sm text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Info + Visibility Toggle */}
                            <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-[14px] font-medium text-stone-200 truncate">
                                        {cat.name}
                                    </h3>
                                    <p className="text-[11px] text-stone-500 mt-0.5">
                                        Created {new Date(cat.created_at).toLocaleDateString('en-US', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Visibility Switch */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Switch
                                        checked={cat.visible}
                                        onCheckedChange={() => handleToggleVisibility(cat)}
                                        disabled={togglingIds.has(cat.id)}
                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-stone-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Add / Edit Dialog ────────────────────────────────────────── */}
            <Dialog
                open={showAdd || !!editCat}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowAdd(false);
                        setEditCat(null);
                    }
                }}
            >
                <DialogContent dir="ltr" className="bg-stone-900 border-stone-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            {editCat ? 'Edit Category' : 'Add Category'}
                        </DialogTitle>
                        <DialogDescription className="text-stone-400">
                            {editCat
                                ? 'Update the category name and image.'
                                : 'Enter a name and optionally upload an image for this category.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="cat-name" className="text-stone-300 text-[13px]">
                                Category Name
                            </Label>
                            <Input
                                id="cat-name"
                                placeholder="e.g. Organic, Beverages, Snacks…"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                className="bg-stone-800/60 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-stone-600 h-10"
                                maxLength={60}
                                autoFocus
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-stone-300 text-[13px]">
                                Category Image
                            </Label>
                            {formImagePreview ? (
                                <div className="relative rounded-lg overflow-hidden border border-stone-700">
                                    <div className="relative aspect-[16/10]">
                                        <Image
                                            src={formImagePreview}
                                            alt="Preview"
                                            unoptimized
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full aspect-[16/10] rounded-lg border-2 border-dashed border-stone-700 hover:border-stone-600 bg-stone-800/30 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    <ImageIcon className="h-6 w-6 text-stone-600" />
                                    <span className="text-[12px] text-stone-500">Click to upload image</span>
                                    <span className="text-[10px] text-stone-600">PNG, JPG up to 5MB</span>
                                </button>
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 !bg-transparent border-t-stone-800">
                        <Button
                            variant="ghost"
                            onClick={() => { setShowAdd(false); setEditCat(null); }}
                            disabled={submitting}
                            className="text-stone-100 hover:text-white hover:bg-stone-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !formName.trim()}
                            className="bg-white !text-black cursor-pointer font-medium disabled:!opacity-100 disabled:bg-stone-800 disabled:!text-stone-500 hover:bg-stone-200"
                        >
                            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                            {editCat ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ──────────────────────────────────────── */}
            <AlertDialog
                open={!!deleteCat}
                onOpenChange={(open) => { if (!open) setDeleteCat(null); }}
            >
                <AlertDialogContent dir="ltr" className="bg-stone-900 border-stone-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Category</AlertDialogTitle>
                        <AlertDialogDescription className="text-stone-400">
                            Are you sure you want to delete <strong className="text-stone-300">{deleteCat?.name}</strong>?
                            This action cannot be undone and may affect products linked to this category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="!bg-transparent border-t-stone-800">
                        <AlertDialogCancel
                            disabled={deleting}
                            className="bg-transparent text-stone-400 border-stone-700 hover:bg-stone-800 hover:text-white"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
                        >
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoDialog({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-stone-900 border border-white/10 rounded-xl w-full max-w-4xl aspect-[4/3] md:aspect-video flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} dir="ltr">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                    <div className="text-left">
                        <h2 className="text-lg font-semibold text-white">Understanding Categories</h2>
                        <p className="text-xs text-white/40 mt-1">Your guide to organizing and structuring your products</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md transition-colors">
                        <X className="w-5 h-5 text-white/50" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 text-left">
                    <section>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-400" />
                            1. What is this page?
                        </h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                            This page allows you to organize your products into logical groups (like Cleansers, Serums, Moisturizers). Categories make it easier for customers to navigate the store and find what they are looking for quickly.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-emerald-400" />
                            2. Visibility Control
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                                <span className="text-xs text-white block mb-1">Visible Categories</span>
                                <span className="text-[11px] text-white/50">These categories are currently displayed in the shop. Customers can enter and view all products within them.</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                                <span className="text-xs text-white block mb-1">Hidden Categories</span>
                                <span className="text-[11px] text-white/50">Useful for preparing new launches or seasonal edits. They exist in your admin panel but are hidden from visitors.</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-orange-400" />
                            3. Helpful Tips
                        </h3>
                        <ul className="space-y-3 text-xs text-white/60">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-1.5 shrink-0" />
                                <div><strong className="text-white/80">Use clean imagery:</strong> Upload a representative image for each category to keep storefront browsing appealing and clear.</div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] mt-1.5 shrink-0" />
                                <div><strong className="text-white/80">Keep titles concise:</strong> Short, punchy names like &quot;Serums&quot; are far more effective than long sentences.</div>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
