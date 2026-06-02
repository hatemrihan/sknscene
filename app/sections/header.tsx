'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function Header() {
    return (
        <section className="relative w-full h-screen min-h-[650px] md:min-h-[750px] overflow-hidden bg-stone-900 flex items-center" dir="ltr">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0 z-0 select-none">
                <Image
                    src="/images/two.jpg"
                    alt="Sknscenee Skincare"
                    fill
                    priority
                    className="object-cover"
                    draggable={false}
                />
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/25 md:bg-black/15" />
            </div>

            {/* Main Content Layout Container */}
            <div className="max-w-[1440px] mx-auto w-full px-8 lg:px-12 relative z-10 flex flex-col justify-between h-[65dvh] pt-16 md:pt-0">
                {/* ─── LEFT SIDE CONTENT ─── */}
                <div className="max-w-md mt-auto mb-auto">
                    <h1 className="text-[clamp(3.8rem,9vw,6.5rem)] leading-[0.9] text-white font-sans font-light mb-5 tracking-tight">
                        Natural
                        <span className="block italic mt-1 font-normal font-sans">Skincare</span>
                    </h1>
                    <p className="text-stone-100/90 text-[13px] md:text-sm font-light tracking-wide leading-relaxed max-w-[320px] mb-8">
                        Start your day with gentle care and nourishing ingredients designed to awaken your skin naturally.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block text-white text-[11px] font-semibold tracking-[0.2em] uppercase border-b border-white/60 pb-1.5 hover:border-white hover:opacity-90 transition-all duration-300"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-10 right-10 flex items-center gap-2.5 text-stone-200/60 text-[10px] tracking-[0.2em] uppercase font-bold z-30 hidden sm:flex">
                <span>Scroll Down</span>
                <ChevronDown className="h-3.5 w-3.5 animate-bounce text-stone-300" strokeWidth={2.5} />
            </div>
        </section>
    );
}


