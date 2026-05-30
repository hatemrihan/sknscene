import { NextRequest, NextResponse } from 'next/server';
import { getAllProductsAdmin, createProduct } from '@/models/product';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';
import crypto from 'crypto';

function generateSlug(name: string): string {
    const hasLatin = /[a-zA-Z0-9]/.test(name);
    if (hasLatin) {
        const base = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        return `${base}-${crypto.randomUUID().slice(0, 8)}`;
    }
    // Arabic or non-latin name — use UUID only for clean URL
    return crypto.randomUUID().slice(0, 8);
}

// GET - Fetch products for admin dashboard
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const sort = searchParams.get('sort') === 'custom' ? 'custom' : 'newest';

        const { products, total } = await getAllProductsAdmin({ page, limit, sort });

        const result = {
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('[GET /api/admin/products]', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products for admin' },
            { status: 500 }
        );
    }
}

// POST - Create new product (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const {
            name, price, original_price, discount, main_image, images, videos, description, promo_code,
            variants, option_groups, stock, is_active, is_featured, order,
            detailed_description, shipping_info, faqs, categories,
            show_out_of_stock_badge, show_preorder_badge
        } = body;

        // Validate required fields
        if (!name || !main_image || !description) {
            return NextResponse.json(
                { success: false, error: 'Name, Main Image, and Description are required' },
                { status: 400 }
            );
        }

        // IMPORTANT Data Integrity Fix: Prevent saving temporary browser blob URLs
        if (main_image.startsWith('blob:')) {
            return NextResponse.json(
                { success: false, error: 'Main Image cannot be a temporary blob URL. Please wait for the upload to complete.' },
                { status: 400 }
            );
        }
        if (images?.some((img: string) => img.startsWith('blob:'))) {
            return NextResponse.json(
                { success: false, error: 'One or more images are temporary blob URLs. Please wait for the upload to complete.' },
                { status: 400 }
            );
        }

        // Generate a unique slug based on product name and unique UUID suffix
        const slug = `${generateSlug(name)}-${crypto.randomUUID().slice(0, 8)}`;

        // Create new product
        const savedProduct = await createProduct({
            name: name.trim().replace(/[<>]/g, ''),
            slug,
            price: price || 0,
            original_price: original_price || null,
            discount: discount && discount > 0 ? discount : null,
            main_image: main_image.trim(),
            images: images || [],
            videos: videos || [],
            description: description.trim(),
            promo_code: promo_code?.trim() || '',
            variants: variants || [],
            option_groups: Array.isArray(option_groups) ? option_groups : [],
            stock: Math.max(0, stock || 0),
            is_active: is_active !== false,
            is_featured: is_featured || false,
            order: order || 0,
            detailed_description: detailed_description?.trim() || '',
            shipping_info: shipping_info?.trim() || '',
            sizes: typeof body.sizes === 'string' ? body.sizes : '',
            size_guide: typeof body.size_guide === 'string' ? body.size_guide : '',
            faqs: Array.isArray(faqs) ? faqs.filter((faq: { question?: string; answer?: string }) => faq.question?.trim() && faq.answer?.trim()) : [],
            categories: Array.isArray(categories) ? categories : [],
            show_out_of_stock_badge: !!show_out_of_stock_badge,
            show_preorder_badge: !!show_preorder_badge,
            city_pricing: []
        });

        // Revalidate all pages to show fresh data
        revalidatePath('/shop');
        revalidatePath('/');
        revalidatePath('/admin/products');

        return NextResponse.json({
            success: true,
            product: savedProduct,
            message: 'Product created successfully'
        });

    } catch (error) {
        console.error('[POST /api/admin/products]', error);

        const message = error instanceof Error ? error.message : 'Failed to create product';
        const isDev = process.env.NODE_ENV === 'development';

        return NextResponse.json(
            { success: false, error: isDev ? message : 'Failed to create product' },
            { status: 500 }
        );
    }
}
