// ─── Meta Pixel Wrapper ───────────────────────────────────────
// Wraps fbq() calls with type safety and event_id deduplication.
// Completely disabled when NEXT_PUBLIC_META_PIXEL_ID is not set.

import type { AnalyticsEvent } from './types';

// Global fbq type — optional so TS allows truthiness checks
declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
        _fbq?: (...args: unknown[]) => void;
    }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

export function isMetaPixelEnabled(): boolean {
    return !!PIXEL_ID;
}

/** Inject the Meta Pixel base script (called once on mount) */
export function initMetaPixel(): void {
    if (!isMetaPixelEnabled()) return;
    if (typeof window === 'undefined') return;
    if (typeof window.fbq === 'function') return; // Already initialized

    /* eslint-disable @typescript-eslint/no-explicit-any, prefer-spread, prefer-rest-params, @typescript-eslint/no-unused-expressions */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable @typescript-eslint/no-explicit-any, prefer-spread, prefer-rest-params, @typescript-eslint/no-unused-expressions */

    if (window.fbq) (window as { fbq: (...args: unknown[]) => void }).fbq('init', PIXEL_ID);
}

/** Track an analytics event via Meta Pixel */
export function trackMetaEvent(event: AnalyticsEvent, eventId: string): void {
    if (!isMetaPixelEnabled()) return;
    if (typeof window === 'undefined' || !window.fbq) return;

    const fbq = window.fbq;

    switch (event.name) {
        case 'PageView':
            fbq('track', 'PageView', {}, { eventID: eventId });
            break;

        case 'ViewContent':
            fbq('track', 'ViewContent', {
                content_ids: event.params.content_ids,
                content_name: event.params.content_name,
                content_type: event.params.content_type,
                value: event.params.value,
                currency: event.params.currency,
            }, { eventID: eventId });
            break;

        case 'AddToCart':
            fbq('track', 'AddToCart', {
                content_ids: event.params.content_ids,
                content_name: event.params.content_name,
                value: event.params.value,
                currency: event.params.currency,
                num_items: event.params.num_items,
                content_type: 'product',
            }, { eventID: eventId });
            break;

        case 'InitiateCheckout':
            fbq('track', 'InitiateCheckout', {
                content_ids: event.params.content_ids,
                value: event.params.value,
                currency: event.params.currency,
                num_items: event.params.num_items,
            }, { eventID: eventId });
            break;

        case 'AddPaymentInfo':
            fbq('track', 'AddPaymentInfo', {
                value: event.params.value,
                currency: event.params.currency,
            }, { eventID: eventId });
            break;

        case 'Purchase':
            fbq('track', 'Purchase', {
                value: event.params.value,
                currency: event.params.currency,
                content_ids: event.params.content_ids,
                content_type: 'product',
                num_items: event.params.num_items,
            }, { eventID: eventId });
            break;
    }
}
