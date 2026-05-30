'use client';

// ─── Analytics Provider ───────────────────────────────────────
// Injects Meta Pixel + GA4 scripts, fires PageView on route changes,
// and exposes useAnalytics() hook for event tracking throughout the app.

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import type { AnalyticsEvent } from './types';
import { initMetaPixel, trackMetaEvent, isMetaPixelEnabled } from './meta-pixel';
import { initGA4, trackGA4Event, isGA4Enabled, getGA4Id } from './gtag';

// ── Generate unique event ID for deduplication ──
function generateEventId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ── Get or create anonymous session ID ──
function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    const key = 'sknscene_sid';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
        sid = generateEventId();
        sessionStorage.setItem(key, sid);
    }
    return sid;
}

// ── Send event to our own API (non-blocking) ──
function sendToServer(event: AnalyticsEvent, eventId: string) {
    try {
        const payload = JSON.stringify({
            event_name: event.name,
            event_id: eventId,
            url: typeof window !== 'undefined' ? window.location.href : '',
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            locale: typeof window !== 'undefined'
                ? (window.location.pathname.match(/^\/(ar|en)/)?.[1] || 'ar')
                : 'ar',
            session_id: getSessionId(),
            params: event.params,
        });

        // Use sendBeacon for reliability (survives page unloads)
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/event', new Blob([payload], { type: 'application/json' }));
        } else {
            fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            }).catch(() => { /* analytics should never break UX */ });
        }
    } catch {
        // Silently ignore — analytics must never break UX
    }
}

// ── Context ───────────────────────────────────────────────────

type AnalyticsContextType = {
    trackEvent: (event: AnalyticsEvent) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType>({
    trackEvent: () => { /* no-op until provider mounts */ },
});

export function useAnalytics() {
    return useContext(AnalyticsContext);
}

// ── Provider ──────────────────────────────────────────────────

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const prevPathRef = useRef<string>('');
    const initializedRef = useRef(false);

    // Initialize pixels on mount (client-side only)
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        initMetaPixel();
        initGA4();
    }, []);

    // Fire PageView on every route change
    useEffect(() => {
        if (!pathname || pathname === prevPathRef.current) return;
        prevPathRef.current = pathname;

        // Small delay to let the page settle (title, etc.)
        const timer = setTimeout(() => {
            const locale = pathname.match(/^\/(ar|en)/)?.[1] || 'ar';
            const event: AnalyticsEvent = {
                name: 'PageView',
                params: {
                    url: window.location.href,
                    referrer: document.referrer,
                    locale,
                },
            };

            const eventId = generateEventId();
            trackMetaEvent(event, eventId);
            trackGA4Event(event);
            sendToServer(event, eventId);
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    // ── Track event (used by components) ──────────────────────
    const trackEvent = useCallback((event: AnalyticsEvent) => {
        const eventId = generateEventId();
        trackMetaEvent(event, eventId);
        trackGA4Event(event);
        sendToServer(event, eventId);
    }, []);

    const ga4Id = getGA4Id();

    return (
        <AnalyticsContext.Provider value={{ trackEvent }}>
            {/* GA4 script — loaded asynchronously after page interactive */}
            {isGA4Enabled() && (
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                    strategy="afterInteractive"
                />
            )}

            {/* Meta Pixel noscript fallback */}
            {isMetaPixelEnabled() && (
                <noscript>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        height="1"
                        width="1"
                        style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                        alt=""
                    />
                </noscript>
            )}

            {children}
        </AnalyticsContext.Provider>
    );
}
