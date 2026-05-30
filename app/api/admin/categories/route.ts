import { getAllCategories, createCategory, deleteCategory, updateCategory, toggleCategoryVisibility } from '@/models/category';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';
// ─── Helpers ──────────────────────────────────────────────────

/** Strip HTML tags to prevent XSS in category names. */
function sanitize(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim();
}

/** Validate UUID v4 format. */
function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Ensure a storage bucket exists, create if missing. */
async function ensureBucketExists(bucketName: string) {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some(b => b.name === bucketName);
    if (!exists) {
        const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10 * 1024 * 1024, // 10MB
        });
        if (error) {
            console.error(`[Bucket Create Error] ${bucketName}:`, error);
            throw new Error(`Failed to create storage bucket: ${error.message}`);
        }
        console.log(`[Storage] Created bucket "${bucketName}"`);
    }
}

// ─── GET ──────────────────────────────────────────────────────

export async function GET() {
    try {
        const categories = await getAllCategories();

        return NextResponse.json(
            { success: true, categories },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
        );
    } catch (error) {
        console.error('[GET /api/admin/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Unable to load categories. Please try again later.' },
            { status: 500 },
        );
    }
}

// ─── POST ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const rawName = formData.get('name') as string | null;
        let imageUrl = null;

        const file = formData.get('image') as File | null;
        if (file) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ success: false, error: 'Please upload a valid image' }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ success: false, error: 'Image size must be less than 5MB' }, { status: 400 });
            }

            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            await ensureBucketExists('categories');

            const { error: uploadError } = await supabaseAdmin.storage
                .from('categories')
                .upload(filename, buffer, { contentType: file.type, upsert: false });

            if (uploadError) {
                console.error('[Upload Error]', uploadError);
                return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
            }

            const { data } = supabaseAdmin.storage.from('categories').getPublicUrl(filename);
            imageUrl = data.publicUrl;
        }

        if (!rawName || typeof rawName !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Category name is required.' },
                { status: 400 },
            );
        }

        const name = sanitize(rawName);

        if (name.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Category name cannot be empty after sanitization.' },
                { status: 400 },
            );
        }

        if (name.length > 60) {
            return NextResponse.json(
                { success: false, error: 'Category name must be under 60 characters.' },
                { status: 400 },
            );
        }

        const category = await createCategory({ name, image_url: imageUrl });

        revalidatePath('/admin/categories');
        revalidatePath('/admin/product/add-product');
        revalidatePath('/admin/product/edit-product');

        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to create category.';

        // Surface duplicate-name errors clearly
        const isDuplicate = message.includes('already exists');
        console.error('[POST /api/admin/categories]', error);

        return NextResponse.json(
            { success: false, error: isDuplicate ? message : 'Failed to create category. Please try again.' },
            { status: isDuplicate ? 409 : 500 },
        );
    }
}

// ─── PATCH ────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const id = formData.get('id') as string | null;
        const rawName = formData.get('name') as string | null;
        const file = formData.get('image') as File | null;

        if (!id || typeof id !== 'string' || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, error: 'A valid category ID is required.' },
                { status: 400 },
            );
        }

        const updates: Record<string, unknown> = {};

        if (rawName !== null) {
            const name = sanitize(rawName);
            if (name.length === 0 || name.length > 60) {
                return NextResponse.json(
                    { success: false, error: 'Category name must be 1–60 characters.' },
                    { status: 400 },
                );
            }
            updates.name = name;
        }

        if (file) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ success: false, error: 'Please upload a valid image' }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ success: false, error: 'Image size must be less than 5MB' }, { status: 400 });
            }

            const ext = file.name.split('.').pop() || 'jpg';
            const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            await ensureBucketExists('categories');

            const { error: uploadError } = await supabaseAdmin.storage
                .from('categories')
                .upload(filename, buffer, { contentType: file.type, upsert: false });

            if (uploadError) {
                console.error('[Upload Error]', uploadError);
                return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
            }

            const { data } = supabaseAdmin.storage.from('categories').getPublicUrl(filename);
            updates.image_url = data.publicUrl;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, error: 'No fields to update.' },
                { status: 400 },
            );
        }

        const category = await updateCategory(id, updates);

        revalidatePath('/admin/categories');
        revalidatePath('/admin/product/add-product');
        revalidatePath('/admin/product/edit-product');

        return NextResponse.json({ success: true, category });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to update category.';
        console.error('[PATCH /api/admin/categories]', error);

        return NextResponse.json(
            { success: false, error: message },
            { status: 500 },
        );
    }
}

// ─── DELETE ───────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get('id');

        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, error: 'A valid category ID is required.' },
                { status: 400 },
            );
        }

        const deleted = await deleteCategory(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Category not found. It may have already been deleted.' },
                { status: 404 },
            );
        }

        revalidatePath('/admin/categories');
        revalidatePath('/');
        revalidatePath('/shop');
        revalidatePath('/api/categories');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/admin/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete category. Please try again.' },
            { status: 500 },
        );
    }
}

// ─── PUT (Toggle Visibility) ─────────────────────────────────

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, visible } = body;

        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, error: 'A valid category ID is required.' },
                { status: 400 },
            );
        }

        if (typeof visible !== 'boolean') {
            return NextResponse.json(
                { success: false, error: '"visible" must be a boolean.' },
                { status: 400 },
            );
        }

        const category = await toggleCategoryVisibility(id, visible);

        revalidatePath('/admin/categories');
        revalidatePath('/');
        revalidatePath('/api/categories');

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('[PUT /api/admin/categories]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update visibility.' },
            { status: 500 },
        );
    }
}

