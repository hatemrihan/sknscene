'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/app/components/contexts/CartContext';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────
interface SearchResult {
    id: string;
    name: string;
    main_image: string | null;
    price: number;
    original_price: number | null;
    slug: string | null;
}

// ── Navigation items ──────────────────────────────────────────
// ── Navigation items ──────────────────────────────────────────
const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    // { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

// ── Mobile breakpoint ─────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;

export default function Nav() {
    const pathname = usePathname();
    const { totalItems } = useCart();
    const [isMobile, setIsMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const rafRef = useRef<number | null>(null);

    // ── Search state ─────────────────────────────────────────────
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const mobileBtnRef = useRef<HTMLButtonElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const closeSearch = useCallback(() => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    }, []);

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [searchOpen]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                (desktopSearchRef.current && desktopSearchRef.current.contains(target)) ||
                (mobileSearchRef.current && mobileSearchRef.current.contains(target)) ||
                (mobileBtnRef.current && mobileBtnRef.current.contains(target))
            ) {
                return;
            }
            closeSearch();
        };
        if (searchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchOpen, closeSearch]);

    // Close search on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeSearch();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeSearch]);

    // ── Debounced search ─────────────────────────────────────────
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.trim().length < 1) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.products || []);
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    }, []);

    // ── Responsive detection (passive, RAF-throttled) ───────────
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        checkMobile();

        const handleResize = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                checkMobile();
                rafRef.current = null;
            });
        };

        window.addEventListener('resize', handleResize, { passive: true });
        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // ── Scroll detection for glassmorphism backdrop ─────────────
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = useCallback(
        (href: string) => {
            if (href === '/') return pathname === '/';
            return pathname.startsWith(href);
        },
        [pathname]
    );

    // ── Extract locale from path (Fixed statically to English) ────────────────
    const localizedItems = NAV_ITEMS;

    // ── Prevent background scroll when mobile menu is open ────────────
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    return (
        <>
            {/* ━━━ DESKTOP NAVIGATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <nav
                className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out bg-transparent
          ${isMobile ? 'pointer-events-none opacity-0 h-0 overflow-hidden' : ''}
        `}
                aria-label="Main navigation"
                id="desktop-nav"
            >
                <div className="max-w-[1440px] mx-auto flex items-center justify-between h-[140px] px-8 lg:px-12">
                    {/* ── Logo ────────────────────────────────────────── */}
                    <Link
                        href={'/'}
                        className="relative flex items-center gap-2 group"
                        aria-label="Sknscene home"
                    >
                        <Image
                            src="/images/logowithoutbg.webp"
                            alt="Sknscene Logo"
                            width={1500}
                            height={600}
                            className="h-[120px] w-auto object-contain"
                            draggable={false}
                        />
                    </Link>

                    {/* ── Center links ────────────────────────────────── */}
                    <ul className="flex items-center gap-1" role="list">
                        {localizedItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                    relative px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200
                    ${isActive(item.href)
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }
                  `}
                                >
                                    {item.label}
                                    {/* Active indicator underline */}
                                    {isActive(item.href) && (
                                        <span className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-foreground" />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* ── Right actions ───────────────────────────────── */}
                    <div className="flex items-center gap-1">
                        {/* Search Desktop */}
                        <div className="relative" ref={desktopSearchRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchOpen(!searchOpen)}
                                className={`rounded-full w-10 h-10 transition-colors ${searchOpen ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
                                aria-label="Search"
                            >
                                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
                            </Button>

                            {/* Search Dropdown */}
                            {searchOpen && (
                                <div className="absolute top-full mt-2 w-[400px] bg-[#F5F2EB] rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200 right-0">
                                    {/* Search Input */}
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
                                        <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search for products..."
                                            className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
                                            style={{ direction: 'ltr' }}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => { setSearchQuery(''); setSearchResults([]); searchInputRef.current?.focus(); }}
                                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Results */}
                                    <div className="max-h-[360px] overflow-y-auto">
                                        {searchLoading && (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="h-5 w-5 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {!searchLoading && searchQuery.length > 0 && searchResults.length === 0 && (
                                            <div className="py-8 text-center text-sm text-neutral-400" style={{ direction: 'ltr' }}>
                                                No results for &quote;{searchQuery}&quote;
                                            </div>
                                        )}

                                        {!searchLoading && searchResults.length > 0 && (
                                            <div>
                                                {searchResults.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/shop/${product.slug || product.id}`}
                                                        onClick={() => closeSearch()}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                                                        style={{ direction: 'ltr' }}
                                                    >
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                                                            {product.main_image ? (
                                                                <Image
                                                                    src={product.main_image}
                                                                    alt={product.name || 'Product'}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-neutral-100" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-neutral-900 truncate">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-xs text-neutral-500">
                                                                {product.original_price && product.original_price > product.price ? (
                                                                    <>
                                                                        <span className="line-through text-neutral-400 mr-2">
                                                                            {product.original_price.toLocaleString()} USD
                                                                        </span>
                                                                        <span className="text-neutral-900 font-medium">
                                                                            {product.price.toLocaleString()} USD
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span>{product.price.toLocaleString()} USD</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {!searchLoading && !searchQuery && (
                                            <div className="py-8 text-center text-xs text-neutral-400" style={{ direction: 'ltr' }}>
                                                Type to search products
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full w-10 h-10 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Account"
                        >
                            <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </Button> */}

                        <Link
                            href={`/cart`}
                            className="relative flex items-center justify-center rounded-full w-10 h-10 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={`Cart with ${totalItems} items`}
                        >
                            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] font-semibold leading-none">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ━━━ MOBILE NAVIGATION ━━━━━━━━━━━━━━━━ */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 z-50">
                    {/* Mobile top bar with menu toggle, logo, search + cart */}
                    <div
                        className={`
                            flex items-center justify-between px-5 h-[80px] transition-all duration-300 relative z-[60]
                            ${(scrolled || menuOpen) && !searchOpen
                                ? 'bg-background/80 backdrop-blur-md border-b border-border/40'
                                : 'bg-transparent border-b border-transparent'
                            }
                        `}
                    >
                        {/* Hamburger button on the left */}
                        <div className="flex-1 flex justify-start">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors text-foreground relative z-[60]"
                                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            >
                                {menuOpen ? (
                                    <X className="w-[20px] h-[20px]" strokeWidth={1.5} />
                                ) : (
                                    <div className="flex flex-col gap-1.5 justify-center items-center w-5 h-5">
                                        <span className="w-5 h-[1.5px] bg-current rounded-full" />
                                        <span className="w-5 h-[1.5px] bg-current rounded-full" />
                                        <span className="w-5 h-[1.5px] bg-current rounded-full" />
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Centered Brand Logo */}
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="z-[60] flex-1 flex justify-center"
                            aria-label="Sknscene home"
                        >
                            <Image
                                src="/images/logowithoutbg.webp"
                                alt="Sknscene Logo"
                                width={300}
                                height={120}
                                className="h-[70px] w-auto object-contain select-none brightness-0 invert"
                                draggable={false}
                            />
                        </Link>

                        {/* Search & Cart on the right */}
                        <div className="flex items-center justify-end flex-1 gap-2 z-[60]">
                            {/* Search button (mobile) */}
                            {!menuOpen && (
                                <button
                                    ref={mobileBtnRef}
                                    onClick={() => setSearchOpen(true)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                    aria-label="Search"
                                >
                                    <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                </button>
                            )}

                            {/* Cart button */}
                            <Link
                                href="/cart"
                                onClick={() => setMenuOpen(false)}
                                className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                aria-label={`Cart with ${totalItems} items`}
                            >
                                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 rounded-full bg-foreground text-background text-[9px] font-semibold leading-none">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Search Overlay */}
                    {searchOpen && (
                        <div
                            ref={mobileSearchRef}
                            className="fixed inset-0 bg-background z-[100] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300"
                        >
                            <div className="flex items-center gap-3 px-5 h-[60px] border-b border-border/40 bg-background">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search for products..."
                                    className="flex-1 text-[16px] text-foreground placeholder:text-muted-foreground outline-none bg-transparent h-full"
                                />
                                <button
                                    onClick={() => closeSearch()}
                                    className="text-muted-foreground p-2"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-4 bg-background">
                                {searchLoading && (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
                                    </div>
                                )}

                                {!searchLoading && searchQuery.length > 0 && searchResults.length === 0 && (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        No results for &apos;{searchQuery}&apos;
                                    </div>
                                )}

                                {!searchLoading && searchResults.length > 0 && (
                                    <div className="space-y-4">
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/shop/${product.slug || product.id}`}
                                                onClick={() => { closeSearch(); setMenuOpen(false); }}
                                                className="flex items-center gap-4 py-2"
                                            >
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                                    {product.main_image ? (
                                                        <Image
                                                            src={product.main_image}
                                                            alt={product.name || 'Product'}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">?</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[15px] font-medium text-foreground truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {product.original_price && product.original_price > product.price ? (
                                                            <>
                                                                <span className="line-through text-muted-foreground mr-2">
                                                                    {product.original_price.toLocaleString()} USD
                                                                </span>
                                                                <span className="text-foreground font-medium">
                                                                    {product.price.toLocaleString()} USD
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span>{product.price.toLocaleString()} L.E</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {!searchLoading && !searchQuery && (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        Type to search products
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Smooth Mobile Menu Slide-out Overlay Drawer */}
                    <div
                        className={`
                            fixed inset-y-0 left-0 w-full h-full bg-background z-50 flex flex-col justify-between px-8 pt-24 pb-8 transition-transform duration-300 ease-out
                            ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}
                    >
                        {/* Navigation List */}
                        <ul className="flex flex-col gap-6 mt-8">
                            {localizedItems.map((item, index) => (
                                <li
                                    key={item.href}
                                    className={`transition-all duration-500 ease-out transform ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                        }`}
                                    style={{ transitionDelay: `${index * 60}ms` }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={`text-3xl font-light tracking-wide uppercase block py-2 ${isActive(item.href) ? 'text-foreground font-medium' : 'text-muted-foreground'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Social Links at Bottom */}
                        <div
                            className={`mt-auto space-y-4 transition-all duration-500 delay-200 transform ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                }`}
                        >
                            <div className="h-[1px] bg-border/40 w-full" />
                            <span className="text-[11px] text-muted-foreground uppercase tracking-widest block font-medium">Follow us</span>
                            <div className="flex gap-6">
                                <a
                                    href="https://instagram.com/sknscene"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Instagram
                                </a>
                                <a
                                    href="https://tiktok.com/@sknscene"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    TikTok
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
