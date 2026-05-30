import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { restoreStock } from '@/models/product';
import { createOrder, getOrders, updateOrderStatus } from '@/models/order';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

// ─── Types ────────────────────────────────────────────────────

type CheckoutPayload = {
    customer: {
        firstName: string;
        lastName: string;
        address: string;
        moreInfo?: string;
        governorate: string;
        city: string;
        phone: string;
        email: string;
    };
    deliveryMethod: string;
    paymentMethod: 'instaPay' | 'cashOnDelivery';
    transactionScreenshot?: string;
    promoCode?: string;
    discountAmount?: number;
    items: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
        size?: string;
        color?: string;
        attributes?: Record<string, string>;
        image: string;
    }[];
    subtotal: number;
    shippingCost: number;
    codFee: number;
    totalAmount: number;
    lat?: number;
    lng?: number;
};

// ─── POST — Create a new order ────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckoutPayload;

        // ── Validate required fields ────────────────────────
        if (!body.customer?.firstName || !body.customer?.phone || !body.customer?.address) {
            return NextResponse.json(
                { success: false, error: 'بيانات العميل غير مكتملة' },
                { status: 400 },
            );
        }

        if (!body.items || body.items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'السلة فارغة' },
                { status: 400 },
            );
        }

        // ── Server-side price verification ───────────────────
        // Fetch real prices from DB in a single batch query
        const itemProductIds = body.items.map(i => i.productId);

        const { data: dbProducts, error: dbError } = await supabaseAdmin
            .from('products')
            .select('id, name, price, variants')
            .in('id', itemProductIds);

        if (dbError) {
            console.error('[POST /api/orders] DB lookup failed:', dbError.message, '| IDs:', itemProductIds);
            return NextResponse.json(
                { success: false, error: 'خطأ في التحقق من المنتجات' },
                { status: 500 },
            );
        }

        // Build a lookup map: productId → DB product
        const productMap = new Map((dbProducts ?? []).map(p => [p.id, p]));

        const verifiedItems = body.items.map(item => {
            const dbProduct = productMap.get(item.productId);

            if (!dbProduct) {
                // Product not found — log for debugging but DON'T block the order.
                // This can happen if the cart has a stale ID. Use the client price as fallback.
                console.warn(`[POST /api/orders] Product not in DB, using client price: "${item.name}" (ID: ${item.productId})`);
                return item;
            }

            // Determine the correct price: variant price or base price
            let verifiedPrice = dbProduct.price;
            const variants = dbProduct.variants as { attributes?: Record<string, string>; price?: number }[] | null;

            if (item.attributes && variants?.length) {
                const attrKeys = Object.keys(item.attributes);
                const matchedVariant = variants.find(v => {
                    const vKeys = Object.keys(v.attributes || {});
                    return attrKeys.length === vKeys.length &&
                        attrKeys.every(k => v.attributes?.[k] === item.attributes![k]);
                });
                if (matchedVariant?.price != null) {
                    verifiedPrice = matchedVariant.price;
                }
            }

            return { ...item, price: verifiedPrice };
        });

        // ── Atomic stock deduction with rollback ────────────
        // Each deduct_stock call uses FOR UPDATE row lock.
        // If ANY item fails, we restore all previously deducted items.
        const deductedItems: { productId: string; quantity: number; variantName?: string; variantAttrs?: Record<string, string> }[] = [];

        // Helper to perform rollback of deducted items using Promise.allSettled
        const performRollback = async () => {
            const results = await Promise.allSettled(
                deductedItems.map(d => restoreStock(d.productId, d.quantity, d.variantName, d.variantAttrs))
            );
            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    console.error(`[POST /api/orders] Stock restore failed for item ${i} (${deductedItems[i].productId}):`, r.reason);
                }
            });
        };

        for (const item of verifiedItems) {
            try {
                const { error } = await supabaseAdmin.rpc('deduct_stock', {
                    p_product_id: item.productId,
                    p_quantity: item.quantity,
                    p_variant_name: item.color ?? null,
                    p_variant_attrs: item.attributes ?? null,
                });

                if (error) {
                    // Stock deduction failed — rollback all previously deducted items
                    await performRollback();

                    // Parse the Postgres error for a user-friendly message
                    const msg = error.message.includes('Insufficient stock')
                        ? `"${item.name}" — الكمية المطلوبة غير متوفرة في المخزون`
                        : error.message.includes('not found')
                            ? `المنتج "${item.name}" غير متوفر`
                            : `خطأ في المخزون: ${error.message}`;

                    return NextResponse.json(
                        { success: false, error: msg },
                        { status: 400 },
                    );
                }

                // Track successful deductions for potential rollback
                deductedItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    variantName: item.color,
                    variantAttrs: item.attributes,
                });
            } catch (rpcError) {
                // Unexpected error — rollback
                await performRollback();
                throw rpcError;
            }
        }

        // ── Handle promo code ───────────────────────────────
        let promoCode: string | undefined;
        let discountAmount = 0;

        // Pre-calculate verified subtotal for promo validation
        const verifiedSubtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        if (body.promoCode) {
            try {
                const { claimPromo } = await import('@/models/promo');
                const result = await claimPromo(body.promoCode, verifiedSubtotal);
                promoCode = body.promoCode;
                discountAmount = result.discountAmount;
            } catch (promoError) {
                // Promo failed — restore all deducted stock
                await performRollback();
                return NextResponse.json(
                    { success: false, error: `كود الخصم غير صالح: ${(promoError as Error).message}` },
                    { status: 400 },
                );
            }
        }

        // ── Recalculate total from verified prices (server-side) ──
        const subtotal = verifiedSubtotal;
        const shippingCost = body.shippingCost || 0;
        const codFee = body.paymentMethod === 'cashOnDelivery' ? (body.codFee || 0) : 0;
        const total = subtotal + shippingCost + codFee - discountAmount;

        // ── Build notes ─────────────────────────────────────
        const notesParts: string[] = [];
        if (body.customer.moreInfo) notesParts.push(body.customer.moreInfo);
        if (promoCode) notesParts.push(`كود خصم: ${promoCode} (-${discountAmount})`);
        if (body.transactionScreenshot) notesParts.push(`إيصال: ${body.transactionScreenshot}`);

        // ── Build customer address string ────────────────────
        const addressParts = [body.customer.address, body.customer.city, body.customer.governorate].filter(Boolean);
        const addressStr = addressParts.join(', ') + (body.lat && body.lng ? ` [${body.lat},${body.lng}]` : '');
        if (addressStr) notesParts.push(`العنوان: ${addressStr}`);

        // ── Create order ────────────────────────────────────
        let order;
        try {
            order = await createOrder({
                customerName: `${body.customer.firstName} ${body.customer.lastName}`.trim(),
                customerEmail: body.customer.email || undefined,
                customerPhone: body.customer.phone,
                shippingAddress: {
                    address: body.customer.address,
                    city: body.customer.city,
                    lat: body.lat,
                    lng: body.lng,
                },
                governorate: body.customer.governorate,
                items: verifiedItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    attributes: item.attributes,
                    image: item.image,
                })),
                subtotal,
                shippingCost,
                codFee,
                totalAmount: total,
                paymentMethod: body.paymentMethod,
                status: body.paymentMethod === 'instaPay' ? 'pending_payment' : 'pending',
                paymentStatus: 'pending',
                promoCode: promoCode,
                discountAmount,
                notes: notesParts.join(' | ') || undefined,
                transactionScreenshot: body.transactionScreenshot,
            });
        } catch (orderError) {
            // Order creation failed — restore all stock
            await performRollback();
            throw orderError;
        }

        // ── Send emails (fire-and-forget — never blocks the order response) ──
        const emailPayload = {
            customerEmail: body.customer.email || undefined,
            customerName: `${body.customer.firstName} ${body.customer.lastName}`.trim(),
            orderId: order.order_number,
            orderItems: verifiedItems.map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                size: i.size,
                color: i.color,
                attributes: i.attributes,
            })),
            subtotal,
            shippingCost,
            codFee,
            discountAmount,
            promoCode,
            totalAmount: total,
            paymentMethod: body.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : 'InstaPay',
            shippingAddress: {
                governorate: body.customer.governorate || '',
                city: body.customer.city || '',
                address: body.customer.address || '',
                apartment: body.customer.moreInfo || undefined,
            },
            customerPhone: body.customer.phone,
        };

        // 1) ALWAYS notify admins — even if customer has no email
        sendAdminOrderNotification(emailPayload)
            .catch(err => console.error('[Admin Email]', err));

        // 2) Send customer confirmation only if they provided an email
        sendOrderConfirmationEmail(emailPayload)
            .catch(err => console.error('[Customer Email]', err));

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderId: order.order_number,
                totalAmount: order.total,
            },
        });
    } catch (error) {
        console.error('[POST /api/orders]', error);
        return NextResponse.json(
            { success: false, error: 'فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.' },
            { status: 500 },
        );
    }
}

// ─── GET — Fetch orders (Admin) ────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        // ── Auth Check ──────────────────────────────────────
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const status = searchParams.get('status') || undefined;

        const result = await getOrders({ page, limit, status });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[GET /api/orders]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 },
        );
    }
}

// ─── PATCH — Update order status (Admin) ───────────────────────

export async function PATCH(req: NextRequest) {
    try {
        // ── Auth Check ──────────────────────────────────────
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        if (!body.id || !body.status) {
            return NextResponse.json(
                { success: false, error: 'Missing id or status' },
                { status: 400 },
            );
        }

        // ── Restore stock on cancellation ───────────────────
        if (body.status === 'cancelled') {
            // Fetch the order to get items
            const { data: order } = await supabaseAdmin
                .from('orders')
                .select('items, status')
                .eq('id', body.id)
                .single();

            // Only restore if the order wasn't already cancelled
            if (order && order.status !== 'cancelled') {
                const items = (order.items as {
                    productId: string;
                    quantity: number;
                    color?: string;
                    attributes?: Record<string, string>;
                }[]).filter(item => item.productId !== 'manual');

                if (items.length > 0) {
                    const results = await Promise.allSettled(
                        items.map(item => restoreStock(
                            item.productId,
                            item.quantity,
                            item.color,
                            item.attributes,
                        ))
                    );

                    results.forEach((r, i) => {
                        if (r.status === 'rejected') {
                            console.error(`[PATCH /api/orders] Stock restore failed for item ${i} (${items[i].productId}):`, r.reason);
                        }
                    });
                }
            }
        }

        const updatedOrder = await updateOrderStatus(body.id, body.status);

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('[PATCH /api/orders]', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 },
        );
    }
}

// ─── DELETE — Delete an order (Admin) ──────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing order id' }, { status: 400 });
        }

        // Fetch order to check status and restore stock if needed
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('items, status')
            .eq('id', id)
            .single();

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Restore stock if order wasn't already cancelled (skip manual items)
        if (order.status !== 'cancelled') {
            const items = (order.items as {
                productId: string;
                quantity: number;
                color?: string;
                attributes?: Record<string, string>;
            }[]).filter(item => item.productId !== 'manual');

            if (items.length > 0) {
                const results = await Promise.allSettled(
                    items.map(item => restoreStock(item.productId, item.quantity, item.color, item.attributes))
                );
                results.forEach((r, i) => {
                    if (r.status === 'rejected') {
                        console.error(`[DELETE /api/orders] Stock restore failed for item ${i}:`, r.reason);
                    }
                });
            }
        }

        // Use model function to delete
        const { deleteOrder } = await import('@/models/order');
        await deleteOrder(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/orders]', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 },
        );
    }
}
