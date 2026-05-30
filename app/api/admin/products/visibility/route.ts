import { NextRequest, NextResponse } from 'next/server';
import { getProductVisibilityStats, toggleAllProductsVisibility } from '@/models/product';

// GET - Get current visibility status of all products
export async function GET() {
    try {
        const stats = await getProductVisibilityStats();

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting products visibility:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get products visibility' },
            { status: 500 }
        );
    }
}

// POST - Toggle visibility of all products
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { visible } = body;

        if (typeof visible !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Invalid visibility value' },
                { status: 400 }
            );
        }

        const updatedCount = await toggleAllProductsVisibility(visible);

        return NextResponse.json({
            success: true,
            message: `All products are now ${visible ? 'visible' : 'hidden'}`,
            data: {
                updatedCount,
                visible
            }
        });

    } catch (error) {
        console.error('Error toggling products visibility:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to toggle products visibility' },
            { status: 500 }
        );
    }
}
