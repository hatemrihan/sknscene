'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, Banknote, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────

type PaymentSettings = {
    codEnabled: boolean;
    instaPayEnabled: boolean;
};

// ─── Page ─────────────────────────────────────────────────────

export default function PaymentSettingsPage() {
    const [settings, setSettings] = useState<PaymentSettings>({
        codEnabled: true,
        instaPayEnabled: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [error, setError] = useState('');
    const [original, setOriginal] = useState<PaymentSettings>({
        codEnabled: true,
        instaPayEnabled: false,
    });

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/payment-settings');
            const data = await res.json();

            if (data.success && data.settings) {
                const s = {
                    codEnabled: data.settings.codEnabled,
                    instaPayEnabled: data.settings.instaPayEnabled,
                };
                setSettings(s);
                setOriginal(s);
                setHasChanges(false);
            }
        } catch {
            setError('Failed to load payment settings. Please try again.');
            toast.error('Failed to load payment settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSettings();
    }, [fetchSettings]);

    // Track changes
    const updateSetting = (key: keyof PaymentSettings, value: boolean) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        setHasChanges(
            updated.codEnabled !== original.codEnabled ||
            updated.instaPayEnabled !== original.instaPayEnabled
        );
    };

    const saveSettings = async () => {
        setSaving(true);
        const toastId = toast.loading('Saving payment settings…');

        try {
            const res = await fetch('/api/admin/payment-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codEnabled: settings.codEnabled,
                    instaPayEnabled: settings.instaPayEnabled,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Payment settings saved', { id: toastId, duration: 3000 });
                setOriginal(settings);
                setHasChanges(false);
            } else {
                toast.error(data.error || 'Failed to save', { id: toastId });
            }
        } catch {
            toast.error('Failed to save. Please try again.', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading payment settings…</span>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-[14px] font-medium text-white mb-1">Unable to Load Settings</p>
                        <p className="text-[12px] text-stone-500">{error}</p>
                    </div>
                    <Button
                        onClick={fetchSettings}
                        className="bg-stone-800 hover:bg-stone-700 text-white text-[13px] gap-1.5"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // ── Payment methods config ───────────────────────────────
    const methods = [
        {
            key: 'codEnabled' as const,
            label: 'Cash on Delivery (COD)',
            description: 'Allow customers to pay with cash when their order is delivered. A COD fee may be added per governorate.',
            icon: Banknote,
            color: 'emerald',
            enabled: true,
        }
    ];

    return (
        <div className="text-white max-w-4xl">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">Settings</div>
                    <h1 className="text-xl font-semibold text-white">Payment Methods</h1>
                    <p className="text-[12px] text-stone-500 mt-1">
                        Control which payment methods are available to your customers at checkout
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="text-[11px] text-amber-400 font-medium px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                            Unsaved changes
                        </span>
                    )}
                    <Button
                        onClick={saveSettings}
                        disabled={saving || !hasChanges}
                        className="bg-white text-stone-900 hover:bg-stone-200 text-[13px] font-medium h-9 gap-1.5 disabled:opacity-40"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* ── Stats ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[18px] font-semibold text-white">1</p>
                            <p className="text-[11px] text-stone-500">Active Method</p>
                        </div>
                    </div>
                </div>
                <div className="bg-stone-800/40 border border-stone-800/60 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-500/10 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-stone-400" />
                        </div>
                        <div>
                            <p className="text-[18px] font-semibold text-white">1</p>
                            <p className="text-[11px] text-stone-500">Total Method</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Payment Method Cards ─────────────────────── */}
            <div className="space-y-4">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isOn = method.enabled;
                    const colorMap = {
                        emerald: {
                            bg: 'bg-emerald-500/10',
                            text: 'text-emerald-400',
                            border: 'border-emerald-500/20',
                            activeBg: 'bg-emerald-500',
                        }
                    };
                    const colors = colorMap[method.color as keyof typeof colorMap];

                    return (
                        <div
                            key={method.key}
                            className={`bg-stone-800/30 border rounded-xl p-5 border-emerald-500/20`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                        <Icon className={`h-5 w-5 ${colors.text}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-medium text-white mb-1">
                                            {method.label}
                                        </h3>
                                        <p className="text-[12px] text-stone-500 leading-relaxed max-w-md">
                                            {method.description}
                                        </p>

                                        {/* Status badge */}
                                        <div className="mt-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active — Sole checkout method
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Info ─────────────────────────────────────── */}
            <div className="mt-6 bg-stone-800/20 border border-stone-800/40 rounded-xl p-5">
                <h4 className="text-[13px] font-medium text-stone-300 mb-2">How it works</h4>
                <ul className="text-[12px] text-stone-500 space-y-1.5">
                    <li>• <strong className="text-stone-400">Cash on Delivery:</strong> Customers pay the delivery driver with cash upon arrival.</li>
                    <li>• Configured COD shipping fees and delivery prices per governorate are applied automatically at checkout.</li>
                </ul>
            </div>
        </div>
    );
}
