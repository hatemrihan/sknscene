import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ─── GET /api/admin/funnel ────────────────────────────────────
// Returns funnel analytics data for the admin dashboard.
// Query params: period=7d|30d|90d (default: 30d)

const FUNNEL_STAGES = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'] as const;

function parsePeriod(period: string | null): number {
    switch (period) {
        case '7d': return 7;
        case '90d': return 90;
        default: return 30;
    }
}

export async function GET(req: NextRequest) {
    try {
        const period = req.nextUrl.searchParams.get('period');
        const days = parsePeriod(period);
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        // 1. Funnel counts — unique sessions per stage
        const funnelPromises = FUNNEL_STAGES.map(async (stage) => {
            // Count unique session_ids for each event type
            const { data, error } = await supabaseAdmin
                .from('analytics_events')
                .select('session_id')
                .eq('event_name', stage)
                .gte('created_at', since)
                .not('session_id', 'is', null);

            if (error) {
                console.error(`[Funnel] Error for ${stage}:`, error.message);
                return { stage, unique_sessions: 0 };
            }

            // Count unique sessions
            const uniqueSessions = new Set(data?.map(d => d.session_id)).size;
            return { stage, unique_sessions: uniqueSessions };
        });

        const funnel = await Promise.all(funnelPromises);

        // 2. Total events count
        const { count: totalEvents } = await supabaseAdmin
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', since);

        // 3. Revenue from Purchase events
        const { data: purchaseEvents } = await supabaseAdmin
            .from('analytics_events')
            .select('payload')
            .eq('event_name', 'Purchase')
            .gte('created_at', since);

        const totalRevenue = purchaseEvents?.reduce((sum, e) => {
            const payload = e.payload as Record<string, unknown>;
            return sum + (Number(payload?.value) || 0);
        }, 0) ?? 0;

        // 4. Top abandoned products (AddToCart but no Purchase in same session)
        const { data: cartEvents } = await supabaseAdmin
            .from('analytics_events')
            .select('session_id, payload')
            .eq('event_name', 'AddToCart')
            .gte('created_at', since);

        const { data: purchaseSessions } = await supabaseAdmin
            .from('analytics_events')
            .select('session_id')
            .eq('event_name', 'Purchase')
            .gte('created_at', since);

        const purchaseSessionSet = new Set(purchaseSessions?.map(p => p.session_id));
        const abandonedProducts: Record<string, { name: string; count: number }> = {};

        cartEvents?.forEach(event => {
            if (!event.session_id || purchaseSessionSet.has(event.session_id)) return;
            const payload = event.payload as Record<string, unknown>;
            const name = (payload?.content_name as string) || 'Unknown';
            const ids = (payload?.content_ids as string[]) || [];
            const key = ids[0] || name;
            if (!abandonedProducts[key]) {
                abandonedProducts[key] = { name, count: 0 };
            }
            abandonedProducts[key].count++;
        });

        const topAbandoned = Object.values(abandonedProducts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // 5. Daily event breakdown (for chart)
        const { data: dailyEvents } = await supabaseAdmin
            .from('analytics_events')
            .select('event_name, created_at')
            .gte('created_at', since)
            .order('created_at', { ascending: true });

        const dailyMap: Record<string, Record<string, number>> = {};
        dailyEvents?.forEach(e => {
            const date = new Date(e.created_at).toISOString().split('T')[0];
            if (!dailyMap[date]) dailyMap[date] = {};
            dailyMap[date][e.event_name] = (dailyMap[date][e.event_name] || 0) + 1;
        });

        const dailyChart = Object.entries(dailyMap).map(([date, events]) => ({
            date,
            pageviews: events['PageView'] || 0,
            views: events['ViewContent'] || 0,
            carts: events['AddToCart'] || 0,
            checkouts: events['InitiateCheckout'] || 0,
            purchases: events['Purchase'] || 0,
        }));

        // 6. Calculate rates
        const pageViews = funnel.find(f => f.stage === 'PageView')?.unique_sessions || 0;
        const addToCarts = funnel.find(f => f.stage === 'AddToCart')?.unique_sessions || 0;
        const checkouts = funnel.find(f => f.stage === 'InitiateCheckout')?.unique_sessions || 0;
        const purchases = funnel.find(f => f.stage === 'Purchase')?.unique_sessions || 0;

        const cartAbandonmentRate = addToCarts > 0
            ? Math.round(((addToCarts - purchases) / addToCarts) * 10000) / 100
            : 0;
        const checkoutAbandonmentRate = checkouts > 0
            ? Math.round(((checkouts - purchases) / checkouts) * 10000) / 100
            : 0;
        const conversionRate = pageViews > 0
            ? Math.round((purchases / pageViews) * 10000) / 100
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                funnel,
                totalEvents: totalEvents || 0,
                totalRevenue,
                cartAbandonmentRate,
                checkoutAbandonmentRate,
                conversionRate,
                topAbandoned,
                dailyChart,
                period: `${days}d`,
            },
        });
    } catch (err) {
        console.error('[Funnel API] Error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch funnel data' }, { status: 500 });
    }
}
