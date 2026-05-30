// ─── Google Analytics 4 (gtag.js) Wrapper ─────────────────────
// Maps our standard events to GA4 recommended e-commerce events.
// Completely disabled when NEXT_PUBLIC_GA4_MEASUREMENT_ID is not set.

import type { AnalyticsEvent } from './types';

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        dataLayer: unknown[];
    }
}

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';

export function isGA4Enabled(): boolean {
    return !!GA4_ID;
}

export function getGA4Id(): string {
    return GA4_ID;
}

/** Initialize gtag (called once — the script is loaded via next/script) */
export function initGA4(): void {
    if (!isGA4Enabled()) return;
    if (typeof window === 'undefined') return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {
        send_page_view: false, // We fire page views manually on route change
    });
}

/** Track an analytics event via GA4 */
export function trackGA4Event(event: AnalyticsEvent): void {
    if (!isGA4Enabled()) return;
    if (typeof window === 'undefined' || !window.gtag) return;

    switch (event.name) {
        case 'PageView':
            window.gtag('event', 'page_view', {
                page_location: event.params.url,
                page_referrer: event.params.referrer,
                language: event.params.locale,
            });
            break;

        case 'ViewContent':
            window.gtag('event', 'view_item', {
                currency: event.params.currency,
                value: event.params.value,
                items: event.params.content_ids.map(id => ({
                    item_id: id,
                    item_name: event.params.content_name,
                })),
            });
            break;

        case 'AddToCart':
            window.gtag('event', 'add_to_cart', {
                currency: event.params.currency,
                value: event.params.value,
                items: event.params.content_ids.map(id => ({
                    item_id: id,
                    item_name: event.params.content_name,
                    quantity: event.params.num_items,
                })),
            });
            break;

        case 'InitiateCheckout':
            window.gtag('event', 'begin_checkout', {
                currency: event.params.currency,
                value: event.params.value,
                items: event.params.content_ids.map(id => ({
                    item_id: id,
                    quantity: 1,
                })),
            });
            break;

        case 'AddPaymentInfo':
            window.gtag('event', 'add_payment_info', {
                currency: event.params.currency,
                value: event.params.value,
                payment_type: event.params.payment_method,
            });
            break;

        case 'Purchase':
            window.gtag('event', 'purchase', {
                currency: event.params.currency,
                value: event.params.value,
                transaction_id: event.params.transaction_id,
                items: event.params.content_ids.map(id => ({
                    item_id: id,
                    quantity: 1,
                })),
            });
            break;
    }
}
