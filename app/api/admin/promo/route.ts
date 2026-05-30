import { NextRequest, NextResponse } from 'next/server';
import { createPromo, getAllPromos } from '@/models/promo';

// POST - Create new promo code (admin)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, discount, type, minAmount, maxUses, isActive, validUntil, description } = body;

        if (!code || !discount) {
            return NextResponse.json({ success: false, error: 'Code and discount are required' }, { status: 400 });
        }

        const promo = await createPromo({
            code,
            discountType: type,
            discountValue: discount,
            minimumOrder: minAmount || undefined,
            usageLimit: maxUses || undefined,
            isActive: isActive !== false,
            expiresAt: validUntil ? new Date(validUntil) : undefined,
            description: description || undefined
        });

        return NextResponse.json({
            success: true,
            message: 'Promo code created successfully',
            promoCode: promo
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to process promo code request';
        const status = msg.includes('already exists') ? 409 : 500;
        return NextResponse.json({ success: false, error: msg }, { status });
    }
}

// GET - Fetch all promo codes (for admin)
export async function GET() {
    try {
        const promos = await getAllPromos();

        return NextResponse.json({
            success: true,
            promoCodes: promos
        });
    } catch (error: unknown) {
        console.error('Failed to fetch promo code ya hatem, review the route again', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch promo codes' }, { status: 500 });
    }
}
