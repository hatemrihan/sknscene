import React from 'react';
import Link from 'next/link';
import { getActiveProducts } from '@/models/product';
import { ProductsGrid, Product } from './products-client';

export default async function Products() {
    let products: Product[] = [];
    try {
        const res = await getActiveProducts({ limit: 8, sort: 'newest', includeImages: true });
        // Map data safely and cast as needed
        products = res.products.map(p => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            original_price: p.original_price,
            main_image: p.main_image,
            images: p.images || [],
            is_active: p.is_active
        }));
    } catch (err) {
        console.error('[Products Server] Failed to fetch products:', err);
    }

    if (products.length === 0) return null;

    return (
        <section className="relative z-10 w-full py-16 md:py-24 bg-[#F5F2EB]" dir="ltr">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* ── Section header ──────────────────────────────── */}
                <div className="flex items-center justify-center gap-6 mb-10 text-center">
                    <div>
                        <p className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-900/80 leading-relaxed whitespace-pre-line">
                            New Arrivals<br />Shop the Latest, FROM SKNSCENE
                        </p>
                    </div>
                </div>

                {/* ── Products Grid ────────────────────────────────── */}
                <ProductsGrid products={products} />

                {/* ── View All link ────────────────────────────────── */}
                <div className="flex justify-center mt-12 md:mt-16">
                    <Link
                        href="/shop"
                        className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-600 hover:text-stone-950 transition-colors duration-300"
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
