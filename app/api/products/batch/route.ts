import { NextRequest, NextResponse } from 'next/server';
import { getProductsByIds } from '@/models/product';

/**
 * POST /api/products/batch
 * Fetch multiple products by IDs.
 * Body: { ids: string[] }
 */
export async function POST(req: NextRequest) {
    try {
        const { ids } = await req.json();
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json([]);
        }
        const products = await getProductsByIds(ids.slice(0, 50));
        return NextResponse.json(products.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            main_image: p.main_image,
            price: p.price,
            original_price: p.original_price,
        })));
    } catch (error) {
        console.error('[POST /api/products/batch]', error);
        return NextResponse.json([], { status: 500 });
    }
}
