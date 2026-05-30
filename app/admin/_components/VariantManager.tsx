"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, X, Trash2, AlertTriangle, Package } from 'lucide-react';
import type { ProductVariant, ProductOptionGroup } from '@/lib/database.types';

// ─── Constants ────────────────────────────────────────────────

const MAX_VARIANTS = 100;

// ─── Types ────────────────────────────────────────────────────

type Props = {
    optionGroups: ProductOptionGroup[];
    variants: ProductVariant[];
    onOptionGroupsChange: (groups: ProductOptionGroup[]) => void;
    onVariantsChange: (variants: ProductVariant[]) => void;
};

// ─── Helpers ──────────────────────────────────────────────────

function generateCombinations(groups: ProductOptionGroup[]): Record<string, string>[] {
    if (groups.length === 0) return [];
    const validGroups = groups.filter(g => g.name.trim() && g.values.length > 0);
    if (validGroups.length === 0) return [];

    let combos: Record<string, string>[] = [{}];
    for (const group of validGroups) {
        const next: Record<string, string>[] = [];
        for (const combo of combos) {
            for (const value of group.values) {
                next.push({ ...combo, [group.name]: value });
            }
        }
        combos = next;
    }
    return combos;
}

function attrsToKey(attrs: Record<string, string>): string {
    return Object.keys(attrs).sort().map(k => `${k}=${attrs[k]}`).join('|');
}

// ─── Component ────────────────────────────────────────────────

export function VariantManager({ optionGroups, variants, onOptionGroupsChange, onVariantsChange }: Props) {
    const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({});

    // ── Option Group CRUD ─────────────────────────────────────

    const addOptionGroup = useCallback(() => {
        onOptionGroupsChange([...optionGroups, { name: '', values: [] }]);
    }, [optionGroups, onOptionGroupsChange]);

    const removeOptionGroup = useCallback((index: number) => {
        const updated = optionGroups.filter((_, i) => i !== index);
        onOptionGroupsChange(updated);
        // Clear variants that used the removed group
        if (updated.length === 0) {
            onVariantsChange([]);
        }
    }, [optionGroups, onOptionGroupsChange, onVariantsChange]);

    const updateGroupName = useCallback((index: number, name: string) => {
        const updated = optionGroups.map((g, i) =>
            i === index ? { ...g, name } : g
        );
        onOptionGroupsChange(updated);
    }, [optionGroups, onOptionGroupsChange]);

    const addValueToGroup = useCallback((groupIndex: number, value: string) => {
        if (!value.trim()) return;
        const group = optionGroups[groupIndex];
        if (group.values.includes(value.trim())) return; // prevent duplicates
        const updated = optionGroups.map((g, i) =>
            i === groupIndex ? { ...g, values: [...g.values, value.trim()] } : g
        );
        onOptionGroupsChange(updated);
        setNewValueInputs(prev => ({ ...prev, [groupIndex]: '' }));
    }, [optionGroups, onOptionGroupsChange]);

    const removeValueFromGroup = useCallback((groupIndex: number, valueIndex: number) => {
        const updated = optionGroups.map((g, i) =>
            i === groupIndex ? { ...g, values: g.values.filter((_, vi) => vi !== valueIndex) } : g
        );
        onOptionGroupsChange(updated);
    }, [optionGroups, onOptionGroupsChange]);

    // ── Auto-generate variants ────────────────────────────────

    const possibleCombinations = useMemo(() => generateCombinations(optionGroups), [optionGroups]);
    const combinationCount = possibleCombinations.length;
    const isOverLimit = combinationCount > MAX_VARIANTS;

    const handleGenerateVariants = useCallback(() => {
        if (isOverLimit) return;

        // Preserve existing variant data (stock/price) by matching attributes
        const existingMap = new Map<string, ProductVariant>();
        for (const v of variants) {
            existingMap.set(attrsToKey(v.attributes), v);
        }

        const generated: ProductVariant[] = possibleCombinations.map((attrs) => {
            const key = attrsToKey(attrs);
            const existing = existingMap.get(key);
            return {
                clientId: existing?.clientId || crypto.randomUUID(),
                attributes: attrs,
                stock: existing?.stock ?? 0,
                price: existing?.price,
                images: existing?.images ?? [],
                videos: existing?.videos ?? [],
            };
        });

        onVariantsChange(generated);
    }, [possibleCombinations, variants, isOverLimit, onVariantsChange]);

    // ── Variant field updates ─────────────────────────────────

    const updateVariantField = useCallback(<K extends keyof ProductVariant>(
        index: number,
        field: K,
        value: ProductVariant[K]
    ) => {
        const updated = variants.map((v, i) =>
            i === index ? { ...v, [field]: value } : v
        );
        onVariantsChange(updated);
    }, [variants, onVariantsChange]);

    const removeVariant = useCallback((index: number) => {
        onVariantsChange(variants.filter((_, i) => i !== index));
    }, [variants, onVariantsChange]);

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="space-y-8">

            {/* ── Option Groups ───────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="text-sm font-medium text-white">Option Groups</h4>
                        <p className="text-xs text-stone-400 mt-0.5">
                            Define attribute types like &quot;Volume&quot;, &quot;Skin Type&quot;, &quot;Scent&quot;, etc.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addOptionGroup}
                        className="flex items-center gap-1.5 text-xs font-medium text-white bg-stone-700 hover:bg-stone-600 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Group
                    </button>
                </div>

                {optionGroups.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-stone-700 rounded-xl">
                        <Package className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                        <p className="text-sm text-stone-500 font-medium">No option groups yet</p>
                        <p className="text-xs text-stone-600 mt-1">
                            Add groups to define product attributes (e.g. Volume, Skin Type, Scent)
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    {optionGroups.map((group, gi) => (
                        <div
                            key={gi}
                            className="bg-stone-800/50 border border-stone-700 rounded-xl p-4"
                        >
                            {/* Group header */}
                            <div className="flex items-center gap-3 mb-3">
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateGroupName(gi, e.target.value)}
                                    placeholder="Group name (e.g. Volume, Skin Type, Scent)"
                                    className="flex-1 p-2.5 bg-stone-800 border border-stone-600 rounded-lg text-white text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white placeholder:text-stone-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOptionGroup(gi)}
                                    className="text-stone-500 hover:text-red-400 transition-colors p-1.5"
                                    title="Remove group"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Values as tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {group.values.map((val, vi) => (
                                    <span
                                        key={vi}
                                        className="flex items-center gap-1.5 bg-stone-700 text-stone-200 text-xs font-medium px-3 py-1.5 rounded-full"
                                    >
                                        {val}
                                        <button
                                            type="button"
                                            onClick={() => removeValueFromGroup(gi, vi)}
                                            className="text-stone-400 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Add value input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newValueInputs[gi] || ''}
                                    onChange={(e) => setNewValueInputs(prev => ({ ...prev, [gi]: e.target.value }))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addValueToGroup(gi, newValueInputs[gi] || '');
                                        }
                                    }}
                                    placeholder="Type a value and press Enter"
                                    className="flex-1 p-2 bg-stone-900 border border-stone-700 rounded-lg text-white text-xs focus:border-white focus:outline-none focus:ring-1 focus:ring-white placeholder:text-stone-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => addValueToGroup(gi, newValueInputs[gi] || '')}
                                    className="text-xs font-medium text-stone-300 hover:text-white bg-stone-700 hover:bg-stone-600 px-3 py-2 rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Generate Variants ────────────────────────── */}
            {optionGroups.length > 0 && optionGroups.some(g => g.name.trim() && g.values.length > 0) && (
                <div className="border-t border-stone-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-medium text-white">Variants</h4>
                            <p className="text-xs text-stone-400 mt-0.5">
                                {combinationCount > 0
                                    ? `${combinationCount} possible combination${combinationCount === 1 ? '' : 's'} from your option groups`
                                    : 'Define option group values to generate variants'
                                }
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateVariants}
                            disabled={isOverLimit || combinationCount === 0}
                            className="flex items-center gap-1.5 text-xs font-medium text-stone-900 bg-white hover:bg-stone-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Generate Variants
                        </button>
                    </div>

                    {isOverLimit && (
                        <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg mb-4">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-300">
                                Too many combinations ({combinationCount}). Maximum is {MAX_VARIANTS}.
                                Reduce option values to generate variants.
                            </p>
                        </div>
                    )}

                    {/* ── Variants Table ────────────────────── */}
                    {variants.length > 0 && (
                        <div className="border border-stone-700 rounded-xl overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-3 px-4 py-3 bg-stone-800/80 border-b border-stone-700">
                                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Attributes</span>
                                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Stock</span>
                                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Price</span>
                                <span />
                            </div>

                            {/* Table rows */}
                            <div className="divide-y divide-stone-800">
                                {variants.map((variant, vi) => (
                                    <div
                                        key={variant.clientId || vi}
                                        className="grid grid-cols-[1fr_100px_100px_40px] gap-3 px-4 py-3 items-center hover:bg-stone-800/30 transition-colors"
                                    >
                                        {/* Attributes display */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(variant.attributes).map(([key, val]) => (
                                                <span
                                                    key={key}
                                                    className="text-[11px] bg-stone-700/60 text-stone-300 px-2 py-1 rounded font-medium"
                                                >
                                                    {key}: <span className="text-white">{val}</span>
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stock input */}
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => updateVariantField(vi, 'stock', Math.max(0, parseInt(e.target.value) || 0))}
                                            min={0}
                                            className="w-full p-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm text-center focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        />

                                        {/* Price override input */}
                                        <input
                                            type="number"
                                            value={variant.price ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateVariantField(vi, 'price', val === '' ? undefined : parseFloat(val) || 0);
                                            }}
                                            placeholder="—"
                                            className="w-full p-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm text-center focus:border-white focus:outline-none focus:ring-1 focus:ring-white placeholder:text-stone-600"
                                        />

                                        {/* Remove */}
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(vi)}
                                            className="text-stone-600 hover:text-red-400 transition-colors p-1 mx-auto"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Total stock summary */}
                            <div className="px-4 py-3 bg-stone-800/50 border-t border-stone-700">
                                <p className="text-xs text-stone-400">
                                    Total stock across all variants:{' '}
                                    <span className="text-white font-semibold">
                                        {variants.reduce((sum, v) => sum + v.stock, 0)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
