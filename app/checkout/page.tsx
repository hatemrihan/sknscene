'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/app/sections/nav';
import Footer from '@/app/sections/footer';
import { useCart } from '@/app/components/contexts/CartContext';
import { CustomerInfoForm } from './_components/CustomerInfoForm';
import { PaymentMethodSelector } from './_components/PaymentMethodSelector';
import { OrderSummary } from './_components/OrderSummary';
import { useAnalytics } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────

export type CustomerInfo = {
    firstName: string;
    lastName: string;
    address: string;
    moreInfo: string;
    governorate: string;
    city: string;
    phone: string;
    email: string;
    lat?: number;
    lng?: number;
};

export type PaymentChoice = {
    method: 'instaPay' | 'cashOnDelivery';
    screenshotUrl?: string;
};

export type GovernoratePricingData = {
    governorate: string;
    shipping_cost: number;
    cod_fee: number;
    is_active: boolean;
};

// ─── Page ─────────────────────────────────────────────────────

export default function CheckoutPage() {
    const router = useRouter();
    const { state, totalPrice, totalItems, clearCart, isLoaded } = useCart();
    const { trackEvent } = useAnalytics();

    // ── State ───────────────────────────────────────────────
    const [customer, setCustomer] = useState<CustomerInfo>({
        firstName: '', lastName: '', address: '', moreInfo: '',
        governorate: '', city: '', phone: '', email: '',
    });

    const [payment, setPayment] = useState<PaymentChoice>({ method: 'cashOnDelivery' });

    const [governoratePricing, setGovernoratePricing] = useState<GovernoratePricingData[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoError, setPromoError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSuccess, setIsSuccess] = useState(false);

    const [paymentSettings, setPaymentSettings] = useState({ codEnabled: true, instaPayEnabled: true });

    // ── Redirect if cart is empty ─────────────────────────────
    useEffect(() => {
        if (!isSuccess && isLoaded && state.items.length === 0) {
            router.replace('/cart');
        }
    }, [isLoaded, state.items.length, router, isSuccess]);

    // ── Fetch governorate pricing & payment settings ─────────
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/governate-pricing', { cache: 'no-store' }).then(r => r.json()),
            fetch('/api/admin/payment-settings', { cache: 'no-store' }).then(r => r.json()),
        ]).then(([pricingData, paymentData]) => {
            if (pricingData.success) setGovernoratePricing(pricingData.pricing);
            if (paymentData.success) setPaymentSettings(paymentData.settings);
        }).catch(() => { }).finally(() => setSettingsLoaded(true));
    }, []);

    // ── Analytics: InitiateCheckout on page mount ─────────────
    useEffect(() => {
        if (!isLoaded || state.items.length === 0) return;
        trackEvent({
            name: 'InitiateCheckout',
            params: {
                content_ids: state.items.map(i => i.id),
                value: totalPrice,
                currency: 'USD',
                num_items: totalItems,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    // ── Analytics: AddPaymentInfo on payment method change ────
    useEffect(() => {
        if (!isLoaded || state.items.length === 0) return;
        trackEvent({
            name: 'AddPaymentInfo',
            params: {
                value: totalPrice,
                currency: 'USD',
                payment_method: payment.method,
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payment.method]);

    // ── Re-validate stock on checkout mount & focus ───────────
    const [stockWarning, setStockWarning] = useState('');

    const validateStock = useCallback(async () => {
        if (!isLoaded || state.items.length === 0) return;
        try {
            for (const item of state.items) {
                const res = await fetch(`/api/products/stock?id=${item.id}`, { cache: 'no-store' });
                if (!res.ok) continue;
                const data = await res.json();
                if (!data.success) continue;

                let available = data.stock;
                if (item.variant?.attributes && data.variants) {
                    const attrs = item.variant.attributes;
                    const variant = data.variants.find((v: { attributes: Record<string, string>; stock: number }) => {
                        const keys = Object.keys(attrs);
                        return keys.length === Object.keys(v.attributes || {}).length &&
                            keys.every(k => v.attributes[k] === attrs[k]);
                    });
                    if (variant) available = variant.stock;
                }

                if (item.quantity > available) {
                    setStockWarning(available <= 0
                        ? `"${item.name}" is out of stock. Please remove it from the cart.`
                        : `"${item.name}" — only ${available} left. Please adjust the quantity.`
                    );
                    return;
                }
            }
            setStockWarning('');
        } catch { }
    }, [isLoaded, state.items]);

    useEffect(() => {
        const timer = setTimeout(() => validateStock(), 0);
        const handleFocus = () => validateStock();
        window.addEventListener('focus', handleFocus);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [validateStock]);

    // ── Location detection handler ────────────────────────────
    const handleLocationDetected = (governorate: string, city: string, lat?: number, lng?: number) => {
        setCustomer(prev => ({
            ...prev,
            governorate: governorate || prev.governorate,
            city: city || prev.city,
            lat,
            lng,
        }));
    };

    // ── Computed pricing ──────────────────────────────────────
    const selectedPricing = governoratePricing.find(
        g => g.governorate === customer.governorate
    );

    const shippingCost = selectedPricing?.shipping_cost ?? 0;
    const codFee = payment.method === 'cashOnDelivery' ? (selectedPricing?.cod_fee ?? 0) : 0;
    const subtotal = totalPrice;
    const total = subtotal + shippingCost + codFee - promoDiscount;

    // ── Promo validation ──────────────────────────────────────
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoError('');

        try {
            const res = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, subtotal }),
            });
            const data = await res.json();

            if (data.success) {
                setPromoDiscount(data.discount.discountAmount);
                setPromoApplied(true);
            } else {
                setPromoError(data.error);
                setPromoDiscount(0);
                setPromoApplied(false);
            }
        } catch {
            setPromoError("Failed to validate promo code");
        }
    };

    // ── Form validation ───────────────────────────────────────
    const validateForm = (): boolean => {
        setFormErrors({});
        const errors: Record<string, string> = {};

        if (!customer.firstName.trim()) errors.firstName = "First name required";
        if (!customer.lastName.trim()) errors.lastName = "Last name required";
        if (!customer.address.trim()) errors.address = "Address required";
        if (!customer.governorate) errors.governorate = "Governorate required";
        if (!customer.city) errors.city = "City required";
        if (!customer.phone.trim()) errors.phone = "Phone number required";
        if (customer.phone && !/^\d{7,8}$/.test(customer.phone.replace(/\s/g, ''))) {
            errors.phone = "Invalid phone number";
        }
        if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
            errors.email = "Invalid email";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Submit order ──────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateForm()) {
            setSubmitError("Please review and complete the required fields in the form above");
            setTimeout(() => setSubmitError(''), 4000);
            return;
        }
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer,
                    deliveryMethod: 'home',
                    paymentMethod: payment.method,
                    transactionScreenshot: payment.screenshotUrl,
                    promoCode: promoApplied ? promoCode : undefined,
                    discountAmount: promoDiscount,
                    items: state.items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        attributes: item.variant?.attributes,
                        image: item.image,
                    })),
                    subtotal,
                    shippingCost,
                    codFee,
                    totalAmount: total,
                    lat: customer.lat,
                    lng: customer.lng,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                clearCart();

                // Analytics: Purchase event
                trackEvent({
                    name: 'Purchase',
                    params: {
                        value: total,
                        currency: 'USD',
                        transaction_id: data.order.orderId,
                        content_ids: state.items.map(i => i.id),
                        num_items: totalItems,
                    },
                });

                router.push(`/checkout/confirmation?orderId=${data.order.orderId}`);
            } else {
                setSubmitError(data.error || "Failed to create order, please try again");
                setTimeout(() => setSubmitError(''), 4000);
            }
        } catch {
            setSubmitError("Connection error occurred. Please try again.");
            setTimeout(() => setSubmitError(''), 4000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isSuccess && state.items.length === 0) {
        return null;
    }

    if (!settingsLoaded) {
        return (
            <div className="min-h-screen bg-[#F5F2EB]">
                <Nav />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-300" />
                </div>
                <Footer />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F5F2EB]" dir="ltr">
            <Nav />

            <div className="pt-24 pb-20">
                <div className="max-w-6xl mx-auto px-6">

                    {/* ── Header ───────────────────────── */}
                    <div className="mb-12">
                        <h1 className="text-2xl font-light tracking-wide text-neutral-900 mb-1">
                            Checkout
                        </h1>
                        <p className="text-sm text-neutral-400">
                            Complete your details to finish your purchase
                        </p>
                    </div>

                    {/* ── Two-column layout ────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">

                        {/* ── LEFT: Form sections ──────── */}
                        <div className="space-y-14">
                            {/* Customer form fields */}
                            <section>
                                <CustomerInfoForm
                                    customer={customer}
                                    onChange={setCustomer}
                                    errors={formErrors}
                                    onLocationDetected={handleLocationDetected}
                                />
                            </section>

                            {/* Payment method */}
                            <PaymentMethodSelector
                                payment={payment}
                                onChange={setPayment}
                                codEnabled={paymentSettings.codEnabled}
                                codFee={codFee}
                                error={formErrors.screenshot}
                            />
                        </div>

                        {/* ── RIGHT: Order Summary ─────── */}
                        <div className="lg:sticky lg:top-24 self-start">
                            {/* Stock warning */}
                            {stockWarning && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                                    ⚠️ {stockWarning}
                                </div>
                            )}

                            <OrderSummary
                                items={state.items}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                codFee={codFee}
                                promoDiscount={promoDiscount}
                                total={total}
                                promoCode={promoCode}
                                promoApplied={promoApplied}
                                promoError={promoError}
                                onPromoChange={setPromoCode}
                                onPromoApply={handleApplyPromo}
                                onPromoRemove={() => {
                                    setPromoCode('');
                                    setPromoDiscount(0);
                                    setPromoApplied(false);
                                    setPromoError('');
                                }}
                                isSubmitting={isSubmitting}
                                submitError={submitError || stockWarning}
                                onSubmit={handleSubmit}
                                disabled={isSubmitting || !!stockWarning}
                                totalItems={totalItems}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
