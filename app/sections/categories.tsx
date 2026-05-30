'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────
type Category = {
    id: string;
    name: string;
    image_url: string | null;
};

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ── Fetch categories from API ────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/categories');
                const json = await res.json();
                if (json.success && json.categories) {
                    setCategories(json.categories.filter((c: Category) => c.image_url));
                }
            } catch (err) {
                console.error('[Categories] Failed to load:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ── Active category name ─────────────────────────────────
    const activeName = activeIndex !== null ? categories[activeIndex]?.name : null;

    // ── Skeleton loader ──────────────────────────────────────
    if (loading) {
        return (
            <section className="relative z-10 w-full py-16 md:py-24 overflow-hidden bg-[#F5F2EB]">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="h-3 w-8 bg-black/10 rounded animate-pulse" />
                        <div className="h-5 w-48 bg-black/10 rounded animate-pulse" />
                    </div>
                    <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center gap-4 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[140px] h-[180px] md:w-[160px] md:h-[210px] bg-black/5 rounded animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="relative z-10 w-full py-16 md:py-24 overflow-hidden bg-[#F5F2EB]" dir="ltr">
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="flex items-start gap-6 mb-10">
                    <div>
                        <p className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold text-black/80 leading-relaxed whitespace-pre-line">
                            Explore Our Collection<br />
                            ©2026 SKNSCENE
                        </p>
                    </div>
                </div>

                {/* ── Scrollable strip ────────────────────────────── */}
                <div
                    ref={scrollRef}
                    className="flex items-center justify-start md:justify-center gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory touch-pan-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {categories.map((cat, idx) => {
                        const isActive = activeIndex === idx;

                        return (
                            <Link
                                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                                key={cat.id}
                                className="group relative z-10 flex-shrink-0 block snap-start"
                                onMouseEnter={() => setActiveIndex(idx)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {/* ── Category label (appears on hover/touch) ─── */}
                                <div
                                    className={`
                                        absolute -top-8 left-0 right-0 text-center
                                        transition-all duration-300 ease-out
                                        ${isActive
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-2'
                                        }
                                    `}
                                >
                                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-semibold text-black/70 whitespace-nowrap">
                                        {cat.name}
                                    </span>
                                </div>

                                {/* ── Image card ─────────────────────────────── */}
                                <div
                                    className={`
                                        relative overflow-hidden bg-[#F5F2EB]/50
                                        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                                        w-[180px] md:w-[240px]
                                        ${isActive ? 'shadow-xl z-10' : 'shadow-sm'}
                                    `}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cat.image_url!}
                                        alt={cat.name}
                                        className={`
                                            w-full h-auto
                                            transition-all duration-700 ease-out
                                            ${isActive ? 'scale-105' : 'scale-100 grayscale-[20%]'}
                                        `}
                                    />

                                    {/* Subtle overlay on inactive */}
                                    <div
                                        className={`
                                            absolute inset-0 bg-black/5
                                            transition-opacity duration-300
                                            ${isActive ? 'opacity-0' : 'opacity-100'}
                                        `}
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* ── Dynamic category label ────────────────────── */}
                <div className="mt-6 flex items-start gap-4 min-h-[48px]">
                    <div className="overflow-hidden">
                        <p
                            className={`
                                text-[11px] md:text-[12px] uppercase tracking-[0.2em] font-semibold leading-relaxed
                                transition-all duration-400 ease-out
                                ${activeName ? 'text-black/90' : 'text-black/50'}
                            `}
                        >
                            {activeName || ''}
                        </p>
                        <p className="text-[10px] text-black/30 mt-1 uppercase tracking-[0.15em]">
                            {activeName ? 'Tap to browse' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Hide scrollbar ──────────────────────────────────── */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
