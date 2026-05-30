'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Nav from '@/app/sections/nav';
import Footer from '@/app/sections/footer';
import { useCart } from '@/app/components/contexts/CartContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

export default function CartPage() {
    const router = useRouter();
    const {
        state,
        removeItem,
        updateQuantity,
        totalItems,
        totalPrice,
    } = useCart();

    const items = state.items;

    // ── Empty cart ───────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#F5F2EB]" dir="ltr">
                <Nav />
                <div className="pt-28 pb-20">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-light text-neutral-800 mb-3">Your cart is empty</h1>
                        <p className="text-sm text-neutral-500 mb-8">You have not added any items yet</p>
                        <Link
                            href="/shop"
                            className="inline-block bg-neutral-900 text-white px-10 py-3.5 text-sm font-medium hover:bg-neutral-800 transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const currencySymbol = "USD";

    // ── Cart with items ─────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F5F2EB]" dir="ltr">
            <Nav />

            <div className="pt-24 pb-20">
                <div className="max-w-5xl mx-auto px-6">

                    {/* ── Header ─────────────────────────────── */}
                    <div className="text-center mb-14">
                        <h1 className="text-2xl font-light tracking-wide text-neutral-900 mb-1">
                            Shopping Cart
                        </h1>
                        <p className="text-sm text-neutral-400">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    {/* ── Cart items ──────────────────────────── */}
                    <div className="divide-y divide-neutral-200">
                        {items.map((item, index) => (
                            <CartItemRow
                                key={`${item.id}-${item.variant ? Object.entries(item.variant.attributes || {}).sort().map(([k, v]) => `${k}:${v}`).join('|') : 'no-variant'}-${index}`}
                                item={item}
                                onRemove={() => removeItem(item.id, item.variant)}
                                onQuantityChange={(qty) => updateQuantity(item.id, item.variant, qty)}
                            />
                        ))}
                    </div>

                    {/* ── Summary ─────────────────────────────── */}
                    <div className="border-t border-neutral-200 mt-2 pt-10">
                        <div className="max-w-md ml-auto mr-0">
                            {/* Subtotal */}
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm text-neutral-500">Subtotal</span>
                                <span className="text-sm text-neutral-900">
                                    {totalPrice.toLocaleString('en-US')} {currencySymbol}
                                </span>
                            </div>

                            {/* Shipping notice */}
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm text-neutral-500">Shipping</span>
                                <span className="text-sm text-neutral-400">Calculated at checkout</span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-neutral-200 my-4" />

                            {/* Total */}
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-base font-medium text-neutral-900">Total</span>
                                <span className="text-base font-medium text-neutral-900">
                                    {totalPrice.toLocaleString('en-US')} {currencySymbol}
                                </span>
                            </div>

                            {/* Checkout button */}
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-neutral-900 text-white py-4 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                                Checkout
                            </button>

                            {/* Continue shopping */}
                            <div className="text-center mt-5">
                                <Link
                                    href="/shop"
                                    className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

// ─── Individual Cart Item Row ─────────────────────────────────

type CartItemRowProps = {
    item: {
        id: string;
        name: string;
        image: string;
        price: number;
        quantity: number;
        maxStock?: number;
        variant?: { attributes: Record<string, string> };
    };
    onRemove: () => void;
    onQuantityChange: (qty: number) => void;
};

function CartItemRow({ item, onRemove, onQuantityChange }: CartItemRowProps) {
    const lineTotal = item.price * item.quantity;
    const currencySymbol = "USD";

    return (
        <div className="py-10 grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-6 sm:gap-10 items-start">
            {/* ── Image ─────────────────────────────────────── */}
            <div className="relative aspect-square overflow-hidden w-full sm:w-[200px]">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="200px"
                        className="object-contain"
                        unoptimized={item.image.startsWith('blob:')}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-300">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* ── Details ────────────────────────────────────── */}
            <div className="flex-1 space-y-3 min-w-0">
                {/* Name */}
                <h3 className="text-base font-light text-neutral-800 leading-snug">
                    {item.name}
                </h3>

                {/* Variant details — dynamic attributes */}
                <div className="space-y-1.5">
                    {item.variant?.attributes && Object.entries(item.variant.attributes).map(([key, value]) => (
                        <div key={key} className="flex items-baseline gap-6 text-sm">
                            <span className="text-neutral-400 w-14 shrink-0">{key}</span>
                            <span className="text-neutral-700">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Quantity selector + Remove — in a row */}
                <div className="flex items-center gap-6 pt-3">
                    {/* Quantity dropdown */}
                    <Select
                        value={String(item.quantity)}
                        onValueChange={(val) => onQuantityChange(parseInt(val, 10))}
                    >
                        <SelectTrigger className="w-[72px] h-10 border border-neutral-300 bg-[#F5F2EB] text-neutral-900 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#F5F2EB] border border-neutral-200">
                            {Array.from({ length: Math.min(item.maxStock || 10, 10) }, (_, i) => i + 1).map((num) => (
                                <SelectItem
                                    key={num}
                                    value={String(num)}
                                    className="cursor-pointer text-sm"
                                >
                                    {num.toLocaleString('en-US')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Remove */}
                    <button
                        onClick={onRemove}
                        className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* ── Price ──────────────────────────────────────── */}
            <div className="text-left sm:text-left shrink-0 sm:pt-0">
                <p className="text-base text-neutral-900 font-medium">
                    {lineTotal.toLocaleString('en-US')} {currencySymbol}
                </p>
                {item.quantity > 1 && (
                    <p className="text-xs text-neutral-400 mt-1">
                        {item.price.toLocaleString('en-US')} {currencySymbol} / each
                    </p>
                )}
            </div>
        </div>
    );
}
