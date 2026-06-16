'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function Header() {
    return (
        <section className="relative w-full h-screen min-h-[650px] md:min-h-[750px] overflow-hidden bg-[#F5F2EB] flex flex-col justify-center items-center" dir="ltr">
            {/* Center Logo & Content Container */}
            <div className="max-w-[1440px] mx-auto w-full px-8 lg:px-12 relative z-10 flex flex-col justify-center items-center text-center h-[65dvh] pt-16 md:pt-0">
                <div className="mb-8 select-none">
                    <Image
                        src="/images/logowithoutbg.webp"
                        alt="Sknscene Logo"
                        width={600}
                        height={240}
                        className="w-[280px] md:w-[420px] h-auto object-contain"
                        priority
                        draggable={false}
                    />
                </div>
                <h1 className="text-[clamp(2rem,5vw,3.2rem)] leading-tight text-[#3D2314] font-sans font-light mb-5 tracking-tight">
                    Natural
                    <span className="italic font-normal font-sans ml-2">Skincare</span>
                </h1>
                <p className="text-[#3D2314]/80 text-[13px] md:text-sm font-light tracking-wide leading-relaxed max-w-[360px] mb-8">
                    Start your day with gentle care and nourishing ingredients designed to awaken your skin naturally.
                </p>
                <Link
                    href="/shop"
                    className="inline-block text-[#3D2314] text-[11px] font-semibold tracking-[0.2em] uppercase border-b border-[#3D2314]/60 pb-1.5 hover:border-[#3D2314] hover:opacity-90 transition-all duration-300"
                >
                    Shop Now
                </Link>
            </div>

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-10 right-10 flex items-center gap-2.5 text-[#3D2314]/50 text-[10px] tracking-[0.2em] uppercase font-bold z-30 hidden sm:flex">
                <span>Scroll Down</span>
                <ChevronDown className="h-3.5 w-3.5 animate-bounce text-[#3D2314]/80" strokeWidth={2.5} />
            </div>
        </section>
    );
}


