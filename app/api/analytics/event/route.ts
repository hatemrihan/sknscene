import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ─── POST /api/analytics/event ────────────────────────────────
// Receives events from the frontend AnalyticsProvider, stores in Supabase.
// Runs server-side to capture IP + User-Agent (not available client-side).

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            event_name,
            event_id,
            url,
            referrer,
            locale,
            session_id,
            params,
        } = body;

        if (!event_name || !event_id) {
            return NextResponse.json({ error: 'Missing event_name or event_id' }, { status: 400 });
        }

        // Extract server-side data
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || null;
        const userAgent = req.headers.get('user-agent') || null;

        // Parse URL path from full URL
        let urlPath: string | null = null;
        try {
            urlPath = url ? new URL(url).pathname : null;
        } catch {
            urlPath = url || null;
        }

        // Insert event
        const { error } = await supabaseAdmin
            .from('analytics_events')
            .insert(
                {
                    event_id,
                    session_id: session_id || null,
                    event_name,
                    url_path: urlPath,
                    referrer: referrer || null,
                    locale: locale || 'ar',
                    payload: params || {},
                    ip_address: ip,
                    user_agent: userAgent,
                }
            );

        if (error) {
            console.error('[Analytics] DB insert error:', error.message);
            // Don't return 500 — analytics should never break the user experience
            return NextResponse.json({ success: true, stored: false });
        }

        return NextResponse.json({ success: true, stored: true });
    } catch (err) {
        console.error('[Analytics] Route error:', err);
        return NextResponse.json({ success: true, stored: false });
    }
}
