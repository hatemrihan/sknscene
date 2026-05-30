"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { SideBarNav } from '@/app/admin/sections/SideBarNav';
import { MobileNav } from '@/app/admin/sections/MobileNav';

interface PromoCode {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    minAmount?: number;
    maxUses?: number;
    isActive: boolean;
    validUntil: string;
    description?: string;
}

const STEPS = [
    { id: 'details', num: '01', title: 'Code Details' },
    { id: 'discount', num: '02', title: 'Discount Info' },
    { id: 'limits', num: '03', title: 'Usage Limits' }
];

const LeftStepper = () => {
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            window.history.pushState(null, '', `#${id}`);
        }
    };

    return (
        <aside className="hidden lg:block w-56 shrink-0 relative z-0">
            <div className="sticky top-[100px] pt-4">
                <div className="absolute left-[11.5px] top-6 bottom-4 w-px bg-stone-700" />
                <ul className="space-y-6 relative">
                    {STEPS.map((step) => (
                        <li key={step.id}>
                            <a
                                href={`#${step.id}`}
                                onClick={(e) => scrollToSection(e, step.id)}
                                className="group flex items-center gap-4 text-stone-300 hover:text-white transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-stone-800 border-2 border-stone-600 flex items-center justify-center text-[10px] text-white font-bold font-mono transition-colors z-10 shrink-0 group-hover:border-white">
                                    {step.num}
                                </div>
                                <span className="text-[13px] font-semibold tracking-wide">{step.title}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-16">
        <h3 className="text-[15px] font-semibold text-white mb-6 tracking-tight border-b border-stone-700 pb-4">{title}</h3>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[13px] font-medium text-stone-300 mb-2">{children}</label>
);

export default function AddPromoCodePage() {
    const router = useRouter();
    const [saving, setSaving] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [newPromoCode, setNewPromoCode] = useState<PromoCode>(() => ({
        code: '',
        discount: 0,
        type: 'percentage',
        minAmount: 0,
        maxUses: 100,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
    }));

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!newPromoCode.code.trim()) errors.code = 'Code is required';
        if (!newPromoCode.discount) errors.discount = 'Discount value is required';
        if (newPromoCode.type === 'percentage' && newPromoCode.discount > 100) {
            errors.discount = 'Percentage discount cannot exceed 100';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddPromoCode = async () => {
        try {
            if (!validateForm()) return;
            setSaving(true);
            setFormErrors({});

            const payload = {
                code: newPromoCode.code,
                discount_type: newPromoCode.type,
                discount_value: newPromoCode.discount,
                minimum_order: newPromoCode.minAmount,
                max_uses: newPromoCode.maxUses,
                is_active: newPromoCode.isActive,
                expires_at: newPromoCode.validUntil ? new Date(newPromoCode.validUntil).toISOString() : null,
                description: newPromoCode.description
            };

            const response = await fetch('/api/admin/promo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSubmitSuccess(true);
                setTimeout(() => router.back(), 1500);
            } else {
                const data = await response.json();
                setFormErrors({ submit: data.error || 'Failed to add promo code' });
            }
        } catch (error) {
            console.error(error);
            setFormErrors({ submit: 'Error adding promo code' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="hidden lg:block">
                <SideBarNav />
            </div>
            <MobileNav />

            <div className="lg:ml-64 bg-stone-900 text-stone-100 min-h-screen">
                {/* Header Area */}
                <div className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-md sticky top-0 lg:top-0 z-30 pt-16 lg:pt-4">
                    <div className="px-6 pb-4 max-w-[1400px] mx-auto flex flex-col gap-1.5">
                        <button
                            onClick={() => router.back()}
                            className="text-stone-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-medium w-fit"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Promo Codes
                        </button>

                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Add Promo Code</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">Promo Management</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-12 max-w-[1400px] mx-auto flex items-start justify-center">
                    <LeftStepper />

                    <main className="w-full max-w-3xl shrink min-w-0 space-y-12 pb-32 lg:mx-12 z-10">

                        <div id="details" className="scroll-mt-32">
                            <Section title="01. Code Details">
                                <div className="space-y-5">
                                    <div>
                                        <InputLabel>Promo Code *</InputLabel>
                                        <input
                                            type="text"
                                            value={newPromoCode.code}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                                            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                            placeholder="SAVE20"
                                        />
                                        {formErrors.code && <p className="text-red-400 text-xs mt-1.5">{formErrors.code}</p>}
                                    </div>

                                    <div>
                                        <InputLabel>Description</InputLabel>
                                        <textarea
                                            value={newPromoCode.description || ''}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, description: e.target.value })}
                                            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                            placeholder="20% off on all products"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </div>

                        <div id="discount" className="scroll-mt-32">
                            <Section title="02. Discount Info">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <InputLabel>Discount Type</InputLabel>
                                        <select
                                            value={newPromoCode.type}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, type: e.target.value as 'percentage' | 'fixed' })}
                                            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (USD)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel>Discount Value *</InputLabel>
                                        <input
                                            type="number"
                                            value={newPromoCode.discount || ''}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, discount: parseFloat(e.target.value) || 0 })}
                                            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                            placeholder={newPromoCode.type === 'percentage' ? '20' : '50'}
                                            min="0"
                                            max={newPromoCode.type === 'percentage' ? '100' : undefined}
                                        />
                                        {formErrors.discount && <p className="text-red-400 text-xs mt-1.5">{formErrors.discount}</p>}
                                    </div>
                                </div>
                            </Section>
                        </div>

                        <div id="limits" className="scroll-mt-32">
                            <Section title="03. Usage Limits">

                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="text-sm font-medium text-white mb-1">Promo Code Status</h4>
                                        <p className="text-xs text-stone-400">
                                            {newPromoCode.isActive ? 'This promo code is active and usable.' : 'This promo code is disabled.'}
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={newPromoCode.isActive}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, isActive: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-stone-900"></div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-5 mb-5">
                                    <div>
                                        <InputLabel>Minimum Order Amount (USD)</InputLabel>
                                        <input
                                            type="number"
                                            value={newPromoCode.minAmount || ''}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, minAmount: parseFloat(e.target.value) || 0 })}
                                            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                            placeholder="100"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel>Maximum Uses</InputLabel>
                                        <input
                                            type="number"
                                            value={newPromoCode.maxUses || ''}
                                            onChange={(e) => setNewPromoCode({ ...newPromoCode, maxUses: parseInt(e.target.value) || 0 })}
                                            className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                            placeholder="100"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel>Valid Until</InputLabel>
                                    <div className="w-full p-1 border border-stone-700 rounded-lg bg-stone-800">
                                        <DatePicker
                                            date={newPromoCode.validUntil ? new Date(newPromoCode.validUntil) : undefined}
                                            onDateChange={(date) => setNewPromoCode({ ...newPromoCode, validUntil: date ? date.toISOString().split('T')[0] : '' })}
                                        />
                                    </div>
                                </div>
                            </Section>
                        </div>

                        {formErrors.submit && (
                            <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                                <p className="text-red-400 text-sm text-center font-medium">{formErrors.submit}</p>
                            </div>
                        )}

                        {submitSuccess && (
                            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center justify-center">
                                <p className="text-green-400 font-medium">Promo code added successfully! Redirecting...</p>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-stone-800 flex justify-end gap-4">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-stone-800 text-white border border-stone-700 rounded-xl font-medium hover:bg-stone-700 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPromoCode}
                                disabled={saving || submitSuccess}
                                className="bg-white hover:bg-stone-200 text-stone-900 px-8 py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-900" />
                                        Saving...
                                    </>
                                ) : 'Add Promo Code'}
                            </button>
                        </div>

                    </main>

                    <div className="hidden lg:block w-56 shrink-0" />
                </div>
            </div>
        </>
    );
}
