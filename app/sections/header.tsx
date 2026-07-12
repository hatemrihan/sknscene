'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function Header() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoWrapRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [typingStarted, setTypingStarted] = useState(false);
    const [typedText, setTypedText] = useState('');

    const fullText = 'Natural Skincare';

    // ── Scroll-driven video shrink (direct DOM, no re-renders) ──
    useEffect(() => {
        const section = sectionRef.current;
        const wrap = videoWrapRef.current;
        if (!section || !wrap) return;

        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const rect = section.getBoundingClientRect();
                const h = section.offsetHeight;
                const raw = -rect.top / (h * 0.5);
                const p = Math.max(0, Math.min(1, raw));

                const s = 1 - p * 0.48;
                const r = p * 28;
                wrap.style.transform = `scale(${s}) translateZ(0)`;
                wrap.style.clipPath = `inset(0 round ${r}px)`;

                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Intersection observer for typing trigger ──
    useEffect(() => {
        const el = textRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTypingStarted(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.05 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // ── Typing animation ──
    useEffect(() => {
        if (!typingStarted) return;
        let i = 0;
        const iv = setInterval(() => {
            i++;
            setTypedText(fullText.slice(0, i));
            if (i >= fullText.length) {
                clearInterval(iv);
            }
        }, 110);
        return () => clearInterval(iv);
    }, [typingStarted]);

    // Split typed text into words for styling
    const words = typedText.split(' ');

    return (
        <section ref={sectionRef} className="relative bg-white" dir="ltr">
            {/* ═══ VIDEO ZONE — sticky, shrinks on scroll ═══ */}
            <div style={{ height: '180vh' }}>
                <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                    <div
                        ref={videoWrapRef}
                        className="w-full h-full overflow-hidden"
                        style={{
                            willChange: 'transform, clip-path',
                            transformOrigin: 'center center',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                        }}
                    >
                        {/* Mobile — optimized */}
                        <video
                            autoPlay loop muted playsInline
                            preload="metadata"
                            className="md:hidden w-full h-full object-cover"
                        >
                            <source src="/videos/one_optimized.webm" type="video/webm" />
                            <source src="/videos/one.mp4" type="video/mp4" />
                        </video>

                        {/* Desktop — optimized */}
                        <video
                            autoPlay loop muted playsInline
                            preload="metadata"
                            className="hidden md:block w-full h-full object-cover"
                        >
                            <source src="/videos/two_optimized.webm" type="video/webm" />
                            <source src="/videos/two.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>
            </div>

            {/* ═══ TEXT ZONE — below video, tight to it ═══ */}
            <div
                ref={textRef}
                className="relative z-10 w-full bg-white flex items-start justify-start px-8 md:px-16 lg:px-24 pt-10 md:pt-16 pb-20"
            >
                <h1
                    className="w-full whitespace-nowrap leading-[1] text-[#3D2314] font-light tracking-tighter"
                    style={{ fontSize: 'clamp(3rem, 11.5vw, 15rem)' }}
                >
                    {words.map((word, idx) => (
                        <span key={idx}>
                            {idx === 1 ? (
                                <span className="italic font-normal">{word}</span>
                            ) : (
                                word
                            )}
                            {idx < words.length - 1 && ' '}
                        </span>
                    ))}
                    {typingStarted && typedText.length < fullText.length && (
                        <span className="inline-block w-[3px] h-[0.7em] bg-[#3D2314]/50 ml-1 align-middle animate-[blink_1s_step-end_infinite]" />
                    )}
                </h1>
            </div>

            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </section>
    );
}
