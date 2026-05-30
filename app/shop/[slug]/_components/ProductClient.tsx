'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/app/sections/nav';
import Footer from '@/app/sections/footer';
import { useCart } from '@/app/components/contexts/CartContext';
import { isSameAttributes } from '@/lib/cart-utils';
import { ProductDetailsTabs } from '@/app/shop/[slug]/_components/ProductDetailsTabs'
import type { ProductVariant, ProductOptionGroup } from '@/lib/database.types';
import Image from 'next/image';
import Link from 'next/link';
import { useAnalytics } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────

type ProductFull = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    main_image: string;
    images: string[];
    videos: string[];
    description: string;
    detailed_description: string;
    shipping_info: string;
    faqs: { question: string; answer: string }[];
    variants: ProductVariant[];
    option_groups: ProductOptionGroup[];
    stock: number;
    sizes: string;
    size_guide: string;
    show_out_of_stock_badge: boolean;
    show_preorder_badge: boolean;
    categories: string[];
};

type RelatedProduct = {
    id: string;
    slug: string;
    name: string;
    price: number;
    main_image: string;
    variants: ProductVariant[];
    stock: number;
};

// ─── Component ────────────────────────────────────────────────

type Props = {
    initialProduct: ProductFull;
    relatedProducts: RelatedProduct[];
    lowStockThreshold: number;
};

export function ProductClient({ initialProduct, relatedProducts, lowStockThreshold }: Props) {
    const router = useRouter();

    const [product, setProduct] = useState<ProductFull>(initialProduct);

    // Selection state
    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
        const defaultAttrs: Record<string, string> = {};
        if (initialProduct.option_groups?.length > 0) {
            for (const group of initialProduct.option_groups) {
                if (group.values.length > 0) {
                    defaultAttrs[group.name] = group.values[0];
                }
            }
        }
        return defaultAttrs;
    });
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showCartNotification, setShowCartNotification] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartError, setCartError] = useState('');
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    // ── Derived: find matching variant from selected attributes ──
    const optionGroups = (product?.option_groups ?? []).filter(g => g.name?.trim() && g.values?.length > 0);
    const hasOptions = optionGroups.length > 0;
    const allOptionsSelected = useMemo(() =>
        !hasOptions || optionGroups.every(g => selectedAttrs[g.name]),
        [optionGroups, selectedAttrs, hasOptions]);

    const matchedVariant = useMemo<ProductVariant | null>(() => {
        if (!product || !allOptionsSelected || !hasOptions) return null;
        return product.variants.find(v => {
            const keys = Object.keys(selectedAttrs);
            return keys.length === Object.keys(v.attributes).length &&
                keys.every(k => v.attributes[k] === selectedAttrs[k]);
        }) ?? null;
    }, [product, selectedAttrs, allOptionsSelected, hasOptions]);

    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const { addItem, state } = useCart();
    const { trackEvent } = useAnalytics();

    const currentStock = matchedVariant ? matchedVariant.stock : product?.stock ?? 0;

    const hasDiscount = useMemo(() =>
        !!(product?.original_price && product.original_price > (product?.price ?? 0)),
        [product?.original_price, product?.price]);

    // Removed unused localeRef

    // ── Analytics: ViewContent on product page view ──────────────
    useEffect(() => {
        if (!product?.id) return;
        trackEvent({
            name: 'ViewContent',
            params: {
                content_ids: [product.id],
                content_name: product.name,
                content_type: 'product',
                value: product.price,
                currency: 'USD',
            },
        });
        // Fire only once per product page load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?.id]);

    // ── Polling — live stock updates ────────────────────────────
    useEffect(() => {
        if (!product?.id) return;

        const interval = setInterval(async () => {
            if (document.hidden) return;
            try {
                const res = await fetch(`/api/products/stock?id=${product.id}`, { cache: 'no-store' });
                if (!res.ok) return;
                const data = await res.json();

                if (data.success) {
                    setProduct(prev => {
                        if (!prev) return prev;
                        return { ...prev, stock: data.stock, variants: data.variants ?? prev.variants };
                    });
                }
            } catch {
                // Silently handle fetch errors during polling
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [product?.id]);

    // ── Media ───────────────────────────────────────────────────
    const allMedia = useMemo(() => {
        if (!product) return [];

        // Variant-specific images first
        if (matchedVariant?.images?.length) {
            return [
                ...matchedVariant.images,
                ...(matchedVariant.videos || []),
            ];
        }

        // Fallback to main product images
        return [
            product.main_image,
            ...(product.images || []),
            ...(product.videos || []),
        ].filter(Boolean);
    }, [product, matchedVariant]);

    // ── Intersection Observer for desktop thumbnail sync ────────
    useEffect(() => {
        imageRefs.current = imageRefs.current.slice(0, allMedia.length);
    }, [allMedia.length]);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (allMedia.length === 0) return;

        const observers: IntersectionObserver[] = [];
        const options = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };

        imageRefs.current.forEach((ref, index) => {
            if (ref) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && mountedRef.current) setSelectedImageIndex(index);
                    });
                }, options);
                observer.observe(ref);
                observers.push(observer);
            }
        });

        return () => observers.forEach(o => o.disconnect());
    }, [allMedia.length, product]);

    // ── Add to Cart ─────────────────────────────────────────────
    const handleAddToCart = async () => {
        if (!product || isAddingToCart) return;
        setCartError('');

        // Require all options selected if product has option groups
        if (hasOptions && !allOptionsSelected) {
            setCartError("Please select all options first");
            setTimeout(() => setCartError(''), 4000);
            return;
        }

        const availableStock = matchedVariant ? matchedVariant.stock : product.stock;
        if (availableStock <= 0) {
            setCartError(`Sorry, "${product.name}" is currently unavailable`);
            setTimeout(() => setCartError(''), 4000);
            return;
        }

        // Check existing cart quantity — match by attributes
        const cartAttrs = hasOptions ? selectedAttrs : undefined;
        const existing = state.items.find(i =>
            i.id === product.id && isSameAttributes(cartAttrs, i.variant?.attributes)
        );

        if (existing && existing.quantity >= availableStock) {
            setCartError(`Sorry, you have the maximum available (${availableStock}) of this product in your cart`);
            setTimeout(() => setCartError(''), 4000);
            return;
        }

        try {
            setIsAddingToCart(true);

            addItem({
                id: product.id,
                name: product.name,
                image: product.main_image,
                price: matchedVariant?.price ?? product.price,
                maxStock: availableStock,
                variant: cartAttrs ? { attributes: cartAttrs } : undefined,
            }, 1);

            setShowCartNotification(true);
            setTimeout(() => setShowCartNotification(false), 3000);

            // Analytics: AddToCart event
            trackEvent({
                name: 'AddToCart',
                params: {
                    content_ids: [product.id],
                    content_name: product.name,
                    value: matchedVariant?.price ?? product.price,
                    currency: 'USD',
                    num_items: 1,
                },
            });
        } catch {
            setCartError("Failed to add to cart");
            setTimeout(() => setCartError(''), 4000);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // ── Buy Now ──────────────────────────────────────────────────
    const handleBuyNow = async () => {
        if (!product || isAddingToCart) return;
        setCartError('');

        if (hasOptions && !allOptionsSelected) {
            setCartError("Please select all options first");
            setTimeout(() => setCartError(''), 4000);
            return;
        }

        const availableStock = matchedVariant ? matchedVariant.stock : product.stock;
        if (availableStock <= 0) {
            setCartError(`Sorry, "${product.name}" is currently unavailable`);
            setTimeout(() => setCartError(''), 4000);
            return;
        }

        const cartAttrs = hasOptions ? selectedAttrs : undefined;
        const existing = state.items.find(i =>
            i.id === product.id && isSameAttributes(cartAttrs, i.variant?.attributes)
        );

        if (existing && existing.quantity >= availableStock) {
            setCartError(`Sorry, you have the maximum available (${availableStock}) of this product in your cart`);
            setTimeout(() => setCartError(''), 4000);
            return;
        }

        try {
            setIsAddingToCart(true);

            addItem({
                id: product.id,
                name: product.name,
                image: product.main_image,
                price: matchedVariant?.price ?? product.price,
                maxStock: availableStock,
                variant: cartAttrs ? { attributes: cartAttrs } : undefined,
            }, 1);

            // Analytics: AddToCart event
            trackEvent({
                name: 'AddToCart',
                params: {
                    content_ids: [product.id],
                    content_name: product.name,
                    value: matchedVariant?.price ?? product.price,
                    currency: 'USD',
                    num_items: 1,
                },
            });

            // Go straight to checkout
            router.push(`/checkout`);
        } catch {
            setCartError("Failed to add to cart");
            setTimeout(() => setCartError(''), 4000);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────

    if (!product) {
        return (
            <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-stone-950 font-sans mb-4">Product not found</h2>
                    <Link
                        href="/shop"
                        className="inline-block bg-stone-950 text-white hover:bg-stone-850 px-6 py-3 text-sm font-semibold rounded-md transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none"
                    >
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────
    return (
        <>
            <div className="min-h-screen bg-[#F5F2EB]">
                <Nav />

                <div className="pt-20">
                    <div className="max-w-[1100px] mx-auto px-6 lg:px-0 py-8">
                        {/* ═══ Main Product Section ═══ */}
                        {/* RTL layout: Details RIGHT | Images CENTER | Thumbnails LEFT */}
                        <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(400px,600px)_100px] gap-4 lg:gap-10 mb-8 lg:mb-16">

                            {/* ── RIGHT (RTL): Product Details ──────────── */}
                            <div className="space-y-4 order-2 lg:order-1">
                                {/* Breadcrumb — desktop */}
                                <nav aria-label="breadcrumb" className="hidden lg:block text-xs text-stone-500 mb-4">
                                    <ol itemScope itemType="https://schema.org/BreadcrumbList" className="flex items-center font-medium">
                                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                            <Link href="/shop" itemProp="item" className="hover:text-stone-950 hover:underline hover:underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none rounded px-1">
                                                <span itemProp="name">Shop</span>
                                            </Link>
                                            <meta itemProp="position" content="1" />
                                        </li>
                                        <span className="mx-2 text-stone-400" aria-hidden="true">·</span>
                                        {product.categories?.[0] && (
                                            <>
                                                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                                    <Link href={`/shop?category=${encodeURIComponent(product.categories[0])}`} itemProp="item" className="hover:text-stone-950 hover:underline hover:underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none rounded px-1">
                                                        <span itemProp="name">{product.categories[0]}</span>
                                                    </Link>
                                                    <meta itemProp="position" content="2" />
                                                </li>
                                                <span className="mx-2 text-stone-400" aria-hidden="true">·</span>
                                            </>
                                        )}
                                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                            <span itemProp="name" className="text-stone-950 font-bold" aria-current="page">{product.name}</span>
                                            <meta itemProp="position" content={product.categories?.[0] ? "3" : "2"} />
                                        </li>
                                    </ol>
                                </nav>

                                {/* Name + Price */}
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-light text-stone-950 font-sans mb-2">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-4">
                                        <p className="text-base lg:text-lg text-stone-950 font-semibold font-sans">
                                            {(matchedVariant?.price ?? product.price).toLocaleString('en-US')} USD
                                        </p>
                                        {hasDiscount && (
                                            <p className="text-sm text-stone-500 font-sans line-through">
                                                {product.original_price?.toLocaleString('en-US')} USD
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Dynamic Attribute Selection */}
                                {hasOptions && optionGroups.map((group) => (
                                    <div key={group.name} className="space-y-3 pt-6 border-t border-stone-300">
                                        <p className="text-sm text-stone-800 font-medium">
                                            {group.name}: <span className="font-normal text-stone-900">{selectedAttrs[group.name] || '—'}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.values.map((value) => {
                                                const isSelected = selectedAttrs[group.name] === value;
                                                return (
                                                    <button
                                                        key={value}
                                                        onClick={() => {
                                                            setSelectedAttrs(prev => ({ ...prev, [group.name]: value }));
                                                            setSelectedImageIndex(0);
                                                        }}
                                                        className={`px-4 py-2 text-sm border transition-all duration-200 rounded-md focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none cursor-pointer ${isSelected
                                                            ? 'border-stone-950 bg-stone-950 text-white font-semibold'
                                                            : 'border-stone-300 text-stone-700 bg-transparent hover:border-stone-950 hover:text-stone-950'
                                                            }`}
                                                    >
                                                        {value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Error */}
                                {cartError && (
                                    <p className="text-red-650 text-sm font-semibold">{cartError}</p>
                                )}

                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || currentStock <= 0}
                                    className={`w-full py-4 text-sm font-bold tracking-wider transition-colors duration-200 rounded-md cursor-pointer ${currentStock <= 0
                                        ? 'bg-stone-250 text-stone-400 cursor-not-allowed border border-stone-300'
                                        : 'bg-[#E11D00] text-white border border-[#E11D00] hover:bg-[#c01800] focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 focus-visible:outline-none'
                                        }`}
                                >
                                    {isAddingToCart
                                        ? "Adding..."
                                        : currentStock <= 0
                                            ? "Out of Stock"
                                            : "Add to Cart"
                                    }
                                </button>

                                {/* Buy Now */}
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isAddingToCart || currentStock <= 0}
                                    className={`w-full py-4 text-sm font-bold tracking-wider transition-colors duration-200 border rounded-md cursor-pointer ${currentStock <= 0
                                        ? 'bg-stone-200/50 text-stone-400 border-stone-300 cursor-not-allowed'
                                        : 'bg-stone-950 text-white border-stone-950 hover:bg-stone-850 focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 focus-visible:outline-none'
                                        }`}
                                >
                                    {currentStock <= 0
                                        ? "Out of Stock"
                                        : "Buy Now"
                                    }
                                </button>

                                {/* Low stock warning */}
                                {currentStock > 0 && currentStock <= lowStockThreshold && (
                                    <p className="text-xs text-[#E11D00] font-semibold">{`Only ${currentStock} left in stock`}</p>
                                )}

                                {/* Short description */}
                                {product.description && (
                                    <div className="text-sm text-stone-700 font-medium leading-relaxed pt-4">
                                        <p className="font-light">{product.description}</p>
                                    </div>
                                )}

                                <ProductDetailsTabs
                                    description={product.description}
                                    detailedDescription={product.detailed_description}
                                    shippingInfo={product.shipping_info}
                                    faqs={product.faqs}
                                />
                            </div>

                            {/* ── CENTER: Stacked Images — Desktop ─────── */}
                            <div className="hidden lg:block order-2">
                                <div className="flex flex-col gap-4 w-full">
                                    {allMedia.map((src, index) => (
                                        <div
                                            key={src}
                                            ref={(el) => { imageRefs.current[index] = el; }}
                                            className="flex items-center justify-center w-full"
                                        >
                                            <Image
                                                src={src}
                                                alt={index === 0 ? product.name : `${product.name} - ${product.categories?.[0] || ''} - Image ${index}`}
                                                width={1000}
                                                height={1000}
                                                sizes="(max-width: 1024px) 100vw, 600px"
                                                unoptimized={src.startsWith('blob:')}
                                                priority={index === 0}
                                                className="object-contain w-full h-auto"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── LEFT (RTL): Thumbnails — Desktop ──────── */}
                            <div className="hidden lg:block order-3">
                                {allMedia.length > 1 && (
                                    <div className="flex flex-col gap-3 sticky top-24">
                                        {allMedia.map((src, index) => (
                                            <button
                                                key={src}
                                                onClick={() => {
                                                    imageRefs.current[index]?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'center',
                                                    });
                                                }}
                                                className={`w-full aspect-square overflow-hidden border transition-all duration-200 rounded-md flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none ${selectedImageIndex === index
                                                    ? 'border-[#E11D00] border-2 bg-stone-100'
                                                    : 'border-stone-300 bg-[#ECE8DA]/20 hover:border-stone-950'
                                                    }`}
                                            >
                                                <Image
                                                    src={src}
                                                    alt={index === 0 ? product.name : `${product.name} - ${product.categories?.[0] || ''} - Image ${index}`}
                                                    width={400}
                                                    height={400}
                                                    sizes="100px"
                                                    unoptimized={src.startsWith('blob:')}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── MOBILE: Swipeable Gallery ────────────── */}
                            <div className="lg:hidden col-span-1 order-1">
                                <div dir="ltr" className="overflow-hidden relative flex items-center justify-center">
                                    <div
                                        className="w-full flex transition-transform duration-300 ease-out"
                                        style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                                        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                                        onTouchEnd={(e) => {
                                            if (touchStartX === null) return;
                                            const diff = touchStartX - e.changedTouches[0].clientX;
                                            if (Math.abs(diff) > 50) {
                                                setSelectedImageIndex(prev =>
                                                    diff > 0
                                                        ? Math.min(prev + 1, allMedia.length - 1)
                                                        : Math.max(prev - 1, 0)
                                                );
                                            }
                                            setTouchStartX(null);
                                        }}
                                    >
                                        {allMedia.map((src, index) => (
                                            <div key={src} className="w-full flex-shrink-0 flex items-center justify-center">
                                                <Image
                                                    src={src}
                                                    alt={index === 0 ? product.name : `${product.name} - ${product.categories?.[0] || ''} - Image ${index}`}
                                                    width={1000}
                                                    height={1000}
                                                    sizes="100vw"
                                                    unoptimized={src.startsWith('blob:')}
                                                    priority={index === 0}
                                                    className="w-full h-auto object-contain"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile dots */}
                                    {allMedia.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10 bg-stone-950/20 backdrop-blur-sm px-3 py-2 rounded-full">
                                            {allMedia.map((src, index) => (
                                                <button
                                                    key={src}
                                                    onClick={() => setSelectedImageIndex(index)}
                                                    aria-label={`Image ${index + 1}`}
                                                    aria-current={selectedImageIndex === index ? 'true' : undefined}
                                                    className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${selectedImageIndex === index
                                                        ? 'bg-[#E11D00] w-5'
                                                        : 'bg-stone-400 w-1.5'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile thumbnail strip */}
                                {allMedia.length > 1 && (
                                    <div className="grid grid-cols-7 gap-2 mt-3">
                                        {allMedia.map((src, index) => (
                                            <button
                                                key={src}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`relative aspect-square overflow-hidden border transition-all duration-200 bg-[#ECE8DA]/20 rounded-md flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none ${selectedImageIndex === index
                                                    ? 'border-[#E11D00] border-2'
                                                    : 'border-stone-300'
                                                    }`}
                                            >
                                                <Image
                                                    src={src}
                                                    alt={index === 0 ? product.name : `${product.name} - ${product.categories?.[0] || ''} - Image ${index}`}
                                                    fill
                                                    sizes="60px"
                                                    className="object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ Related Products ═══ */}
                        {relatedProducts.length > 0 && (
                            <section className="py-16 border-t border-stone-300 mt-16">
                                <h2 className="text-xl lg:text-2xl font-light text-stone-950 font-sans mb-12">
                                    More Products
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                                    {relatedProducts.map((rp) => (
                                        <Link
                                            key={rp.id}
                                            href={`/shop/${rp.slug}`}
                                            className="cursor-pointer group block focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg p-1 transition-all"
                                        >
                                            <div className="mb-4 overflow-hidden flex items-center justify-center aspect-[3/4] bg-[#ECE8DA]/35 border border-stone-200/40 rounded-lg">
                                                {rp.main_image ? (
                                                    <Image
                                                        src={rp.main_image}
                                                        alt={rp.name}
                                                        width={600}
                                                        height={800}
                                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                                                        unoptimized={rp.main_image.startsWith('blob:')}
                                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-4"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <h3 className="text-sm font-medium text-stone-950 leading-tight line-clamp-2 group-hover:text-[#E11D00] transition-colors duration-200">
                                                    {rp.name}
                                                </h3>
                                                <p className="text-sm text-stone-950 font-semibold font-sans">
                                                    {rp.price.toLocaleString('en-US')} USD
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart notification toast */}
            {showCartNotification && (
                <div className="fixed top-4 ltr:right-4 bg-[#E11D00] border-2 border-stone-950 text-white px-6 py-3 font-semibold rounded-md z-50 shadow-2xl text-sm animate-in slide-in-from-top-2 fade-in duration-300">
                    ✓ Added to Cart
                </div>
            )}

            <Footer />
        </>
    );
}
