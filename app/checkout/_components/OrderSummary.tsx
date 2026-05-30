'use client';

import type { CartItem } from '@/app/components/contexts/CartContext';
import Image from 'next/image';

type Props = {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    codFee: number;
    promoDiscount: number;
    total: number;
    promoCode: string;
    promoApplied: boolean;
    promoError: string;
    onPromoChange: (code: string) => void;
    onPromoApply: () => void;
    onPromoRemove: () => void;
    isSubmitting: boolean;
    submitError: string;
    onSubmit: () => void;
    totalItems: number;
    disabled?: boolean;
};

export function OrderSummary({
    items,
    subtotal,
    shippingCost,
    codFee,
    promoDiscount,
    total,
    promoCode,
    promoApplied,
    promoError,
    onPromoChange,
    onPromoApply,
    onPromoRemove,
    isSubmitting,
    submitError,
    onSubmit,
    totalItems,
    disabled,
}: Props) {
    const currencySymbol = "USD";

    return (
        <div className="border border-neutral-200 p-6 text-left">
            {/* ── Header ──────────────────────────────── */}
            <h3 className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase mb-6">
                Order Summary
            </h3>

            {/* ── Item thumbnails ─────────────────────── */}
            <div className="space-y-4 mb-6 pb-6 border-b border-neutral-100">
                {items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex gap-3 items-start flex-row-reverse">
                        {/* Image */}
                        <div className="relative w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="56px"
                                    className="object-contain"
                                />
                            ) : (
                                <div className="w-6 h-6 text-neutral-300">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm text-neutral-800 font-light leading-tight line-clamp-1">
                                {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-row-reverse">
                                {item.variant?.attributes && Object.entries(item.variant.attributes).map(([key, val], i, arr) => (
                                    <span key={key} className="text-[11px] text-neutral-400">
                                        {key}: {val}{i < arr.length - 1 ? ' ·' : ''}
                                    </span>
                                ))}
                                <span className="text-[11px] text-neutral-400">×{item.quantity.toLocaleString('en-US')}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <p className="text-sm text-neutral-900 font-light shrink-0 text-right">
                            {(item.price * item.quantity).toLocaleString('en-US')} {currencySymbol}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Promo code ──────────────────────────── */}
            <div className="mb-6 pb-6 border-b border-neutral-100">
                {promoApplied ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 flex-row-reverse">
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-green-700 font-medium">{promoCode}</span>
                        </div>
                        <button
                            onClick={onPromoRemove}
                            className="text-xs text-neutral-500 underline hover:text-neutral-900 cursor-pointer"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 flex-row-reverse">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => onPromoChange(e.target.value.toUpperCase())}
                            onKeyDown={(e) => { if (e.key === 'Enter') onPromoApply(); }}
                            placeholder="Promo code"
                            className="flex-1 border-b border-neutral-300 bg-transparent text-sm text-neutral-900 pb-2 outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-300 text-left"
                            dir="ltr"
                        />
                        <button
                            onClick={onPromoApply}
                            disabled={isSubmitting}
                            className="text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-600 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Apply
                        </button>
                    </div>
                )}
                {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
            </div>

            {/* ── Price breakdown ─────────────────────── */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm flex-row-reverse">
                    <span className="text-neutral-500">
                        Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                    </span>
                    <span className="text-neutral-900">{subtotal.toLocaleString('en-US')} {currencySymbol}</span>
                </div>

                <div className="flex justify-between text-sm flex-row-reverse">
                    <span className="text-neutral-500">Shipping</span>
                    <span className="text-neutral-900">
                        {shippingCost > 0 ? `${shippingCost.toLocaleString('en-US')} ${currencySymbol}` : "Calculated after selecting governorate"}
                    </span>
                </div>

                {codFee > 0 && (
                    <div className="flex justify-between text-sm flex-row-reverse">
                        <span className="text-neutral-500">Cash on Delivery fee</span>
                        <span className="text-neutral-900">{codFee.toLocaleString('en-US')} {currencySymbol}</span>
                    </div>
                )}

                {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm flex-row-reverse">
                        <span className="text-green-600">Discount</span>
                        <span className="text-green-600">-{promoDiscount.toLocaleString('en-US')} {currencySymbol}</span>
                    </div>
                )}
            </div>

            {/* ── Total ───────────────────────────────── */}
            <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between items-baseline flex-row-reverse">
                    <span className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase">Total</span>
                    <span className="text-lg font-medium text-neutral-900">
                        {total.toLocaleString('en-US')} {currencySymbol}
                    </span>
                </div>
            </div>

            {/* ── Submit error ─────────────────────────── */}
            {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium leading-relaxed">{submitError}</p>
                </div>
            )}

            {/* ── Submit button ────────────────────────── */}
            <button
                onClick={onSubmit}
                disabled={disabled || isSubmitting}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? "Creating order" : "Checkout"}
                className="w-full bg-neutral-900 text-white py-4 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer rounded-md flex items-center justify-center"
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                        <span>Creating order...</span>
                    </span>
                ) : (
                    "Checkout"
                )}
            </button>
        </div>
    );
}
