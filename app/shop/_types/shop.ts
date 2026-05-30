// ── Shared types for the shop pages ──────────────────────────

export type ShopProduct = {
    id: string;
    slug: string;
    name: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    main_image: string;
    images: string[];
    description: string;
    variants: ShopVariant[];
    stock: number;
    sizes: string;
    is_active: boolean;
    is_featured: boolean;
    show_out_of_stock_badge: boolean;
    show_preorder_badge: boolean;
    categories: string[];
    created_at: string;
};

export type ShopVariant = {
    name: string;
    stock: number;
    price?: number;
    colorHex?: string;
    images?: string[];
};

export type ShopCategory = {
    id: string;
    name: string;
    image_url: string | null;
};

export type ShopPagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type SortOption = 'newest' | 'price-asc' | 'price-desc';

export type ViewMode = 'grid' | 'large';

export type ShopFilters = {
    category: string | null;
    color: string | null;
    size: string | null;
    availability: 'all' | 'in-stock' | 'out-of-stock';
};
