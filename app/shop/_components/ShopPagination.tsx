'use client';

import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ShopPagination as PaginationType } from '../_types/shop';

type Props = {
    pagination: PaginationType;
    onPageChange: (page: number) => void;
};

/**
 * Pagination — Previous / page numbers / Next
 */
export const ShopPagination = memo(function ShopPagination({ pagination, onPageChange }: Props) {
    const { page, totalPages } = pagination;

    if (totalPages <= 1) return null;

    // Build visible page numbers (max 5 shown)
    const pages = getVisiblePages(page, totalPages);

    return (
        <div className="flex items-center justify-between pt-10 pb-4">
            {/* Previous */}
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1.5 text-[13px] text-stone-600 hover:text-[#E11D00] hover:underline hover:underline-offset-2 disabled:no-underline disabled:opacity-30 disabled:text-stone-400 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none rounded px-2 py-1 font-medium cursor-pointer"
            >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`dot-${i}`} className="px-2 text-[13px] text-stone-400 font-bold">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`
                                w-8 h-8 rounded-md text-[13px] font-semibold transition-all duration-150 cursor-pointer
                                focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none focus-visible:ring-offset-1
                                ${page === p
                                    ? 'bg-[#E11D00] text-white shadow-sm border border-[#E11D00]'
                                    : 'text-stone-700 bg-transparent hover:bg-stone-200/50 hover:text-stone-950 border border-transparent'
                                }
                            `}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>

            {/* Next */}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 text-[13px] text-stone-600 hover:text-[#E11D00] hover:underline hover:underline-offset-2 disabled:no-underline disabled:opacity-30 disabled:text-stone-400 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none rounded px-2 py-1 font-medium cursor-pointer"
            >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
});

function getVisiblePages(current: number, total: number): (number | string)[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [];
    if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
}
