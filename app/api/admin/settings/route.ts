import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

// GET — fetch store settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('store_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, settings: data });
    } catch (error) {
        console.error('❌ Settings GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT — update store settings
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Whitelist allowed fields
        const allowed = [
            'store_name', 'store_email', 'store_phone',
            'social_instagram', 'social_tiktok', 'social_facebook',
            'meta_title', 'meta_description',
            'announcement_bar', 'announcement_active',
            'maintenance_mode', 'order_prefix',
            'low_stock_threshold', 'auto_confirm_orders',
        ];

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        for (const key of allowed) {
            if (key in body) updates[key] = body[key];
        }

        // Get current settings ID
        const { data: current } = await supabaseAdmin
            .from('store_settings')
            .select('id')
            .limit(1)
            .single();

        if (!current) {
            return NextResponse.json({ success: false, error: 'No settings row found' }, { status: 404 });
        }

        const { data, error } = await supabaseAdmin
            .from('store_settings')
            // @ts-expect-error: Supabase RejectExcessProperties is overly strict for dynamic objects
            .update(updates)
            .eq('id', current.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, settings: data });
    } catch (error) {
        console.error('❌ Settings PUT error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
}
