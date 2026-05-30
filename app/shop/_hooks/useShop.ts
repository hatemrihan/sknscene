'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    ShopProduct, ShopCategory, ShopPagination,
    SortOption, ShopFilters, ViewMode
} from '../_types/shop';

type UseShopParams = {
    initialCategory?: string | null;
    initialPage?: number;
    initialSort?: SortOption;
    limit?: number;
};

type UseShopReturn = {
    /** Filtered + paginated products to render */
    products: ShopProduct[];
    /** All fetched products (before client-side filters) */
    allProducts: ShopProduct[];
    categories: ShopCategory[];
    pagination: ShopPagination;
    loading: boolean;
    sort: SortOption;
    filters: ShopFilters;
    viewMode: ViewMode;
    /** Unique color names extracted from variants */
    availableColors: string[];
    /** Unique sizes extracted from products */
    availableSizes: string[];
    /** The dynamic low stock threshold from store settings */
    lowStockThreshold: number;

    setSort: (s: SortOption) => void;
    setFilters: (f: Partial<ShopFilters>) => void;
    setPage: (p: number) => void;
    setViewMode: (v: ViewMode) => void;
};

const SIZE_ORDER: Record<string, number> = {
    'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5,
    'XL': 6, 'XXL': 7, '2XL': 7, 'XXXL': 8, '3XL': 8,
    'ONE SIZE': 100, 'ONESIZE': 100,
};

export function useShop({
    initialCategory = null,
    initialPage = 1,
    initialSort = 'newest',
    limit = 16,
}: UseShopParams = {}): UseShopReturn {
    // ── Raw server data ─────────────────────────────────────────
    const [serverProducts, setServerProducts] = useState<ShopProduct[]>([]);
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Local UI state ──────────────────────────────────────────
    const [sort, setSort] = useState<SortOption>(initialSort);
    const [page, setPage] = useState(initialPage);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filters, setFiltersState] = useState<ShopFilters>({
        category: initialCategory,
        color: null,
        size: null,
        availability: 'all',
    });

    const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

    // ── Fetch from API (only category + sort + page sent to server) ──
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Fetch a larger set when client-side filters are active
            // so we can extract colors/sizes from the full set
            params.set('page', '1');
            params.set('limit', '200'); // Fetch all for client-side filtering
            params.set('sort', sort);
            if (filters.category) params.set('category', filters.category);

            const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json();

            if (data.success) {
                setServerProducts(data.products || []);
                setCategories(data.categories || []);
                if (data.lowStockThreshold !== undefined) {
                    setLowStockThreshold(data.lowStockThreshold);
                }
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    }, [sort, filters.category]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 0);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    // ── Extract unique colors from product variants ─────────────
    const availableColors = useMemo(() => {
        const colors = new Set<string>();
        serverProducts.forEach(p => {
            p.variants?.forEach(v => {
                if (v.name) colors.add(v.name);
            });
        });
        return Array.from(colors).sort();
    }, [serverProducts]);

    // ── Extract unique sizes from products ──────────────────────
    const availableSizes = useMemo(() => {
        const sizes = new Set<string>();
        serverProducts.forEach(p => {
            if (p.sizes) {
                p.sizes.split(',').forEach(s => {
                    const trimmed = s.trim();
                    if (trimmed) sizes.add(trimmed);
                });
            }
        });
        return Array.from(sizes).sort((a, b) => {
            const wa = SIZE_ORDER[a.toUpperCase()] || 50;
            const wb = SIZE_ORDER[b.toUpperCase()] || 50;
            return wa !== wb ? wa - wb : a.localeCompare(b);
        });
    }, [serverProducts]);

    // ── Apply client-side filters (color, size, availability) ───
    const filteredProducts = useMemo(() => {
        return serverProducts.filter(product => {
            // Color filter
            if (filters.color) {
                const hasColor = product.variants?.some(v => v.name === filters.color);
                if (!hasColor) return false;
            }

            // Size filter
            if (filters.size) {
                const productSizes = product.sizes?.split(',').map(s => s.trim()) || [];
                if (!productSizes.includes(filters.size)) return false;
            }

            // Availability filter
            if (filters.availability === 'in-stock') {
                const totalStock = product.variants?.length
                    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                    : product.stock || 0;
                if (totalStock <= 0) return false;
            } else if (filters.availability === 'out-of-stock') {
                const totalStock = product.variants?.length
                    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
                    : product.stock || 0;
                if (totalStock > 0) return false;
            }

            return true;
        });
    }, [serverProducts, filters.color, filters.size, filters.availability]);

    // ── Paginate ────────────────────────────────────────────────
    const totalFiltered = filteredProducts.length;
    const totalPages = Math.ceil(totalFiltered / limit);
    const start = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(start, start + limit);

    const pagination: ShopPagination = {
        page,
        limit,
        total: totalFiltered,
        totalPages,
    };

    // ── Setters ─────────────────────────────────────────────────
    const handleSetSort = useCallback((s: SortOption) => {
        setSort(s);
        setPage(1);
    }, []);

    const handleSetFilters = useCallback((partial: Partial<ShopFilters>) => {
        setFiltersState(prev => ({ ...prev, ...partial }));
        setPage(1);
    }, []);

    return {
        products: paginatedProducts,
        allProducts: serverProducts,
        categories,
        pagination,
        loading,
        sort,
        filters,
        viewMode,
        availableColors,
        availableSizes,
        lowStockThreshold,
        setSort: handleSetSort,
        setFilters: handleSetFilters,
        setPage,
        setViewMode,
    };
}
