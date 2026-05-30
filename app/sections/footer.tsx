'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, useInView } from 'framer-motion';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // In-view typewriter animation configuration
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.2 });
    const [typedText, setTypedText] = useState('');
    const fullText = "sknscene";

    useEffect(() => {
        if (isInView) {
            let index = 0;
            const interval = setInterval(() => {
                setTypedText(fullText.slice(0, index + 1));
                index++;
                if (index >= fullText.length) {
                    clearInterval(interval);
                }
            }, 120); // 120ms per character typing speed
            return () => clearInterval(interval);
        }
    }, [isInView]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Welcome to the list!");
                setEmail('');
            } else {
                toast.error(json.error || "Something went wrong");
            }
        } catch {
            toast.error("Failed to subscribe");
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="w-full bg-[#ECE8DA] text-[#E11D00] py-20 px-6 lg:px-12 border-t border-[#E11D00]/20 font-sans text-[13px] tracking-tight" dir="ltr">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                {/* ── LEFT SIDE (lg:col-span-7) ── */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-12">
                    {/* Massive Brand Name */}
                    <div ref={containerRef}>
                        <h2 className="text-[clamp(4.5rem,14vw,10rem)] font-bold tracking-tighter leading-none text-[#E11D00] uppercase font-sans select-none flex items-center min-h-[1.1em]">
                            <span className="sr-only">sknscene</span>
                            <span aria-hidden="true">{typedText}</span>
                            {typedText.length < fullText.length && typedText.length > 0 && (
                                <motion.span
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                    className="inline-block w-[4px] md:w-[8px] h-[0.8em] bg-[#E11D00] ml-2"
                                />
                            )}
                        </h2>
                    </div>

                    {/* Three Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
                        {/* Column 1: Info */}
                        <div className="space-y-3">
                            <p className="text-[11px] uppercase tracking-wider text-[#E11D00]/60 font-bold">Info</p>
                            <div className="space-y-1 text-[#E11D00]">
                                <p className="font-medium">Premium Skincare</p>
                                <p>Batch-Formulated</p>
                                <p>Beirut, Lebanon</p>
                            </div>
                        </div>

                        {/* Column 2: Follow */}
                        <div className="space-y-3">
                            <p className="text-[11px] uppercase tracking-wider text-[#E11D00]/60 font-bold">Follow Us</p>
                            <div className="space-y-1">
                                <p>
                                    <a href="https://www.instagram.com/sknscene.lb/" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity font-medium">
                                        Instagram
                                    </a>
                                </p>
                                <p>

                                </p>
                            </div>
                        </div>

                        {/* Column 3: Legal */}
                        <div className="space-y-3">
                            <p className="text-[11px] uppercase tracking-wider text-[#E11D00]/60 font-bold">Legal</p>
                            <div className="space-y-1 text-[#E11D00]">
                                <p><Link href="/privacy" className="hover:opacity-60 transition-opacity font-medium">Privacy Policy</Link></p>
                                <p><Link href="/terms" className="hover:opacity-60 transition-opacity font-medium">Terms of Service</Link></p>
                                <p><Link href="/shipping" className="hover:opacity-60 transition-opacity font-medium">Shipping & Delivery</Link></p>
                                <p><Link href="/return" className="hover:opacity-60 transition-opacity font-medium">Returns & Exchanges</Link></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDE (lg:col-span-5) ── */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-12 lg:border-l lg:border-[#E11D00]/25 lg:pl-16">
                    {/* Serif Tagline */}
                    <div>
                        <p className="text-3xl md:text-4.5xl text-[#E11D00] font-serif italic tracking-wide text-left lg:text-right leading-snug">
                            Style that feels like skin
                        </p>
                    </div>

                    {/* Integrated Minimalist Newsletter Form */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-wider text-[#E11D00]/60 font-bold">Newsletter</p>
                            <p className="text-[#E11D00]">Subscribe for exclusive updates and collections.</p>
                        </div>

                        <form onSubmit={handleSubscribe} className="relative border-b border-[#E11D00] pb-2 flex items-center justify-between w-full">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-transparent border-none outline-none text-xl text-[#E11D00] font-serif placeholder:text-[#E11D00]/30 w-full pr-12 focus:ring-0"
                            />
                            <button type="submit" disabled={loading} className="text-[#E11D00] hover:opacity-60 transition-opacity text-2xl absolute right-0 bottom-2 cursor-pointer" aria-label="Submit email">
                                {loading ? '…' : '→'}
                            </button>
                        </form>

                        <p className="text-[10px] text-[#E11D00]/60 leading-relaxed">
                            By subscribing, you agree to receive our newsletter and accept our privacy policy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Credits Bar */}
            <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-[#E11D00]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E11D00]/60">
                <div>
                    © 2026 Sknscene | All rights reserved.
                </div>
                <div>
                    Crafted in Beirut, Lebanon
                </div>
            </div>
        </footer>
    );
}
