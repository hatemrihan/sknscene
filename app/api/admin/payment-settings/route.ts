import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSettings, updatePaymentSettings } from '@/models/paymentSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

// GET - Fetch payment settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getPaymentSettings();

        return NextResponse.json({
            success: true,
            settings: {
                codEnabled: settings.cod_enabled,
                instaPayEnabled: settings.insta_pay_enabled,
            }
        });

    } catch (error) {
        console.error('❌ Error fetching payment settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch payment settings'
        }, { status: 500 });
    }
}

// PUT - Update payment settings
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { codEnabled, instaPayEnabled } = await request.json();

        // Validate input — at least one must be provided
        if (typeof codEnabled !== 'boolean' && typeof instaPayEnabled !== 'boolean') {
            return NextResponse.json({
                success: false,
                error: 'At least one of codEnabled or instaPayEnabled must be a boolean'
            }, { status: 400 });
        }

        // Update settings
        const settings = await updatePaymentSettings({
            ...(typeof codEnabled === 'boolean' && { codEnabled }),
            ...(typeof instaPayEnabled === 'boolean' && { instaPayEnabled }),
        });

        return NextResponse.json({
            success: true,
            settings: {
                codEnabled: settings.cod_enabled,
                instaPayEnabled: settings.insta_pay_enabled,
            }
        });

    } catch (error) {
        console.error('❌ Error updating payment settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update payment settings'
        }, { status: 500 });
    }
}
