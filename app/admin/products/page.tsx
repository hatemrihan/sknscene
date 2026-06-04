'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, Package, Plus, Search, Trash2, Pencil, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// ── Types ─────────────────────────────────────────────────────

type ProductListItem = {
    id: string;
    name: string;
    price: number;
    stock: number;
    categories: string[];
    main_image: string;
    images: string[];
    is_active: boolean;
    created_at: string;
};

// ── Page ──────────────────────────────────────────────────────

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [deleteProduct, setDeleteProduct] = useState<ProductListItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch('/api/admin/products?sort=custom');
            const data = await res.json();
            if (data.success) {
                setProducts(data.products ?? []);
            } else {
                throw new Error("Failed to load products");
            }
        } catch {
            setError('Failed to load products');
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 0);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleDelete = async () => {
        if (!deleteProduct) return;
        setDeleting(true);
        const toastId = toast.loading('Deleting product…');
        try {
            const res = await fetch(`/api/admin/products/${deleteProduct.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success('Product deleted', { id: toastId, duration: 2000 });
            setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
            setDeleteProduct(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete', { id: toastId });
        } finally {
            setDeleting(false);
        }
    };

    const filtered = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        ),
        [products, search]);

    // ── Loading ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading products…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                        <Package className="h-7 w-7 text-red-500" />
                    </div>
                    <h2 className="text-[15px] font-medium text-stone-300 mb-1.5">Error Details</h2>
                    <p className="text-[13px] text-red-400 max-w-sm mb-6">
                        {error}
                    </p>
                    <Button onClick={() => { setLoading(true); fetchProducts(); }} className="bg-white text-stone-900 hover:bg-stone-200 text-[13px] font-medium h-9 gap-1.5">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white max-w-6xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">Catalog</div>
                    <h1 className="text-xl font-semibold text-white">Products</h1>
                </div>
                <Button asChild className="bg-white text-stone-900  text-[13px] font-medium h-9 gap-1.5">
                    <Link href={`/admin/product/add-product`}>
                        <Plus className="h-3.5 w-3.5" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {/* Empty state */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-stone-800/60 flex items-center justify-center mb-5">
                        <Package className="h-7 w-7 text-stone-600" />
                    </div>
                    <h2 className="text-[15px] font-medium text-stone-300 mb-1.5">No products yet</h2>
                    <p className="text-[13px] text-stone-500 text-center max-w-sm mb-6">
                        Start building your catalog by adding your first product.
                    </p>
                    <Button asChild className="bg-white text-stone-900 hover:bg-stone-900 hover:text-stone-100 text-[13px] font-medium h-9 gap-1.5">
                        <Link href={`/admin/product/add-product`}>
                            <Plus className="h-3.5 w-3.5" />
                            Add First Product
                        </Link>
                    </Button>
                </div>
            ) : (
                <>
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                        <Input
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-stone-800/60 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-stone-600 h-10"
                        />
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-stone-800/40 border border-stone-800/60 rounded-xl overflow-hidden hover:border-stone-700/60 transition-all duration-150"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-stone-800/60">
                                    {(product.main_image || product.images?.[0]) ? (
                                        <Image
                                            src={product.main_image || product.images[0]}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover"
                                            unoptimized={(product.main_image || product.images?.[0] || '').startsWith('blob:')}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-stone-700" />
                                        </div>
                                    )}

                                    {/* Hover actions */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-150 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <Button size="icon" variant="ghost" asChild className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:text-white">
                                            <Link href={`/admin/product/edit-product/${product.id}`}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setDeleteProduct(product)}
                                            className="h-8 w-8 rounded-lg bg-red-500/10 backdrop-blur-sm text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    {/* Visibility badge */}
                                    {!product.is_active && (
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                                            Hidden
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="px-4 py-3.5">
                                    <h3 className="text-[14px] font-medium text-stone-200 truncate">{product.name}</h3>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-[13px] font-semibold text-white tabular-nums">
                                            {(product.price ?? 0).toLocaleString()} USD
                                        </span>
                                        <span className={`text-[11px] ${product.stock > 5 ? 'text-green-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {product.stock > 5 ? `${product.stock} in stock` : product.stock > 0 ? `Low stock: ${product.stock} left` : 'Out of stock'}
                                        </span>
                                    </div>
                                    {product.categories?.[0] && (
                                        <span className="text-[11px] text-stone-500 mt-1 block">{product.categories[0]}</span>
                                    )}
                                </div>

                                {/* Action buttons — always visible (critical for mobile/touch) */}
                                <div className="px-4 pb-3.5 flex gap-2">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="flex-1 h-8 text-[12px] font-medium rounded-lg bg-stone-700/50 text-stone-300 hover:bg-stone-700 hover:text-white gap-1.5"
                                    >
                                        <Link href={`/admin/product/edit-product/${product.id}`}>
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setDeleteProduct(product)}
                                        className="flex-1 h-8 text-[12px] font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 gap-1.5"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && search && (
                        <div className="text-center py-12">
                            <Search className="h-6 w-6 text-stone-600 mx-auto mb-3" />
                            <p className="text-[13px] text-stone-500">No products match &quot;{search}&quot;</p>
                        </div>
                    )}
                </>
            )}

            {/* Delete dialog */}
            <AlertDialog open={!!deleteProduct} onOpenChange={(o) => { if (!o) setDeleteProduct(null); }}>
                <AlertDialogContent className="bg-stone-900 border-stone-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
                        <AlertDialogDescription className="text-stone-400">
                            Are you sure you want to delete <strong className="text-stone-300">{deleteProduct?.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="bg-stone-900 text-white border-t border-stone-800 pt-3">
                        <AlertDialogCancel disabled={deleting} className="bg-transparent text-stone-400 border-stone-700 hover:bg-stone-800 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25">
                            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
