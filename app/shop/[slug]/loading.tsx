'use client';

import Nav from '@/app/sections/nav';

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-white">
            <Nav />

            <div className="pt-20">
                <div className="max-w-[1100px] mx-auto px-6 lg:px-0 py-8">
                    {/* Main grid — mirrors product layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(300px,1fr)_80px] gap-4 lg:gap-28 mb-8 lg:mb-16">

                        {/* Details skeleton — LEFT */}
                        <div className="order-2 lg:order-1 space-y-6 pt-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="aspect-square rounded-md bg-stone-100 skeleton-shimmer" />
                            ))}
                        </div>

                        {/* Image skeleton */}
                        <div className="order-1 lg:order-2">
                            {/* Mobile image */}
                            <div className="lg:hidden aspect-square w-full bg-stone-100 skeleton-shimmer rounded-sm" />
                            {/* Desktop image */}
                            <div className="hidden lg:block aspect-[3/4] w-full bg-stone-100 skeleton-shimmer rounded-sm" />
                        </div>

                        {/* Details skeleton */}
                        <div className="order-2 lg:order-3 space-y-6 pt-2">
                            {/* Breadcrumb */}
                            <div className="hidden lg:flex items-center gap-2">
                                <div className="h-3 w-10 bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-3 w-3 bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-3 w-24 bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-3 w-3 bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-3 w-32 bg-stone-100 rounded skeleton-shimmer" />
                            </div>

                            {/* Product name */}
                            <div className="space-y-2">
                                <div className="h-7 w-[85%] bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-7 w-[55%] bg-stone-100 rounded skeleton-shimmer" />
                            </div>

                            {/* Price */}
                            <div className="h-5 w-20 bg-stone-100 rounded skeleton-shimmer" />

                            {/* Buttons */}
                            <div className="space-y-3 pt-4">
                                <div className="h-[52px] w-full bg-stone-100 skeleton-shimmer" />
                                <div className="h-[52px] w-full bg-stone-50 border border-stone-200 skeleton-shimmer" />
                            </div>

                            {/* Description lines */}
                            <div className="space-y-2 pt-4">
                                <div className="h-3.5 w-full bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-3.5 w-[90%] bg-stone-100 rounded skeleton-shimmer" />
                                <div className="h-3.5 w-[70%] bg-stone-100 rounded skeleton-shimmer" />
                            </div>

                            {/* Tabs skeleton */}
                            <div className="pt-4 border-t border-stone-200">
                                <div className="h-12 w-full bg-stone-50 skeleton-shimmer rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .skeleton-shimmer {
                    position: relative;
                    overflow: hidden;
                }
                .skeleton-shimmer::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(0, 0, 0, 0.03) 40%,
                        rgba(0, 0, 0, 0.05) 50%,
                        rgba(0, 0, 0, 0.03) 60%,
                        transparent 100%
                    );
                    animation: shimmer 1.8s ease-in-out infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
