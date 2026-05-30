import { getProductBySlug, getRelatedProducts } from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings';

/**
 * GET /api/products/[id]
 *
 * Public endpoint — fetch a single product by its slug (the [id] param).
 * Also returns up to 4 related products for "more from collection".
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id: slug } = await params;

        const product = await getProductBySlug(slug);

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 },
            );
        }

        // Fetch related products (latest 4, excluding current)
        const related = await getRelatedProducts(product.id, product.categories || [], 4);

        const settings = await getStoreSettings();

        return NextResponse.json({
            success: true,
            product,
            relatedProducts: related,
            lowStockThreshold: settings.low_stock_threshold,
        }, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
    } catch (error) {
        console.error('[GET /api/products/[id]]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load product' },
            { status: 500 },
        );
    }
}
