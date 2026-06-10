import { supabaseAdmin } from '../lib/supabase';
import type {
    ProductRow,
    Database
} from '../lib/database.types';
import { cache } from 'react';

// ─── Types ────────────────────────────────────────────────────

export type Product = ProductRow;

export type CreateProductInput = Omit<
    ProductRow,
    'id' | 'created_at' | 'updated_at'
>;

export type UpdateProductInput = Partial<
    Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>
>;

export type ProductListItem = Pick<
    ProductRow,
    | 'id'
    | 'slug'
    | 'name'
    | 'price'
    | 'original_price'
    | 'discount'
    | 'main_image'
    | 'images'
    | 'videos'
    | 'description'
    | 'promo_code'
    | 'variants'
    | 'option_groups'
    | 'stock'
    | 'sizes'
    | 'is_active'
    | 'is_featured'
    | 'order'
    | 'show_out_of_stock_badge'
    | 'show_preorder_badge'
    | 'categories'
    | 'shipping_info'
    | 'faqs'
    | 'detailed_description'
    | 'created_at'
>;

// ─── Service ──────────────────────────────────────────────────



const LIST_SELECT_LIGHT = [
    'id', 'slug', 'name', 'price', 'original_price', 'discount',
    'main_image', 'variants', 'stock', 'sizes', 'is_active', 'is_featured',
    'order',
    'show_out_of_stock_badge', 'show_preorder_badge', 'categories',
    'created_at',
].join(', ');

/** Same as light select but includes the full images array (for hover previews etc.) */
const LIST_SELECT_WITH_IMAGES = [
    'id', 'slug', 'name', 'price', 'original_price', 'discount',
    'main_image', 'images', 'variants', 'stock', 'sizes', 'is_active', 'is_featured',
    'order',
    'show_out_of_stock_badge', 'show_preorder_badge', 'categories',
    'created_at',
].join(', ');

/**
 * Fetch paginated active products for the storefront.
 * Pass `includeImages: true` when you need the full images array (e.g. homepage hover previews).
 */
export async function getActiveProducts(options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'custom';
    featuredOnly?: boolean;
    includeImages?: boolean;
} = {}): Promise<{ products: ProductListItem[]; total: number }> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const selectStr = options.includeImages ? LIST_SELECT_WITH_IMAGES : LIST_SELECT_LIGHT;

    let query = supabaseAdmin
        .from('products')
        .select(selectStr, { count: 'exact' })
        .eq('is_active', true)
        .range(from, to);

    if (options.featuredOnly) {
        query = query.eq('is_featured', true);
    }

    const sort = options.sort || 'newest';
    if (sort === 'price-asc') query = query.order('price', { ascending: true });
    else if (sort === 'price-desc') query = query.order('price', { ascending: false });
    else if (sort === 'custom') query = query.order('order', { ascending: true });
    else query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return { products: (data as unknown as ProductListItem[]) ?? [], total: count ?? 0 };
}

/**
 * Fetch all products for admin (includes inactive).
 */
export async function getAllProductsAdmin(options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'custom';
} = {}): Promise<{ products: Product[]; total: number }> {
    const sort = options.sort || 'newest';

    let query = supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        .order(sort === 'custom' ? 'order' : 'created_at', { ascending: sort === 'custom' });

    if (options.page !== undefined || options.limit !== undefined) {
        const page = options.page ?? 1;
        const limit = options.limit ?? 50;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    return { products: (data as Product[]) ?? [], total: count ?? 0 };
}

/**
 * Fetch a single product by UUID.
 */
export const getProductById = cache(async (id: string): Promise<Product | null> => {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch product: ${error.message}`);
    return data as Product | null;
});

/**
 * Fetch a single product by Slug.
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch product by slug: ${error.message}`);
    return data as Product | null;
});

/**
 * Fetch multiple products by IDs in a single query.
 * Used for cart validation — replaces the "fetch all products" anti-pattern
 * flagged in the CartContext review.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', ids)
        .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch products by ids: ${error.message}`);
    return (data as Product[]) ?? [];
}

/**
 * Fetch products by category.
 * Uses the GIN index on the categories array column.
 */
export async function getProductsByCategory(category: string, options: {
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'custom';
    featuredOnly?: boolean;
} = {}): Promise<{ products: ProductListItem[]; total: number }> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
        .from('products')
        .select(LIST_SELECT_LIGHT, { count: 'exact' })
        .eq('is_active', true)
        .contains('categories', [category])
        .range(from, to);

    if (options.featuredOnly) {
        query = query.eq('is_featured', true);
    }

    const sort = options.sort || 'newest';
    if (sort === 'price-asc') query = query.order('price', { ascending: true });
    else if (sort === 'price-desc') query = query.order('price', { ascending: false });
    else if (sort === 'custom') query = query.order('order', { ascending: true });
    else query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch products by category: ${error.message}`);
    return { products: (data as unknown as ProductListItem[]) ?? [], total: count ?? 0 };
}

/**
 * Fetch related products (same category, excluding current product)
 */
export async function getRelatedProducts(
    excludeId: string,
    categories: string[],
    limit: number
): Promise<ProductListItem[]> {
    if (!categories) return [];
    const validCategories = categories.filter(c => c.trim().length > 0);
    if (validCategories.length === 0) return [];

    const { data, error } = await supabaseAdmin
        .from('products')
        .select(LIST_SELECT_LIGHT)
        .eq('is_active', true)
        .neq('id', excludeId)
        .overlaps('categories', validCategories)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(`Failed to fetch related products: ${error.message}`);
    return (data as unknown as ProductListItem[]) ?? [];
}

/**
 * Create a new product.
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabaseAdmin
        .from('products')
        .insert(input as unknown as Database['public']['Tables']['products']['Insert'])
        .select()
        .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
    return data as Product;
}

/**
 * Update a product by UUID.
 * Returns null if not found.
 */
export async function updateProduct(
    id: string,
    input: UpdateProductInput
): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
        .from('products')
        .update(input as unknown as Database['public']['Tables']['products']['Update'])
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw new Error(`Failed to update product: ${error.message}`);
    return data as Product | null;
}

/**
 * Delete a product by UUID.
 * Returns the deleted product so the caller can clean up S3/Cloudinary images.
 */
export async function deleteProduct(id: string): Promise<Product | null> {
    const product = await getProductById(id);
    if (!product) return null;

    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete product: ${error.message}`);
    return product;
}

/**
 * Atomically deduct stock for an order.
 * Calls the deduct_stock Postgres function — handles both variant
 * and non-variant products. Throws if stock is insufficient.
 *
 * Transition-safe: supports both legacy name-based and new attribute-based matching.
 */
export async function deductStock(
    productId: string,
    quantity: number,
    variantName?: string,
    variantAttrs?: Record<string, string>
): Promise<void> {
    const { error } = await supabaseAdmin.rpc('deduct_stock', {
        p_product_id: productId,
        p_quantity: quantity,
        p_variant_name: variantName ?? null,
        p_variant_attrs: variantAttrs ?? null,
    });

    if (error) {
        // Surface the specific error message from the Postgres function
        throw new Error(error.message);
    }
}

/**
 * Restore stock after a failed order or cancellation.
 * Uses atomic restore_stock Postgres function with FOR UPDATE lock.
 *
 * Transition-safe: supports both legacy name-based and new attribute-based matching.
 */
export async function restoreStock(
    productId: string,
    quantity: number,
    variantName?: string,
    variantAttrs?: Record<string, string>
): Promise<void> {
    const { error } = await supabaseAdmin.rpc('restore_stock', {
        p_product_id: productId,
        p_quantity: quantity,
        p_variant_name: variantName ?? null,
        p_variant_attrs: variantAttrs ?? null,
    });

    if (error) {
        console.error(`Failed to restore stock for ${productId}:`, error.message);
        // Don't throw — stock restore is best-effort on cancellation
    }
}

/**
 * Get count of all products, separated by active and hidden.
 */
export async function getProductVisibilityStats(): Promise<{ totalProducts: number, activeProducts: number, hiddenProducts: number, allVisible: boolean }> {
    const [totalResponse, activeResponse] = await Promise.all([
        supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
    ]);

    if (totalResponse.error) throw new Error(totalResponse.error.message);
    if (activeResponse.error) throw new Error(activeResponse.error.message);

    const totalProducts = totalResponse.count ?? 0;
    const activeProducts = activeResponse.count ?? 0;
    const hiddenProducts = totalProducts - activeProducts;
    const allVisible = activeProducts === totalProducts && totalProducts > 0;

    return { totalProducts, activeProducts, hiddenProducts, allVisible };
}

/**
 * Toggle visibility (is_active) for ALL products.
 */
export async function toggleAllProductsVisibility(visible: boolean): Promise<number> {
    const { data, error } = await supabaseAdmin
        .from('products')
        .update({ is_active: visible })
        .neq('is_active', visible)
        .select('id');

    if (error) throw new Error(`Failed to toggle visibility for all products: ${error.message}`);
    return data?.length ?? 0;
}

/**
 * Search active products by name or description.
 * Returns a small set for the storefront search overlay.
 */
export async function searchProducts(query: string, limit = 10): Promise<ProductListItem[]> {
    if (!query || query.trim().length === 0) return [];

    const safe = query.trim().replace(/[,.'"`\\]/g, '');
    const term = `%${safe}%`;

    const { data, error } = await supabaseAdmin
        .from('products')
        .select(LIST_SELECT_LIGHT)
        .eq('is_active', true)
        .or(`name.ilike.${term},description.ilike.${term}`)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(`Failed to search products: ${error.message}`);
    return (data as unknown as ProductListItem[]) ?? [];
}