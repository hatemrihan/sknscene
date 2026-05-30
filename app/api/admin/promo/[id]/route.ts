import { NextRequest, NextResponse } from 'next/server';
import { getPromoById, updatePromo, deletePromo, togglePromo } from '@/models/promo';

function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// GET - Fetch single promo code by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || !isValidUUID(id)) {
            return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
        }

        const promoCode = await getPromoById(id);

        if (!promoCode) {
            return NextResponse.json(
                { success: false, error: 'Promo code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            promo: promoCode
        });

    } catch (error: unknown) {
        console.error('❌ Error fetching promo code:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch promo code' },
            { status: 500 }
        );
    }
}

// PUT - Update promo code
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || !isValidUUID(id)) {
            return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
        }

        const body = await request.json();

        const promoCode = await updatePromo(id, {
            code: body.code,
            discount_type: body.discountType ?? body.type,
            discount_value: body.discountValue ?? body.discount,
            minimum_order: body.minimumOrder ?? body.minAmount ?? null,
            usage_limit: body.usageLimit ?? body.maxUses ?? null,
            is_active: body.isActive,
            expires_at: body.expiresAt ?? (body.validUntil ? new Date(body.validUntil).toISOString() : null),
            description: body.description ?? null
        });

        if (!promoCode) {
            return NextResponse.json(
                { success: false, error: 'Promo code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Promo code updated successfully',
            promoCode
        });

    } catch (error: unknown) {
        console.error('❌ Error updating promo code:', error);
        const msg = error instanceof Error ? error.message : 'Failed to update promo code';
        const isConflict = msg.includes('already exists');
        return NextResponse.json(
            { success: false, error: isConflict ? msg : 'Failed to update promo code' },
            { status: isConflict ? 409 : 500 }
        );
    }
}

// DELETE - Delete promo code
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || !isValidUUID(id)) {
            return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
        }

        const deleted = await deletePromo(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Promo code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Promo code deleted successfully'
        });

    } catch (error: unknown) {
        console.error('❌ Error deleting promo code:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete promo code' },
            { status: 500 }
        );
    }
}

// PATCH - Toggle promo code status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || !isValidUUID(id)) {
            return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
        }

        const body = await request.json();

        if (typeof body.isActive !== 'boolean') {
            return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
        }

        const promoCode = await togglePromo(id, body.isActive);

        if (!promoCode) {
            return NextResponse.json(
                { success: false, error: 'Promo code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Promo code status updated successfully',
            promoCode
        });

    } catch (error: unknown) {
        console.error('❌ Error updating promo code status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update promo code status' },
            { status: 500 }
        );
    }
}
