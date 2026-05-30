import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/models/product';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    // ✅ Validate UUID format before hitting the DB
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !UUID_REGEX.test(id)) {
        return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    try {
        const product = await getProductById(id);

        if (!product) return NextResponse.json({ success: false, error: 'Product not found..' }, { status: 404 });

        // ✅ Trim the response to only what the poller actually uses
        return NextResponse.json({
            success: true,
            stock: product.stock,
            variants: product.variants.map(v => ({
                attributes: v.attributes,
                stock: v.stock,
                price: v.price ?? null,
            })),
        });
    } catch (error) {
        console.error('[GET /api/products/stock]', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }

}
