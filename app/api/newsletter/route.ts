import { NextRequest, NextResponse } from 'next/server';
import { subscribe, getAllSubscribers } from '@/models/newsletter';
// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const newSubscriber = await subscribe(email);

        console.log('✅ New newsletter subscriber:', email);

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            subscriber: {
                email: newSubscriber.email,
                subscribedAt: newSubscriber.subscribed_at
            }
        });

    } catch (error: unknown) {
        console.error('❌ Newsletter subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to subscribe to newsletter' },
            { status: 500 }
        );
    }
}

// GET - Fetch all newsletter subscribers (for admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const allSubscribers = await getAllSubscribers();

        // Manual pagination (since we're fetching all for now, to keep it simple and match expected signature)
        // In the future we can pass limit/offset to getAllSubscribers.
        const totalCount = allSubscribers.length;
        const pagedSubscribers = allSubscribers.slice(skip, skip + limit);

        console.log(`✅ Fetched ${pagedSubscribers.length} newsletter subscribers`);

        return NextResponse.json({
            success: true,
            subscribers: pagedSubscribers.map(subscriber => ({
                id: subscriber.id,
                email: subscriber.email,
                subscribedAt: subscriber.subscribed_at,
                isActive: subscriber.is_active,
                createdAt: subscriber.created_at,
                updatedAt: subscriber.updated_at
            })),
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error: unknown) {
        console.error('❌ Newsletter fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch newsletter subscribers' },
            { status: 500 }
        );
    }
}
