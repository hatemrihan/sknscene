import { NextRequest, NextResponse } from 'next/server';
import {
    getAllGovernoratePricing,
    upsertGovernoratePricing,
    bulkUpsertGovernoratePricing,
} from '@/models/governate-pricing';

/**
 * GET /api/admin/governorate-pricing
 * Fetch all governorate pricing for admin management.
 */
export async function GET() {
    try {
        const pricing = await getAllGovernoratePricing();
        return NextResponse.json({ success: true, pricing });
    } catch (error) {
        console.error('[GET /api/admin/governorate-pricing]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch pricing' },
            { status: 500 },
        );
    }
}

/**
 * POST /api/admin/governorate-pricing
 * Upsert a single governorate pricing entry.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.bulk && Array.isArray(body.entries)) {
            // Bulk upsert all governorates
            const result = await bulkUpsertGovernoratePricing(body.entries);
            return NextResponse.json({ success: true, pricing: result });
        }

        // Single upsert
        const { governorate, shippingCost, codFee, isActive } = body;

        if (!governorate) {
            return NextResponse.json(
                { success: false, error: 'Governorate is required' },
                { status: 400 },
            );
        }

        const result = await upsertGovernoratePricing({
            governorate,
            shippingCost: shippingCost ?? 0,
            codFee: codFee ?? 0,
            isActive: isActive ?? true,
        });

        return NextResponse.json({ success: true, pricing: result });
    } catch (error) {
        console.error('[POST /api/admin/governorate-pricing]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update pricing' },
            { status: 500 },
        );
    }
}
