import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { PromoRow } from '@/lib/database.types';

/**
 * POST /api/promo/validate
 * Validates a promo code WITHOUT claiming it.
 * Returns discount preview for checkout UI.
 */
export async function POST(req: NextRequest) {
    try {
        const { code, subtotal } = await req.json();

        if (!code || !subtotal) {
            return NextResponse.json(
                { success: false, error: 'كود الخصم والمجموع مطلوبان' },
                { status: 400 },
            );
        }

        const normalizedCode = code.toUpperCase().trim();

        // Fetch promo
        const { data: promo, error } = await supabaseAdmin
            .from('promos')
            .select('*')
            .eq('code', normalizedCode)
            .eq('is_active', true)
            .maybeSingle();

        if (error || !promo) {
            return NextResponse.json(
                { success: false, error: 'كود الخصم غير صالح' },
                { status: 400 },
            );
        }

        const p = promo as PromoRow;

        // Check expiry
        if (p.expires_at && new Date(p.expires_at) < new Date()) {
            return NextResponse.json(
                { success: false, error: 'كود الخصم منتهي الصلاحية' },
                { status: 400 },
            );
        }

        // Check usage limit
        if (p.usage_limit && p.used_count >= p.usage_limit) {
            return NextResponse.json(
                { success: false, error: 'تم استهلاك كود الخصم بالكامل' },
                { status: 400 },
            );
        }

        // Check minimum order
        if (p.minimum_order && subtotal < p.minimum_order) {
            return NextResponse.json(
                { success: false, error: `الحد الأدنى للطلب ${p.minimum_order} ج.م` },
                { status: 400 },
            );
        }

        // Calculate discount preview
        let discountAmount = 0;
        if (p.discount_type === 'percentage') {
            discountAmount = (subtotal * p.discount_value) / 100;
            if (p.maximum_discount) {
                discountAmount = Math.min(discountAmount, p.maximum_discount);
            }
        } else {
            discountAmount = p.discount_value;
        }

        discountAmount = Math.min(discountAmount, subtotal); // Never exceed subtotal

        return NextResponse.json({
            success: true,
            discount: {
                code: p.code,
                type: p.discount_type,
                value: p.discount_value,
                discountAmount: Math.round(discountAmount * 100) / 100,
                description: p.description,
            },
        });
    } catch (error) {
        console.error('[POST /api/promo/validate]', error);
        return NextResponse.json(
            { success: false, error: 'فشل في التحقق من كود الخصم' },
            { status: 500 },
        );
    }
}
