'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ShopCategory, ShopFilters, SortOption, ViewMode } from '../_types/shop';

type Props = {
    categories: ShopCategory[];
    filters: ShopFilters;
    sort: SortOption;
    viewMode: ViewMode;
    total: number;
    availableSizes: string[];
    onFiltersChange: (f: Partial<ShopFilters>) => void;
    onSortChange: (s: SortOption) => void;
    onViewModeChange: (v: ViewMode) => void;
};

type FilterView = 'main' | 'sizes' | 'availability' | 'sort';

const getSortOptions = (): { value: SortOption; label: string }[] => [
    { value: 'newest', label: "Newest" },
    { value: 'price-asc', label: "Price: Low to High" },
    { value: 'price-desc', label: "Price: High to Low" },
];

/**
 * Combined controls bar — Breadcrumb + View/Filter.
 * Preserves the exact high-end desktop controls layout.
 */
export const ShopControls = memo(function ShopControls({
    categories,
    filters,
    sort,
    viewMode,
    total,
    availableSizes,
    onFiltersChange,
    onSortChange,
    onViewModeChange,
}: Props) {
    const [filterView, setFilterView] = useState<FilterView>('main');

    // Active filter count (excluding category which is shown in breadcrumb)
    const activeFilterCount = [
        filters.color,
        filters.size,
        filters.availability !== 'all' ? filters.availability : null,
    ].filter(Boolean).length;

    return (
        <div className="flex justify-between items-center mb-8">
            {/* ── Breadcrumb ──────────── */}
            <nav className="flex items-center text-sm text-stone-500 font-medium">
                <Link
                    href="/"
                    className="hover:text-stone-950 hover:underline hover:underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none rounded px-1"
                >
                    Home
                </Link>
                <ChevronLeft className="mx-1.5 w-3.5 h-3.5 text-stone-400" />
                <Link
                    href="/shop"
                    className={`transition-colors focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none rounded px-1 ${!filters.category ? 'text-stone-950 font-bold underline underline-offset-2' : 'hover:text-stone-950 hover:underline hover:underline-offset-2'}`}
                    onClick={() => onFiltersChange({ category: null })}
                >
                    Shop
                </Link>
                {filters.category && (
                    <>
                        <ChevronLeft className="mx-1.5 w-3.5 h-3.5 text-stone-400" />
                        <span className="text-stone-950 font-bold">{filters.category}</span>
                    </>
                )}
            </nav>

            {/* ── View + Filter controls ── */}
            <div className="flex items-center gap-6 text-sm">
                {/* View toggle — desktop only */}
                <div className="hidden lg:flex items-center gap-2">
                    <span className="text-stone-500 font-medium">View:</span>
                    <button
                        className={`transition-all cursor-pointer rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none ${viewMode === 'grid'
                            ? 'text-stone-950 font-semibold underline underline-offset-4'
                            : 'text-stone-400 hover:text-stone-950 hover:underline hover:underline-offset-4'
                            }`}
                        onClick={() => onViewModeChange('grid')}
                    >
                        Grid
                    </button>
                    <button
                        className={`transition-all cursor-pointer rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none ${viewMode === 'large'
                            ? 'text-stone-950 font-semibold underline underline-offset-4'
                            : 'text-stone-400 hover:text-stone-950 hover:underline hover:underline-offset-4'
                            }`}
                        onClick={() => onViewModeChange('large')}
                    >
                        Large
                    </button>
                </div>

                {/* Result count */}
                {total > 0 && (
                    <span className="hidden sm:inline text-stone-500 font-sans font-medium text-[13px]">
                        {total.toLocaleString('en-US')} Products
                    </span>
                )}

                {/* Filter dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-stone-500 font-medium">Filter</span>
                    <DropdownMenu onOpenChange={(open) => { if (!open) setFilterView('main'); }}>
                        <DropdownMenuTrigger className="text-stone-950 font-semibold hover:text-[#E11D00] focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 rounded px-2 py-1 transition-all flex items-center gap-1 cursor-pointer outline-none">
                            <span className="flex items-center gap-1.5">
                                +
                                {activeFilterCount > 0 && (
                                    <span className="bg-[#E11D00] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-52 max-h-[75vh] overflow-y-auto bg-[#F5F2EB] shadow-2xl border-2 border-stone-950 rounded-lg p-0"
                        >
                            {/* ─── Main view ────────────────────── */}
                            {filterView === 'main' && (
                                <div className="animate-in fade-in slide-in-from-right-2 duration-200">
                                    {/* Category section */}
                                    <div className="px-1.5 py-2 border-b border-stone-300">
                                        <div className="px-2 mb-1.5">
                                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-sans">Category</span>
                                        </div>
                                        <DropdownMenuItem
                                            onClick={() => onFiltersChange({ category: null })}
                                            className="cursor-pointer text-[13px] rounded-md focus:bg-stone-200/80 focus:text-stone-950 font-medium text-stone-850 transition-colors duration-150"
                                        >
                                            <span className="flex-1">All</span>
                                            {!filters.category && <span className="text-stone-950 font-extrabold">✓</span>}
                                        </DropdownMenuItem>
                                        {categories.map((cat) => (
                                            <DropdownMenuItem
                                                key={cat.id}
                                                onClick={() => onFiltersChange({ category: cat.name })}
                                                className="cursor-pointer text-[13px] rounded-md focus:bg-stone-200/80 focus:text-stone-950 font-medium text-stone-850 transition-colors duration-150"
                                            >
                                                <span className="flex-1">{cat.name}</span>
                                                {filters.category === cat.name && <span className="text-stone-950 font-extrabold">✓</span>}
                                            </DropdownMenuItem>
                                        ))}
                                    </div>

                                    {/* Sort section */}
                                    <div className="px-1.5 py-2 border-b border-stone-300">
                                        <div className="px-2 mb-1.5">
                                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-sans">Sort</span>
                                        </div>
                                        {getSortOptions().map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => onSortChange(opt.value)}
                                                className="cursor-pointer text-[13px] rounded-md focus:bg-stone-200/80 focus:text-stone-950 font-medium text-stone-850 transition-colors duration-150"
                                            >
                                                <span className="flex-1">{opt.label}</span>
                                                {sort === opt.value && <span className="text-stone-950 font-extrabold">✓</span>}
                                            </DropdownMenuItem>
                                        ))}
                                    </div>

                                    {/* More filters */}
                                    <div className="px-1.5 py-2">
                                        <div className="px-2 mb-1.5">
                                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-sans">More filters</span>
                                        </div>

                                        {availableSizes.length > 0 && (
                                            <button
                                                onClick={() => setFilterView('sizes')}
                                                className="w-full text-left px-2.5 py-2 text-[13px] hover:bg-stone-200/50 rounded-md flex items-center justify-between transition-colors focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none"
                                            >
                                                <span className="flex items-center gap-2 text-stone-800 font-medium">
                                                    Volume / Size
                                                    {filters.size && (
                                                        <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-md font-semibold">{filters.size}</span>
                                                    )}
                                                </span>
                                                <ChevronLeft className="w-3.5 h-3.5 text-stone-400 rotate-180" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setFilterView('availability')}
                                            className="w-full text-left px-2.5 py-2 text-[13px] hover:bg-stone-200/50 rounded-md flex items-center justify-between transition-colors focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none"
                                        >
                                            <span className="flex items-center gap-2 text-stone-800 font-medium">
                                                Availability
                                                {filters.availability !== 'all' && (
                                                    <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-md font-semibold">
                                                        {filters.availability === 'in-stock' ? "In stock" : "Out of Stock"}
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronLeft className="w-3.5 h-3.5 text-stone-400 rotate-180" />
                                        </button>
                                    </div>

                                    {/* Clear all filters */}
                                    {activeFilterCount > 0 && (
                                        <div className="px-1.5 pb-2 border-t border-stone-300 pt-2">
                                            <DropdownMenuItem
                                                onClick={() => onFiltersChange({ color: null, size: null, availability: 'all' })}
                                                className="cursor-pointer text-[12px] text-[#E11D00] hover:text-white hover:bg-[#E11D00] focus:bg-[#E11D00] focus:text-white font-semibold rounded-md justify-center transition-colors duration-150"
                                            >
                                                Clear all filters
                                            </DropdownMenuItem>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── Sizes sub-view ───────────────── */}
                            {filterView === 'sizes' && (
                                <SubFilterView
                                    title="Volume / Size"
                                    onBack={() => setFilterView('main')}
                                >
                                    <DropdownMenuItem
                                        onClick={() => onFiltersChange({ size: null })}
                                        className="cursor-pointer text-[13px] rounded-md focus:bg-stone-200/80 focus:text-stone-950 font-medium text-stone-800 transition-colors duration-150"
                                    >
                                        <span className="flex-1">All</span>
                                        {!filters.size && <span className="text-stone-950 font-extrabold">✓</span>}
                                    </DropdownMenuItem>
                                    {availableSizes.map((size) => (
                                        <DropdownMenuItem
                                            key={size}
                                            onClick={() => onFiltersChange({ size })}
                                            className="cursor-pointer text-[13px] rounded-md focus:bg-stone-200/80 focus:text-stone-950 font-medium text-stone-800 transition-colors duration-150"
                                        >
                                            <span className="flex-1">{size}</span>
                                            {filters.size === size && <span className="text-stone-950 font-extrabold">✓</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </SubFilterView>
                            )}

                            {/* ─── Availability sub-view ────────── */}
                            {filterView === 'availability' && (
                                <SubFilterView
                                    title="Availability"
                                    onBack={() => setFilterView('main')}
                                >
                                    {([
                                        { value: 'all', label: "All" },
                                        { value: 'in-stock', label: "In stock" },
                                        { value: 'out-of-stock', label: "Out of Stock" },
                                    ] as const).map((opt) => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => onFiltersChange({ availability: opt.value })}
                                            className="cursor-pointer text-[13px] rounded-md focus:bg-stone-200/80 focus:text-stone-950 font-medium text-stone-800 transition-colors duration-150"
                                        >
                                            <span className="flex-1">{opt.label}</span>
                                            {filters.availability === opt.value && <span className="text-stone-950 font-extrabold">✓</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </SubFilterView>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
});

// ── Reusable sub-filter view with back button ────────────────
function SubFilterView({
    title,
    onBack,
    children,
}: {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="px-1.5 py-2 border-b border-stone-300">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-2 py-1 text-[13px] text-stone-600 hover:text-stone-950 hover:bg-stone-200/50 transition-colors rounded-md cursor-pointer font-medium focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div className="px-2 mt-1">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-sans">{title}</span>
                </div>
            </div>
            <div className="px-1.5 py-2">
                {children}
            </div>
        </div>
    );
}
