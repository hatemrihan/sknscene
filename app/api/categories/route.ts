import { getVisibleCategories, getAllCategories } from '@/models/category';
import { NextResponse } from 'next/server';

/**
 * GET /api/categories
 *
 * Public endpoint — returns visible categories for the storefront.
 * Falls back to all categories if the `visible` column doesn't exist yet.
 */
export async function GET() {
    try {
        let categories;
        try {
            categories = await getVisibleCategories();
        } catch {
            // Fallback if `visible` column doesn't exist yet
            categories = await getAllCategories();
        }

        return NextResponse.json(
            { success: true, categories },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
        );
    } catch (error) {
        console.error('[GET /api/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load categories' },
            { status: 500 },
        );
    }
}
