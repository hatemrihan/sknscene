import React from 'react';
import Link from 'next/link';
import { ProductsGrid, Product } from './products-client';
import { supabaseAdmin } from '@/lib/supabase';

export default async function Products() {
    let products: Product[] = [];
    try {
        // Direct query instead of cached model function — ensures fresh data every request
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('id, slug, name, price, original_price, main_image, images, is_active')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(8);

        if (error) {
            console.error('[Products Server] Supabase error:', error.message);
        } else {
            products = (data || []).map(p => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                original_price: p.original_price,
                main_image: p.main_image,
                images: p.images || [],
                is_active: p.is_active
            }));
        }
    } catch (err) {
        console.error('[Products Server] Failed to fetch products:', err);
    }

    if (products.length === 0) return null;

    return (
        <section className="relative z-10 w-full py-16 md:py-24 bg-white" dir="ltr">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                {/* ── Section header ──────────────────────────────── */}
                <div className="flex items-center justify-center mb-10 text-center">
                    <h2 className="text-[clamp(1.6rem,3.5vw,3rem)] text-[#3D2314] font-light tracking-tighter leading-[1]">
                        New <span className="italic font-normal">Arrivals</span>
                    </h2>
                </div>

                {/* ── Products Grid ────────────────────────────────── */}
                <ProductsGrid products={products} />

                {/* ── View All link ────────────────────────────────── */}
                <div className="flex justify-center mt-12 md:mt-16">
                    <Link
                        href="/shop"
                        className="group inline-flex items-center gap-1.5 text-[17px] font-light tracking-tighter text-[#3D2314] hover:opacity-80 transition-opacity duration-300"
                    >
                        <span>View All <span className="italic font-normal">Products</span></span>
                        <svg
                            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 text-[#3D2314]/80"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
