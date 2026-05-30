'use client';
import Image from 'next/image';

// ── Sun Icon SVG (Mini) ────────────────────────────────────────
const SunIconMini = () => (
    <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 text-[#3D2314] mb-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
);

// ── Sparkles Icon SVG ──────────────────────────────────────────
const SparklesIcon = () => (
    <svg
        viewBox="0 0 24 24"
        className="w-4.5 h-4.5 text-[#3D2314] absolute -top-4 left-1/2 -translate-x-1/2"
        fill="currentColor"
    >
        <path d="M12 2l1.2 4.4L18 8l-4.8 1.2L12 14l-1.2-4.4L6 8l4.8-1.2z" />
    </svg>
);

export default function Explore() {
    return (
        <section className="w-full overflow-hidden bg-[#F5F2EB]" dir="ltr">
            {/* ── Top Section: Split Screen Hero ──────────────────────── */}
            <div className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center">
                {/* Split Images */}
                <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 w-full h-full">
                    {/* Left: Amber Glass Dropper */}
                    <div className="relative w-full h-full overflow-hidden">
                        <Image
                            src="/images/one.jpg"
                            alt="Le Rub Amber Dropper Bottle close up"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" /> {/* Subtle overlay */}
                    </div>
                    {/* Right: Aerial Swimmers */}
                    <div className="relative w-full h-full overflow-hidden">
                        <Image
                            src="/images/two.jpg"
                            alt="Mediterranean sea swimmers aerial view"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/15" /> {/* Subtle overlay */}
                    </div>
                </div>

                {/* Overlay Text & Button (Centered over split) */}
                <div className="relative z-10 max-w-2xl mx-auto px-6 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-serif leading-tight mb-6 font-medium drop-shadow-sm">
                        French Beauty <br />Korean Glow <br />SKNCENE Energy
                    </h2>
                </div>
            </div>

            {/* ── Bottom Section: Pale Mint Products Grid ──────────────── */}
            <div className="w-full py-16 md:py-24 bg-[#DDFCF2] text-[#3D2314] text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 sm:gap-12 items-end justify-center">

                        {/* Product 1: Sunset Serum */}
                        <div className="flex flex-col items-center group">
                            {/* Badge */}
                            <div className="relative mb-6">
                                <SparklesIcon />
                                <div className="w-12 h-12 rounded-full bg-[#B2EAD8] flex flex-col items-center justify-center text-[#3D2314]">
                                    <SunIconMini />
                                    <span className="text-[8px] font-bold tracking-wider">SUN</span>
                                </div>
                            </div>

                            {/* Product Image */}
                            <div className="relative h-[210px] flex items-end justify-center mb-6 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/explore_sunset_serum.png"
                                    alt="Sunset Serum Dropper Bottle"
                                    className="h-full w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="text-[11px] md:text-[12px] font-bold tracking-[0.15em] mb-1 uppercase">
                                    Sunset Serum
                                </h3>
                                <p className="text-[12px] italic text-[#3D2314]/70 font-serif">
                                    Face
                                </p>
                            </div>
                        </div>

                        {/* Product 2: Repairing Face Mask */}
                        <div className="flex flex-col items-center group">
                            {/* Badge */}
                            <div className="relative mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#ECE7DE] flex flex-col items-center justify-center text-[#3D2314]">
                                    <span className="text-[7px] font-bold tracking-wider leading-none">AFTER</span>
                                    <span className="text-[7px] font-bold tracking-wider leading-none mt-0.5">SUN</span>
                                </div>
                            </div>

                            {/* Product Image */}
                            <div className="relative h-[230px] flex items-end justify-center mb-6 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/explore_repairing_mask.png"
                                    alt="Repairing Face Mask Tube"
                                    className="h-full w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="text-[11px] md:text-[12px] font-bold tracking-[0.15em] mb-1 uppercase">
                                    Repairing Face Mask
                                </h3>
                                <p className="text-[12px] italic text-[#3D2314]/70 font-serif">
                                    Face
                                </p>
                            </div>
                        </div>

                        {/* Product 3: Repairing Lotion */}
                        <div className="flex flex-col items-center group">
                            {/* Badge */}
                            <div className="relative mb-6">
                                <div className="w-12 h-12 rounded-full bg-[#ECE7DE] flex flex-col items-center justify-center text-[#3D2314]">
                                    <span className="text-[7px] font-bold tracking-wider leading-none">AFTER</span>
                                    <span className="text-[7px] font-bold tracking-wider leading-none mt-0.5">SUN</span>
                                </div>
                            </div>

                            {/* Product Image */}
                            <div className="relative h-[250px] flex items-end justify-center mb-6 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/explore_repairing_lotion.png"
                                    alt="Repairing Lotion Tube"
                                    className="h-full w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="text-[11px] md:text-[12px] font-bold tracking-[0.15em] mb-1 uppercase">
                                    Repairing Lotion
                                </h3>
                                <p className="text-[12px] italic text-[#3D2314]/70 font-serif">
                                    Body
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
