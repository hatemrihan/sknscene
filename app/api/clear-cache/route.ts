import { NextResponse } from 'next/server';
import { apiCache } from '@/lib/auth/cache/route';
import { revalidatePath } from 'next/cache';

// Admin endpoint to clear all caches and see fresh data from MongoDB
export async function POST() {
    try {
        // Clear all product caches
        apiCache.clear();

        // Revalidate all product-related pages
        revalidatePath('/shop');
        revalidatePath('/');
        revalidatePath('/api/products');

        console.log('🗑️ ALL CACHES CLEARED - Fresh data will be fetched from MongoDB');

        return NextResponse.json({
            success: true,
            message: 'All caches cleared successfully! Your next request will fetch fresh data from MongoDB.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to clear cache',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

// GET method for easy browser testing
export async function GET() {
    return POST();
}




