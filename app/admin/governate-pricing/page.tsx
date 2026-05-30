'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, MapPin, Truck, Banknote, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EGYPT_GOVERNORATES } from '@/lib/data/egypt-governates';

// ─── Types ────────────────────────────────────────────────────

type GovPricing = {
    id?: string;
    governorate: string;
    shipping_cost: number;
    cod_fee: number;
    is_active: boolean;
};

// ─── Page ─────────────────────────────────────────────────────

export default function GovernoratePricingPage() {
    const [pricing, setPricing] = useState<GovPricing[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editedRows, setEditedRows] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');

    const fetchPricing = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/governate-pricing');
            const data = await res.json();

            if (data.success && data.pricing) {
                // Merge with full governorate list
                const pricingMap = new Map(
                    data.pricing.map((p: GovPricing) => [p.governorate, p])
                );

                const merged = EGYPT_GOVERNORATES.map(gov => {
                    const existing = pricingMap.get(gov.name) as GovPricing | undefined;
                    return {
                        id: existing?.id,
                        governorate: gov.name,
                        shipping_cost: existing?.shipping_cost ?? 0,
                        cod_fee: existing?.cod_fee ?? 0,
                        is_active: existing?.is_active ?? true,
                    };
                });

                setPricing(merged);
            } else {
                // No data yet — initialize with defaults  
                const defaults = EGYPT_GOVERNORATES.map(gov => ({
                    governorate: gov.name,
                    shipping_cost: 0,
                    cod_fee: 0,
                    is_active: true,
                }));
                setPricing(defaults);
            }
        } catch {
            setError('Failed to load governorate pricing. Please check your connection and try again.');
            toast.error('Failed to load pricing data');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch existing pricing ─────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => fetchPricing(), 0);
        return () => clearTimeout(timer);
    }, [fetchPricing]);

    // ── Update a single row ─────────────────────────────────
    const updateRow = (governorate: string, field: keyof GovPricing, value: number | boolean) => {
        setPricing(prev =>
            prev.map(p =>
                p.governorate === governorate ? { ...p, [field]: value } : p
            )
        );
        setEditedRows(prev => new Set(prev).add(governorate));
    };

    // ── Save all changes ────────────────────────────────────
    const saveAll = async () => {
        setSaving(true);
        const toastId = toast.loading('Saving governorate pricing…');

        try {
            const entries = pricing.map(p => ({
                governorate: p.governorate,
                shippingCost: p.shipping_cost,
                codFee: p.cod_fee,
                isActive: p.is_active,
            }));

            const res = await fetch('/api/admin/governate-pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bulk: true, entries }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`All ${EGYPT_GOVERNORATES.length} governorates saved successfully`, {
                    id: toastId,
                    duration: 3000,
                });
                setEditedRows(new Set());
                fetchPricing(); // Refresh from server
            } else {
                toast.error(data.error || 'Failed to save pricing', { id: toastId });
            }
        } catch {
            toast.error('Failed to save. Please check your connection and try again.', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    // ── Set same price for all ──────────────────────────────
    const setAllShipping = (val: number) => {
        setPricing(prev => prev.map(p => ({ ...p, shipping_cost: val })));
        setEditedRows(new Set(EGYPT_GOVERNORATES.map(g => g.name)));
    };

    const setAllCod = (val: number) => {
        setPricing(prev => prev.map(p => ({ ...p, cod_fee: val })));
        setEditedRows(new Set(EGYPT_GOVERNORATES.map(g => g.name)));
    };

    // ── Counts ──────────────────────────────────────────────
    const activeCount = pricing.filter(p => p.is_active).length;
    const configuredCount = pricing.filter(p => p.shipping_cost > 0).length;

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading governorate pricing…</span>
                </div>
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────
    if (error && pricing.length === 0) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-[14px] font-medium text-white mb-1">Unable to Load Pricing</p>
                        <p className="text-[12px] text-stone-500">{error}</p>
                    </div>
                    <Button
                        onClick={fetchPricing}
                        className="bg-stone-800 hover:bg-stone-700 text-white text-[13px] gap-1.5"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white max-w-6xl">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">Settings</div>
                    <h1 className="text-xl font-semibold text-white">Shipping & COD Pricing</h1>
                    <p className="text-[12px] text-stone-500 mt-1">
                        Manage shipping costs and cash-on-delivery fees for all {EGYPT_GOVERNORATES.length} Lebanese governorates
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {editedRows.size > 0 && (
                        <span className="text-[11px] text-amber-400 font-medium px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                            {editedRows.size} unsaved changes
                        </span>
                    )}
                    <Button
                        onClick={saveAll}
                        disabled={saving}
                        className="bg-white text-stone-900 hover:bg-stone-200 text-[13px] font-medium h-9 gap-1.5"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save All
                    </Button>
                </div>
            </div>

            {/* ── Stats ───────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[18px] font-semibold text-white">{EGYPT_GOVERNORATES.length}</p>
                            <p className="text-[11px] text-stone-500">Total Governorates</p>
                        </div>
                    </div>
                </div>
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                            <p className="text-[18px] font-semibold text-white">{activeCount}</p>
                            <p className="text-[11px] text-stone-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[18px] font-semibold text-white">{configuredCount}</p>
                            <p className="text-[11px] text-stone-500">Configured</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Set ───────────────────────────────── */}
            <div className="bg-stone-800/30 border border-stone-800/50 rounded-xl p-4 mb-6">
                <p className="text-[12px] text-stone-400 font-medium mb-3">Quick Set — Apply to all governorates</p>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-stone-500" />
                        <span className="text-[12px] text-stone-400">Shipping:</span>
                        {[5, 10, 15, 20, 25].map(val => (
                            <button
                                key={val}
                                onClick={() => setAllShipping(val)}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-[11px] text-stone-300 transition-colors cursor-pointer"
                            >
                                {val} USD
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-6 bg-stone-800" />
                    <div className="flex items-center gap-2">
                        <Banknote className="h-3.5 w-3.5 text-stone-500" />
                        <span className="text-[12px] text-stone-400">COD Fee:</span>
                        {[0, 1, 2, 3, 5].map(val => (
                            <button
                                key={val}
                                onClick={() => setAllCod(val)}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-[11px] text-stone-300 transition-colors cursor-pointer"
                            >
                                {val === 0 ? 'Free' : `${val} USD`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Table ───────────────────────────────────── */}
            <div className="bg-stone-800/30 border border-stone-800/50 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-stone-800/60">
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider w-8">
                                #
                            </th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                Governorate
                            </th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                Shipping Cost (USD)
                            </th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                COD Fee (USD)
                            </th>
                            <th className="text-center px-5 py-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pricing.map((row, index) => {
                            const govData = EGYPT_GOVERNORATES.find(g => g.name === row.governorate);
                            const isEdited = editedRows.has(row.governorate);

                            return (
                                <tr
                                    key={row.governorate}
                                    className={`border-b border-stone-800/30 transition-colors ${isEdited ? 'bg-amber-500/5' : 'hover:bg-stone-800/20'
                                        }`}
                                >
                                    {/* Index */}
                                    <td className="px-5 py-3">
                                        <span className="text-[11px] text-stone-600 font-mono">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </td>

                                    {/* Governorate Name */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${row.is_active ? 'bg-green-400' : 'bg-stone-600'
                                                }`} />
                                            <div>
                                                <p className="text-[13px] font-medium text-white">
                                                    {row.governorate}
                                                </p>
                                                <p className="text-[11px] text-stone-500">
                                                    {govData?.nameEn}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Shipping Cost */}
                                    <td className="px-5 py-3">
                                        <div className="relative w-28">
                                            <input
                                                type="number"
                                                value={row.shipping_cost || ''}
                                                onChange={(e) => updateRow(
                                                    row.governorate,
                                                    'shipping_cost',
                                                    parseFloat(e.target.value) || 0,
                                                )}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-3 py-1.5 bg-stone-800/60 border border-stone-700 rounded-md text-[13px] text-white focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 placeholder:text-stone-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </td>

                                    {/* COD Fee */}
                                    <td className="px-5 py-3">
                                        <div className="relative w-28">
                                            <input
                                                type="number"
                                                value={row.cod_fee || ''}
                                                onChange={(e) => updateRow(
                                                    row.governorate,
                                                    'cod_fee',
                                                    parseFloat(e.target.value) || 0,
                                                )}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-3 py-1.5 bg-stone-800/60 border border-stone-700 rounded-md text-[13px] text-white focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 placeholder:text-stone-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </td>

                                    {/* Active toggle */}
                                    <td className="px-5 py-3 text-center">
                                        <button
                                            onClick={() => updateRow(
                                                row.governorate,
                                                'is_active',
                                                !row.is_active,
                                            )}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${row.is_active
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                                : 'bg-stone-800 text-stone-500 border-stone-700 hover:bg-stone-700'
                                                }`}
                                        >
                                            {row.is_active ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-3 w-3" />
                                                    Inactive
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Info ─────────────────────────────────────── */}
            <div className="mt-6 bg-stone-800/20 border border-stone-800/40 rounded-xl p-5">
                <h4 className="text-[13px] font-medium text-stone-300 mb-2">How it works</h4>
                <ul className="text-[12px] text-stone-500 space-y-1.5">
                    <li>• <strong className="text-stone-400">Shipping Cost:</strong> The base delivery fee charged to the customer when they select this governorate at checkout</li>
                    <li>• <strong className="text-stone-400">COD Fee:</strong> Additional fee applied only when cash-on-delivery is chosen as payment method</li>
                    <li>• <strong className="text-stone-400">Active/Inactive:</strong> Inactive governorates will not appear as options in the checkout form</li>
                    <li>• Use the Quick Set buttons above to apply the same rate to all governorates at once</li>
                    <li>• Changes are saved only when you click &quot;Save All&quot;</li>
                </ul>
            </div>
        </div>
    );
}
