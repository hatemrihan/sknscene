import { NextResponse } from 'next/server';
import { getAllGovernoratePricing } from '@/models/governate-pricing';

/**
 * GET /api/governorate-pricing
 * Public endpoint — returns all active governorate pricing for checkout.
 */
export async function GET() {
    try {
        const pricing = await getAllGovernoratePricing();

        return NextResponse.json(
            { success: true, pricing },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
        );
    } catch (error) {
        console.error('[GET /api/governorate-pricing]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch pricing' },
            { status: 500 },
        );
    }
}
