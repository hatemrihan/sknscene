import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/models/order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Admin manual order validation
        if (!body.customerName || !body.customerPhone || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // We bypass stock deduction for manual items since they might not be linked to actual products
        // (the productId is set to 'manual')

        const newOrder = await createOrder({
            customerName: body.customerName,
            customerEmail: body.customerEmail || undefined,
            customerPhone: body.customerPhone,
            items: body.items,
            subtotal: body.subtotal,
            shippingCost: body.shippingCost,
            codFee: body.codFee,
            totalAmount: body.totalAmount,
            paymentMethod: body.paymentMethod,
            status: body.status || 'confirmed',
            paymentStatus: 'pending',
            shippingAddress: body.shippingAddress,
            governorate: body.governorate || undefined,
            notes: body.notes || undefined,
        });

        if (!newOrder) {
            throw new Error('Failed to create manual order record.');
        }

        return NextResponse.json({
            success: true,
            order: {
                id: newOrder.id,
                orderId: newOrder.order_number,
            },
        });

    } catch (err: unknown) {
        console.error('[POST /api/orders/manual]', err);
        return NextResponse.json(
            { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
