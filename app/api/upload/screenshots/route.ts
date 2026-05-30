import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET = 'instapay-screenshots';

/**
 * POST /api/upload/screenshot
 * Upload an InstaPay transfer screenshot to Supabase Storage.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'لم يتم إرفاق ملف' },
                { status: 400 },
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'يرجى رفع صورة فقط' },
                { status: 400 },
            );
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' },
                { status: 400 },
            );
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Convert to buffer
        const buffer = await file.arrayBuffer();

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('[Upload Error]', uploadError);
            return NextResponse.json(
                { success: false, error: 'فشل في رفع الصورة' },
                { status: 500 },
            );
        }

        // Get public URL
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(BUCKET)
            .getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            filename,
        });
    } catch (error) {
        console.error('[POST /api/upload/screenshot]', error);
        return NextResponse.json(
            { success: false, error: 'حدث خطأ أثناء رفع الصورة' },
            { status: 500 },
        );
    }
}
