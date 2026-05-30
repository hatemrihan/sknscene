import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';
import { getStoreSettings } from '@/lib/settings';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // ── Load settings first ───
        const settings = await getStoreSettings();
        const lowStockThreshold = settings.low_stock_threshold;

        // ── Run queries ──────────────────
        const [
            ordersRes,
            productsCountRes,
            activeProductsRes,
            categoriesCountRes,
            subscribersRes,
            activeSubsRes,
            promosRes,
            contactsRes,
            recentProductsRes,
            returnsCountRes,
            lowStockRes,
        ] = await Promise.all([
            // ── Performance Warning: Fetching all orders for in-memory aggregation ──
            // As the store grows beyond ~5,000 orders, this will become slow.
            // TODO: Move aggregation to a Postgres View or RPC function for better performance.
            supabaseAdmin
                .from('orders')
                .select('status, total, created_at, order_number, customer_name, customer_email'),
            supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('newsletters').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('newsletters').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabaseAdmin.from('promos').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('contacts').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('products').select('id, name, price, is_featured, created_at, images').order('created_at', { ascending: false }).limit(5),
            supabaseAdmin.from('returns').select('*', { count: 'exact', head: true }),
            supabaseAdmin
                .from('products')
                .select('id, name, stock, images')
                .eq('is_active', true)
                .gt('stock', 0)
                .lte('stock', lowStockThreshold)
                .order('stock', { ascending: true })
                .limit(10),
        ]);

        const allOrders = ordersRes.data || [];

        // ── Single-pass order aggregation ─────────────────────────
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const validRevenueStatuses = new Set(['delivered', 'shipped', 'confirmed']);
        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        let totalRevenue = 0;
        let completedOrders = 0;
        let ordersThisMonth = 0;
        let ordersLastMonth = 0;
        let revenueThisMonth = 0;
        let revenueLastMonth = 0;
        let ordersLast7Days = 0;
        let ordersLast30Days = 0;

        const statusCounts: Record<string, number> = {};
        const monthlyMap = new Map<string, number>();
        const dailyMap = new Map<string, number>();
        const customerRevenue = new Map<string, { name: string; email: string; total: number; orders: number }>();

        for (const order of allOrders) {
            const orderDate = new Date(order.created_at);

            // Status breakdown
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

            // Date-based filters
            if (orderDate >= sevenDaysAgo) ordersLast7Days++;
            if (orderDate >= thirtyDaysAgo) {
                ordersLast30Days++;
                const dayKey = orderDate.toISOString().slice(0, 10);
                dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
            }

            // Revenue and monthly chart
            if (validRevenueStatuses.has(order.status)) {
                totalRevenue += order.total;
                if (order.status === 'delivered') completedOrders++;

                const monthKey = order.created_at.substring(0, 7); // YYYY-MM
                monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + order.total);

                if (orderDate >= firstOfThisMonth) {
                    ordersThisMonth++;
                    revenueThisMonth += order.total;
                } else if (orderDate >= firstOfLastMonth && orderDate < firstOfThisMonth) {
                    ordersLastMonth++;
                    revenueLastMonth += order.total;
                }

                // ── Customer analytics ───────────────────────────
                const custName = order.customer_name || 'Unknown';
                const custEmail = order.customer_email || '';
                const custKey = custEmail || custName;

                if (customerRevenue.has(custKey)) {
                    const existing = customerRevenue.get(custKey)!;
                    existing.total += order.total;
                    existing.orders += 1;
                } else {
                    customerRevenue.set(custKey, { name: custName, email: custEmail, total: order.total, orders: 1 });
                }
            }
        }

        // ── Format chart data ──────────────────────────────────────
        const revenueChart = Array.from(monthlyMap.entries())
            .map(([key, revenue]) => {
                const [year, month] = key.split('-').map(Number);
                return { year, month, revenue };
            })
            .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
            .map(item => ({
                name: `${MONTH_NAMES[item.month - 1]} ${item.year}`,
                revenue: item.revenue,
            }));

        const dailyChart: { date: string; orders: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            dailyChart.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                orders: dailyMap.get(key) || 0,
            });
        }

        const statusChart = Object.entries(statusCounts).map(([status, count]) => ({
            status: status.charAt(0).toUpperCase() + status.slice(1),
            count,
        }));

        const topCustomers = Array.from(customerRevenue.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const recentOrders = allOrders
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(o => ({
                id: o.order_number,
                customer: o.customer_name || 'Customer',
                email: o.customer_email || '',
                amount: o.total,
                status: o.status,
                date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            }));

        const revenueChange = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100) : (revenueThisMonth > 0 ? 100 : 0);
        const ordersChange = ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100) : (ordersThisMonth > 0 ? 100 : 0);

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue,
                revenueChange: Math.round(revenueChange * 10) / 10,
                totalOrders: allOrders.length,
                ordersChange: Math.round(ordersChange * 10) / 10,
                ordersLast7Days,
                ordersLast30Days,
                completedOrders,
                totalProducts: productsCountRes.count || 0,
                activeProducts: activeProductsRes.count || 0,
                totalCategories: categoriesCountRes.count || 0,
                totalSubscribers: subscribersRes.count || 0,
                activeSubscribers: activeSubsRes.count || 0,
                totalPromos: promosRes.count || 0,
                totalContacts: contactsRes.count || 0,
                totalReturns: returnsCountRes.count || 0,
                revenueChart,
                dailyChart,
                statusChart,
                recentOrders,
                topCustomers,
                recentProducts: (recentProductsRes.data || []).map(p => ({
                    id: p.id,
                    name: p.name || 'Unnamed',
                    price: p.price || 0,
                    featured: p.is_featured || false,
                    date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    image: p.images && (p.images as string[]).length > 0 ? (p.images as string[])[0] : null,
                })),
                lowStockThreshold,
                lowStockProducts: (lowStockRes.data || []).map(p => ({
                    id: p.id,
                    name: p.name || 'Unnamed',
                    stock: p.stock,
                    image: p.images && (p.images as string[]).length > 0 ? (p.images as string[])[0] : null,
                })),
            },
        });
    } catch (error) {
        console.error('❌ Dashboard API error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Dashboard error' }, { status: 500 });
    }
}
