import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getProductBySlug, updateProduct, deleteProduct } from '@/models/product';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/route';

// Helper to determine if the string is a valid UUID
function isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Helper to fetch product by either ID or Slug
async function findProduct(identifier: string) {
    if (isValidUUID(identifier)) {
        return await getProductById(identifier);
    }
    return await getProductBySlug(identifier);
}

// GET - Fetch a single product by ID or Slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: identifier } = await params;

        if (!identifier) {
            return NextResponse.json({ success: false, error: 'Product ID or Slug is required' }, { status: 400 });
        }

        const product = await findProduct(identifier);

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('❌ Error fetching product:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 });
    }
}

// PUT - Update an existing product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: identifier } = await params;

        if (!identifier) {
            return NextResponse.json({ success: false, error: 'Product ID or Slug is required' }, { status: 400 });
        }

        const body = await request.json();
        const {
            name, price, originalPrice, discount, mainImage, images, videos, description, promoCode,
            variants, optionGroups, stock, isActive, isFeatured, order, detailedDescription, shippingInfo, faqs, categories,
            showOutOfStockBadge, showPreorderBadge, slug
        } = body;

        // Validate required fields
        if (!name || !mainImage || !description) {
            return NextResponse.json({ success: false, error: 'Name, Main Image, and Description are required' }, { status: 400 });
        }

        const product = await findProduct(identifier);

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Find and update the product using its UUID
        const updatedProduct = await updateProduct(product.id, {
            name: name.trim(),
            slug: slug ? slug.trim() : product.slug, // Keep old slug if not provided
            price: price || 0,
            original_price: originalPrice || null,
            discount: discount || null,
            main_image: mainImage.trim(),
            images: images || [],
            videos: videos || [],
            description: description.trim(),
            promo_code: promoCode ? promoCode.trim() : '',
            variants: variants || [],
            option_groups: Array.isArray(optionGroups) ? optionGroups : [],
            stock: Math.max(0, stock || 0),
            is_active: isActive !== false,
            is_featured: isFeatured || false,
            order: order || 0,
            detailed_description: detailedDescription || '',
            shipping_info: shippingInfo || '',
            sizes: '',
            size_guide: '',
            faqs: Array.isArray(faqs) ? faqs.filter((faq: { question?: string; answer?: string }) => faq.question?.trim() && faq.answer?.trim()) : [],
            categories: Array.isArray(categories) ? categories : [],
            show_out_of_stock_badge: !!showOutOfStockBadge,
            show_preorder_badge: !!showPreorderBadge
        });

        if (!updatedProduct) {
            return NextResponse.json({ success: false, error: 'Failed to apply product updates' }, { status: 500 });
        }

        // Revalidate affected pages
        revalidatePath('/shop');
        revalidatePath('/');
        revalidatePath(`/product/${updatedProduct.slug}`);
        if (identifier !== updatedProduct.slug) {
            revalidatePath(`/product/${identifier}`);
        }
        revalidatePath('/api/products');
        revalidatePath('/admin/products');

        return NextResponse.json({
            success: true,
            product: updatedProduct,
            message: 'Product updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating product:', error);
        return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
    }
}

// PATCH - Toggle featured status of a product
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: identifier } = await params;

        if (!identifier) {
            return NextResponse.json({ success: false, error: 'Product ID or Slug is required' }, { status: 400 });
        }

        const body = await request.json();
        const { isFeatured } = body;

        const product = await findProduct(identifier);

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const updatedProduct = await updateProduct(product.id, { is_featured: isFeatured });

        // Revalidate affected pages
        revalidatePath('/shop');
        revalidatePath('/');
        revalidatePath(`/product/${product.slug}`);

        return NextResponse.json({
            success: true,
            product: updatedProduct,
            message: `Product ${isFeatured ? 'featured' : 'unfeatured'} successfully`
        });

    } catch (error) {
        console.error('❌ Error toggling featured status:', error);
        return NextResponse.json({ success: false, error: 'Failed to update featured status' }, { status: 500 });
    }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: identifier } = await params;

        if (!identifier) {
            return NextResponse.json({ success: false, error: 'Product ID or Slug is required' }, { status: 400 });
        }

        const product = await findProduct(identifier);

        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        await deleteProduct(product.id);

        // Revalidate affected pages
        revalidatePath('/shop');
        revalidatePath('/');
        revalidatePath(`/product/${product.slug}`);
        revalidatePath('/api/products');
        revalidatePath('/api/categories');
        revalidatePath('/admin/products');

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting product:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
    }
}
