'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useCallback, Suspense } from 'react';
import Nav from '@/app/sections/nav';
import Footer from '@/app/sections/footer';
import { useShop } from '../_hooks/useShop';
import { ShopControls } from './ShopControls';
import { ProductGrid } from './ProductGrid';
import { ShopPagination } from './ShopPagination';
import type { SortOption, ShopFilters, ViewMode } from '../_types/shop';

function ShopClientInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Read initial state from URL
    const urlCategory = searchParams.get('category') || null;
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlSort = (searchParams.get('sort') as SortOption) || 'newest';

    const {
        products,
        categories,
        pagination,
        loading,
        sort,
        filters,
        viewMode,
        availableSizes,
        lowStockThreshold,
        setSort,
        setFilters,
        setPage,
        setViewMode,
    } = useShop({
        initialCategory: urlCategory,
        initialPage: urlPage,
        initialSort: urlSort,
    });

    // Sync URL → hook when URL params change externally
    useEffect(() => {
        if (urlCategory !== filters.category) setFilters({ category: urlCategory });
    }, [urlCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (urlSort !== sort) setSort(urlSort);
    }, [urlSort]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (urlPage !== pagination.page) setPage(urlPage);
    }, [urlPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── URL update helper ───────────────────────────────────────
    const updateURL = useCallback((params: Record<string, string | null>) => {
        const current = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value) current.set(key, value);
            else current.delete(key);
        });
        const qs = current.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // ── Handlers ────────────────────────────────────────────────
    const handleFiltersChange = useCallback((partial: Partial<ShopFilters>) => {
        setFilters(partial);
        // Only category goes into URL (shareable)
        if ('category' in partial) {
            updateURL({
                category: partial.category || null,
                page: null, // reset page
            });
        }
    }, [setFilters, updateURL]);

    const handleSortChange = useCallback((s: SortOption) => {
        setSort(s);
        updateURL({ sort: s, page: null });
    }, [setSort, updateURL]);

    const handleViewModeChange = useCallback((v: ViewMode) => {
        setViewMode(v);
    }, [setViewMode]);

    const handlePageChange = useCallback((p: number) => {
        setPage(p);
        updateURL({ page: p > 1 ? String(p) : null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setPage, updateURL]);

    const pageTitle = urlCategory || "Shop";

    return (
        <section className="min-h-screen bg-[#F5F2EB]">
            <Nav />
            <div className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Controls: breadcrumb + view + filter */}
                    <ShopControls
                        categories={categories}
                        filters={filters}
                        sort={sort}
                        viewMode={viewMode}
                        total={pagination.total}
                        availableSizes={availableSizes}
                        onFiltersChange={handleFiltersChange}
                        onSortChange={handleSortChange}
                        onViewModeChange={handleViewModeChange}
                    />

                    {/* Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-light tracking-wide text-stone-950 font-sans">
                            {pageTitle}
                        </h1>
                    </div>

                    {/* Products */}
                    <ProductGrid
                        products={products}
                        loading={loading}
                        viewMode={viewMode}
                        lowStockThreshold={lowStockThreshold}
                    />

                    {/* Pagination info + dots */}
                    {pagination.totalPages > 1 && (
                        <>
                            <ShopPagination
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                             <div className="mt-2 text-center text-[12px] text-stone-500 font-medium">
                                Page {pagination.page} of {pagination.totalPages} • {pagination.total} products
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </section>
    );
}

export function ShopClient() {
    return (
        <Suspense fallback={
             <section className="min-h-screen bg-[#F5F2EB]">
                <Nav />
                <div className="pt-24 pb-16 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E11D00]" />
                </div>
                <Footer />
            </section>
        }>
            <ShopClientInner />
        </Suspense>
    );
}
