import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

export async function POST(req: NextRequest) {
    try {
        // Authenticate admin securely
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const bucket = (formData.get('bucket') as string) || 'products';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Validate basic file info 
        if (file.size > 50 * 1024 * 1024) { // Increased to 50MB for possible short videos
            return NextResponse.json({ success: false, error: 'File size must be less than 50MB' }, { status: 400 });
        }

        // Make sure it's a media file
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            return NextResponse.json({ success: false, error: 'File must be an image or video' }, { status: 400 });
        }

        // Generate a random stable filename
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure the bucket exists (auto-create if missing)
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === bucket);
        if (!bucketExists) {
            const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 50 * 1024 * 1024, // 50MB
            });
            if (createError) {
                console.error('[Bucket Create Error]', createError);
                return NextResponse.json({ success: false, error: `Failed to create storage bucket: ${createError.message}` }, { status: 500 });
            }
            console.log(`[Upload] Created bucket "${bucket}"`);
        }

        // Upload to supabase
        const { error: uploadError } = await supabaseAdmin.storage
            .from(bucket)
            .upload(filename, buffer, { contentType: file.type, upsert: false });

        if (uploadError) {
            console.error('[Upload Error]', JSON.stringify(uploadError, null, 2));
            console.error('[Upload Error] Bucket:', bucket, 'Filename:', filename, 'ContentType:', file.type, 'Size:', file.size);
            return NextResponse.json({ success: false, error: 'Failed to upload media to storage', details: uploadError.message }, { status: 500 });
        }

        // Obtain public url
        const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);

        return NextResponse.json({ success: true, url: data.publicUrl }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/admin/upload]', error);
        const message = error instanceof Error ? error.message : 'Upload failed';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 },
        );
    }
}
