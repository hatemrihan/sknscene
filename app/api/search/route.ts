import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/models/product';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ success: true, products: [] });
        }

        const products = await searchProducts(query, 10);

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('[Search API Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
