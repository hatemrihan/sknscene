'use client';

import React from 'react';
import Link from 'next/link';

// ── Sun Icon SVG (Smiling, Hand-drawn Style) ──────────────────
const SunIcon = () => (
    <svg
        viewBox="0 0 64 64"
        className="w-16 h-16 text-[#3D2314] mx-auto mb-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Center circle */}
        <circle cx="32" cy="32" r="10" />

        {/* Cute smiling face */}
        <path d="M29.5 30.5 C29.5 31, 30 31, 30 30.5" strokeWidth="2.5" />
        <path d="M34 30.5 C34 31, 34.5 31, 34.5 30.5" strokeWidth="2.5" />
        <path d="M29 35 C30 37, 34 37, 35 35" strokeWidth="1.5" />

        {/* Wavy rays */}
        <path d="M32 6 Q34 11 32 16" />
        <path d="M32 48 Q30 53 32 58" />
        <path d="M6 32 Q11 34 16 32" />
        <path d="M48 32 Q53 30 58 32" />

        <path d="M14 14 Q19 17 21 21" />
        <path d="M43 43 Q45 47 50 50" />
        <path d="M50 14 Q45 17 43 21" />
        <path d="M21 43 Q19 47 14 50" />

        {/* Wavy sub-rays */}
        <path d="M23 8 Q26 12 25 15" />
        <path d="M41 8 Q38 12 39 15" />
        <path d="M56 23 Q52 26 55 25" />
        <path d="M56 41 Q52 38 55 39" />
        <path d="M41 56 Q38 52 39 49" />
        <path d="M23 56 Q26 52 25 49" />
        <path d="M8 41 Q12 38 9 39" />
        <path d="M8 23 Q12 26 9 25" />
    </svg>
);

// ── Sparkles Icon SVG ──────────────────────────────────────────
const SparklesIcon = () => (
    <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 text-[#3D2314] absolute -top-3.5 left-1/2 -translate-x-1/2"
        fill="currentColor"
    >
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
    </svg>
);

export default function Featured() {
    return (
        <section className="relative z-10 w-full py-16 md:py-24 bg-[#F5F2EB] text-[#3D2314] overflow-hidden" dir="ltr">
            <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Sun Illustration */}
                <SunIcon />

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-serif tracking-normal mb-6 font-medium">
                    Hello, Sunshine
                </h2>

                {/* Subtitle / Description */}
                <p className="text-[13px] md:text-[14px] leading-relaxed max-w-2xl mx-auto mb-10 text-[#3D2314]/80">
                    We’re here to serve glow, pretty routines, and skincare your skin will absolutely obsess over.                </p>

                {/* Call to Action Button */}
                <div className="mb-20">
                    <Link
                        href="/shop"
                        className="inline-block px-8 py-3.5 border border-[#3D2314] text-[10px] md:text-[11px] font-semibold tracking-[0.2em] hover:bg-[#3D2314] hover:text-[#F5F2EB] transition-all duration-300"
                    >
                        SHOP THE FULL RANGE HERE
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-24 max-w-2xl mx-auto">
                    {/* Product 1: Everyday Sunscreen */}
                    <div className="flex flex-col items-center group">
                        {/* Circle Badge with sparkles */}
                        <div className="relative mb-6">
                            <SparklesIcon />
                            <div className="w-11 h-11 rounded-full bg-[#E5E3DB] flex items-center justify-center">
                                <span className="text-[9px] font-bold tracking-wider">SPF 30</span>
                            </div>
                        </div>

                        {/* Product Image Wrapper */}
                        <div className="relative h-[250px] flex items-end justify-center mb-6 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/everyday_sunscreen_face.png"
                                alt="Everyday Sunscreen SPF30 Face"
                                className="h-full w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                        </div>

                        {/* Product Info */}
                        <div className="text-center">
                            <h3 className="text-[11px] md:text-[12px] font-bold tracking-[0.15em] mb-1 uppercase">
                                EVERYDAY SUNSCREEN SPF30
                            </h3>
                            <p className="text-[12px] italic text-[#3D2314]/70 font-serif">
                                Face
                            </p>
                        </div>
                    </div>

                    {/* Product 2: All-Day Sunscreen */}
                    <div className="flex flex-col items-center group">
                        {/* Circle Badge */}
                        <div className="relative mb-6">
                            <div className="w-11 h-11 rounded-full bg-[#F3ECE5] flex items-center justify-center">
                                <span className="text-[9px] font-bold tracking-wider">SPF 30</span>
                            </div>
                        </div>

                        {/* Product Image Wrapper */}
                        <div className="relative h-[280px] flex items-end justify-center mb-6 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/images/allday_sunscreen_body.png"
                                alt="All-Day Sunscreen SPF30 Body"
                                className="h-full w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                            />
                        </div>

                        {/* Product Info */}
                        <div className="text-center">
                            <h3 className="text-[11px] md:text-[12px] font-bold tracking-[0.15em] mb-1 uppercase">
                                ALL-DAY SUNSCREEN SPF30
                            </h3>
                            <p className="text-[12px] italic text-[#3D2314]/70 font-serif">
                                Body
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
