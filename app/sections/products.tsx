'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────
type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    main_image: string;
    images: string[];
    is_active: boolean;
};

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // ── Fetch products from API ──────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/products?limit=8&sort=newest');
                const json = await res.json();
                if (json.success && json.products) {
                    setProducts(json.products);
                }
            } catch (err) {
                console.error('[Products] Failed to load:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ── Skeleton loader ──────────────────────────────────────
    if (loading) {
        return (
            <section className="relative z-10 w-full py-16 md:py-24 bg-[#F5F2EB]" dir="ltr">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="h-3 w-8 bg-black/5 rounded animate-pulse" />
                        <div className="h-5 w-48 bg-black/5 rounded animate-pulse" />
                    </div>
                    <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:justify-center gap-4 md:gap-x-6 gap-y-10 pb-6 snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-3 flex-none w-[60vw] sm:w-[40vw] md:flex-initial md:w-[calc(25%-18px)] snap-start">
                                <div className="aspect-[3/4] bg-black/[0.03] rounded animate-pulse" />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className="h-3 w-24 bg-black/5 rounded animate-pulse" />
                                    <div className="h-3 w-12 bg-black/5 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="relative z-10 w-full py-16 md:py-24 bg-[#F5F2EB] " dir="ltr">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* ── Section header ──────────────────────────────── */}
                <div className="flex items-center justify-center gap-6 mb-10 text-center">
                    <div>
                        <p className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold text-black/80 leading-relaxed whitespace-pre-line">
                            New Arrivals<br />Shop the Latest, FROM SKNSCENE
                        </p>
                    </div>
                </div>

                {/* ── Products Grid ────────────────────────────────── */}
                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:justify-center gap-4 md:gap-x-6 md:gap-y-12 pb-6 snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0">
                    {products.map((product) => {
                        const isHovered = hoveredId === product.id;
                        const secondImage = product.images?.[1] || product.images?.[0];
                        const displayImage = isHovered && secondImage ? secondImage : (product.main_image || product.images?.[0]);

                        return (
                            <Link
                                href={`/shop/${product.slug || product.id}`}
                                key={product.id}
                                className="group relative z-10 block flex-none w-[60vw] sm:w-[40vw] md:flex-initial md:w-[calc(25%-18px)] snap-start"
                                onMouseEnter={() => setHoveredId(product.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* ── Image ─────────────────────────────── */}
                                <div className="relative overflow-hidden bg-[#f5f3f0] mb-3 flex items-center justify-center">
                                    {displayImage ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={displayImage}
                                                alt={product.name}
                                                className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                                loading="lazy"
                                            />
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[11px] text-black/20 uppercase tracking-wider">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Info row ──────────────────────────── */}
                                <div className="flex flex-col items-center text-center gap-1">
                                    <h3 className="text-[12px] md:text-[13px] font-medium text-black/80 leading-tight truncate w-full">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-1.5 flex-shrink-0">
                                        {product.original_price && product.original_price > product.price && (
                                            <span className="text-[11px] text-black/30 line-through">
                                                {product.original_price.toLocaleString()} USD
                                            </span>
                                        )}
                                        <span className="text-[12px] md:text-[13px] font-medium text-black/60 tabular-nums">
                                            {product.price.toLocaleString()} USD
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* ── View All link ────────────────────────────────── */}
                <div className="flex justify-center mt-12 md:mt-16">
                    <Link
                        href="/shop"
                        className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] font-semibold text-black/60 hover:text-black transition-colors duration-300"
                    >
                        <span>View All Products</span>
                        <svg
                            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
