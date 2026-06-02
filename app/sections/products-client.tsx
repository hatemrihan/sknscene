'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    main_image: string;
    images: string[];
    is_active: boolean;
};

type CardProps = {
    product: Product;
    priority?: boolean;
};

const ProductCardHome = memo(function ProductCardHome({ product, priority = false }: CardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const secondImage = product.images?.[1] || product.images?.[0];
    const displayImage = isHovered && secondImage ? secondImage : (product.main_image || product.images?.[0]);

    return (
        <Link
            href={`/shop/${product.slug || product.id}`}
            className="group relative z-10 block flex-none w-[60vw] sm:w-[40vw] md:flex-initial md:w-[calc(25%-18px)] snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 rounded-lg p-0.5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ── Image ─────────────────────────────── */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ECE8DA]/35 mb-3 flex items-center justify-center rounded-lg border border-stone-200/40">
                {displayImage ? (
                    <Image
                        src={displayImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 60vw, (max-width: 768px) 40vw, 25vw"
                        className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] p-4"
                        priority={priority}
                        quality={85}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] text-stone-400 uppercase tracking-wider font-sans">No Image</span>
                    </div>
                )}
            </div>

            {/* ── Info row ──────────────────────────── */}
            <div className="flex flex-col items-center text-center gap-1 px-1">
                <h3 className="text-[12px] md:text-[13px] font-medium text-stone-950 leading-tight truncate w-full group-hover:text-[#E11D00] transition-colors duration-200">
                    {product.name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 flex-shrink-0">
                    {product.original_price && product.original_price > product.price && (
                        <span className="text-[11px] text-stone-400 line-through font-sans">
                            {product.original_price.toLocaleString()} USD
                        </span>
                    )}
                    <span className="text-[12px] md:text-[13px] font-semibold text-stone-800 tabular-nums font-sans">
                        {product.price.toLocaleString()} USD
                    </span>
                </div>
            </div>
        </Link>
    );
});

type GridProps = {
    products: Product[];
};

export const ProductsGrid = memo(function ProductsGrid({ products }: GridProps) {
    return (
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:justify-center gap-4 md:gap-x-6 md:gap-y-12 pb-6 snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0">
            {products.map((product, idx) => (
                <ProductCardHome
                    key={product.id}
                    product={product}
                    priority={idx < 4}
                />
            ))}
        </div>
    );
});
