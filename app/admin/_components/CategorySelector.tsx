"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────

interface Category {
    id: string;
    name: string;
}

interface CategorySelectorProps {
    /** Currently selected category names. */
    selected: string[];
    /** Callback when selection changes. */
    onChange: (categories: string[]) => void;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Lightweight category picker for the product form.
 *
 * Fetches categories from the database and renders a checkbox grid.
 * All CRUD operations live on `/admin/categories` — this component
 * is purely for selection.
 */
export const CategorySelector: React.FC<CategorySelectorProps> = ({
    selected,
    onChange,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const res = await fetch("/api/admin/categories");
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(true);
                toast.error(data.error ?? "Failed to load categories.");
                return;
            }

            setCategories(data.categories);
        } catch {
            setError(true);
            toast.error("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchCategories(), 0);
        return () => clearTimeout(timer);
    }, [fetchCategories]);

    // Toggle a category name in / out of the selected array
    const toggleCategory = (name: string, checked: boolean) => {
        if (checked) {
            if (!selected.includes(name)) {
                onChange([...selected, name]);
            }
        } else {
            onChange(selected.filter((c) => c !== name));
        }
    };

    // ── Loading state ────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton
                            key={`cat-skel-${i}`}
                            className="h-10 bg-stone-800 rounded-lg"
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-red-900/50 bg-red-950/30">
                <p className="text-sm text-red-400">
                    Failed to load categories.
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchCategories}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                >
                    Retry
                </Button>
            </div>
        );
    }

    // ── Empty state ──────────────────────────────────────────
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg border border-stone-700 bg-stone-800/50">
                <p className="text-sm text-stone-400">
                    No categories exist yet.
                </p>
                <Button asChild variant="outline" size="sm" className="border-stone-600 text-stone-300 hover:bg-stone-700">
                    <Link href={`/admin/categories`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Create Categories
                    </Link>
                </Button>
            </div>
        );
    }

    // ── Normal state ─────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Category checkbox grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((cat) => {
                    const isChecked = selected.includes(cat.name);
                    return (
                        <label
                            key={cat.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked
                                ? "border-white/30 bg-stone-800"
                                : "border-stone-700 bg-stone-800/50 hover:bg-stone-800"
                                }`}
                        >
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    toggleCategory(cat.name, !!checked)
                                }
                                className="border-stone-500 data-[state=checked]:bg-white data-[state=checked]:text-stone-900"
                            />
                            <span className="text-sm font-medium text-white truncate">
                                {cat.name}
                            </span>
                        </label>
                    );
                })}
            </div>

            {/* Selected summary + manage link */}
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                    {selected.map((name) => (
                        <Badge
                            key={name}
                            variant="secondary"
                            className="bg-stone-800 text-stone-300 border-stone-700 text-xs"
                        >
                            {name}
                        </Badge>
                    ))}
                    {selected.length === 0 && (
                        <span className="text-xs text-stone-500">
                            No categories selected
                        </span>
                    )}
                </div>
                <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="text-stone-400 hover:text-white p-0 h-auto"
                >
                    <Link href={`/admin/categories`}>
                        Manage Categories
                        <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                </Button>
            </div>
        </div>
    );
};
