'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ShopProduct } from '../_types/shop';

type Props = {
    product: ShopProduct;
    lowStockThreshold?: number;
    priority?: boolean;
};

/**
 * Product card — minimal, clean, with variant color swatches.
 * Aspect ratio 3:4 like the JAYASH reference.
 */
export const ProductCard = memo(function ProductCard({ product, lowStockThreshold = 5, priority = false }: Props) {
    const hasDiscount = product.original_price && product.original_price > product.price;

    // Determine stock status from variants or product-level stock
    const getStatus = (): 'pre-order' | 'sold-out' | null => {
        const hasStock = product.variants?.length
            ? product.variants.some(v => v.stock > 0)
            : product.stock > 0;

        if (!hasStock) {
            if (product.show_preorder_badge) return 'pre-order';
            if (product.show_out_of_stock_badge) return 'sold-out';
            return 'sold-out';
        }
        return null;
    };

    const statusLabel: Record<string, string> = {
        'pre-order': "Pre-order",
        'sold-out': "Sold out",
    };

    const status = getStatus();

    // Low stock indicator (when <= lowStockThreshold and in stock)
    const totalStock = product.variants?.length
        ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : product.stock || 0;

    return (
        <Link
            href={`/shop/${product.slug}`}
            className="group block focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg p-1 transition-all"
        >
            {/* ── Image ────────────────────────────────────────── */}
            <div className="relative mb-4 aspect-[3/4] overflow-hidden flex items-center justify-center bg-[#ECE8DA]/35 rounded-lg border border-stone-200/40">
                {/* Status badge */}
                {status && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            variant="secondary"
                            className="bg-stone-950 text-stone-100 text-[11px] px-2.5 py-1 font-medium tracking-wide uppercase rounded-sm border-none shadow-sm"
                        >
                            {statusLabel[status]}
                        </Badge>
                    </div>
                )}

                {/* Discount badge */}
                {hasDiscount && !status && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge
                            className="bg-[#E11D00] hover:bg-[#E11D00] text-white text-[11px] px-2 py-0.5 font-bold rounded-sm border-none shadow-sm"
                        >
                            {product.discount ? `-${product.discount}%` : "Sale"}
                        </Badge>
                    </div>
                )}

                {product.main_image ? (
                    <Image
                        src={product.main_image}
                        alt={product.name}
                        fill
                        unoptimized={product.main_image.startsWith('blob:')}
                        className="object-contain group-hover:scale-105 transition-transform duration-500 p-4"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={priority}
                        quality={85}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ── Info ──────────────────────────────────────────── */}
            <div className="space-y-1.5 px-1">
                {/* Name */}
                <h3 className="text-sm font-medium text-stone-950 leading-snug line-clamp-2 group-hover:text-[#E11D00] transition-colors duration-200">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <p className="text-sm text-stone-950 font-semibold font-sans">
                        {product.price.toLocaleString('en-US')} USD
                    </p>
                    {hasDiscount && (
                        <>
                            <p className="text-xs text-stone-500 font-sans line-through">
                                {product.original_price?.toLocaleString('en-US')} USD
                            </p>
                        </>
                    )}
                </div>

                {/* Low stock warning */}
                {totalStock > 0 && totalStock <= lowStockThreshold && !status && (
                    <p className="text-[11px] text-[#E11D00] font-semibold pt-0.5">
                        Only {totalStock} left
                    </p>
                )}
            </div>
        </Link>
    );
});
