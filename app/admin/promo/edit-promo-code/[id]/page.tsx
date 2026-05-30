'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';

interface PromoCode {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumOrder?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    expiresAt?: Date;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface EditPromoCodeForm {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    minAmount?: number;
    maxUses?: number;
    isActive: boolean;
    validUntil: string;
    description?: string;
}

const EditPromoCodePage = () => {
    const router = useRouter();
    const params = useParams();
    const promoCodeId = params.id as string;

    const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [editForm, setEditForm] = useState<EditPromoCodeForm>(() => ({
        code: '',
        discount: 0,
        type: 'percentage',
        minAmount: 0,
        maxUses: 100,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
    }));

    // Fetch promo code details
    useEffect(() => {
        const fetchPromoCode = async () => {
            try {
                const response = await fetch(`/api/admin/promo/${promoCodeId}`);

                if (response.ok) {
                    const data = await response.json();
                    const promo = data.promo || data;

                    setPromoCode(promo);

                    // Populate form with existing data
                    setEditForm({
                        code: promo.code || '',
                        discount: promo.discountValue || 0,
                        type: promo.discountType || 'percentage',
                        minAmount: promo.minimumOrder || 0,
                        maxUses: promo.usageLimit || 100,
                        isActive: promo.isActive !== undefined ? promo.isActive : true,
                        validUntil: promo.expiresAt ? new Date(promo.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        description: promo.description || ''
                    });
                } else {
                    console.error('Failed to fetch promo code:', response.status);
                    setError('Failed to load promo code details');
                }
            } catch (error) {
                console.error('Error fetching promo code:', error);
                setError('Error loading promo code details');
            } finally {
                setLoading(false);
            }
        };

        if (promoCodeId) {
            fetchPromoCode();
        }
    }, [promoCodeId]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!editForm.code.trim()) errors.code = 'Code is required';
        if (!editForm.discount) errors.discount = 'Discount value is required';
        if (editForm.type === 'percentage' && editForm.discount > 100) {
            errors.discount = 'Percentage discount cannot exceed 100';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdatePromoCode = async () => {
        try {
            if (!validateForm()) return;
            setSaving(true);
            setFormErrors({});

            const response = await fetch(`/api/admin/promo/${promoCodeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: editForm.code,
                    discountType: editForm.type,
                    discountValue: editForm.discount,
                    minimumOrder: editForm.minAmount,
                    usageLimit: editForm.maxUses,
                    isActive: editForm.isActive,
                    expiresAt: editForm.validUntil ? new Date(editForm.validUntil) : undefined,
                    description: editForm.description
                }),
            });

            if (response.ok) {
                setSubmitSuccess(true);
                setTimeout(() => router.push('/admin/promo-codes'), 1500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                setFormErrors({ submit: errorData.error || 'Failed to update promo code' });
            }
        } catch (error) {
            console.error('Error updating promo code:', error);
            setFormErrors({ submit: 'Error updating promo code' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    <span className="text-lg">Loading promo code details...</span>
                </div>
            </div>
        );
    }

    if (error || !promoCode) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Promo Code Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The requested promo code could not be found.'}</p>
                    <button
                        onClick={() => router.push('/admin/promo-codes')}
                        className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-all duration-300"
                    >
                        Back to Promo Codes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="w-full p-2 md:p-4">
                <div className="w-full">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => router.push('/admin/promo-codes')}
                            className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors duration-300"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Promo Codes
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 p-3 md:p-4">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-black mb-2">Edit Promo Code</h1>
                            <p className="text-gray-600">Update the promotional code details</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Promo Code */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Promo Code *</label>
                                    <input
                                        type="text"
                                        value={editForm.code}
                                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                                        className="w-full p-3 bg-white border border-gray-300 text-black focus:border-black focus:outline-none"
                                        placeholder="SAVE20"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Description</label>
                                    <textarea
                                        value={editForm.description || ''}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-300 text-black focus:border-black focus:outline-none"
                                        placeholder="20% off on all products"
                                        rows={3}
                                    />
                                </div>

                                {/* Discount Type and Amount */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Discount Type</label>
                                        <select
                                            value={editForm.type}
                                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'percentage' | 'fixed' })}
                                            className="w-full p-3 bg-white border border-gray-300 text-black focus:border-black focus:outline-none"
                                        >
                                            <option value="percentage" className="text-black">Percentage (%)</option>
                                            <option value="fixed" className="text-black">Fixed Amount (USD)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-2">Discount Value *</label>
                                        <input
                                            type="number"
                                            value={editForm.discount}
                                            onChange={(e) => setEditForm({ ...editForm, discount: parseFloat(e.target.value) || 0 })}
                                            className="w-full p-3 bg-white border border-gray-300 text-black focus:border-black focus:outline-none"
                                            placeholder={editForm.type === 'percentage' ? '20' : '50'}
                                            min="0"
                                            max={editForm.type === 'percentage' ? '100' : undefined}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {/* Minimum Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Minimum Order Amount (USD)</label>
                                    <input
                                        type="number"
                                        value={editForm.minAmount || ''}
                                        onChange={(e) => setEditForm({ ...editForm, minAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-full p-3 bg-white border border-gray-300 text-black focus:border-black focus:outline-none"
                                        placeholder="100"
                                        min="0"
                                    />
                                </div>

                                {/* Maximum Uses */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Maximum Uses</label>
                                    <input
                                        type="number"
                                        value={editForm.maxUses || ''}
                                        onChange={(e) => setEditForm({ ...editForm, maxUses: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-white border border-gray-300 text-black focus:border-black focus:outline-none"
                                        placeholder="100"
                                        min="1"
                                    />
                                </div>

                                {/* Current Usage Display */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Current Usage</label>
                                    <div className="w-full p-3 bg-gray-100 border border-gray-300 text-gray-700">
                                        {promoCode.usedCount} times used
                                    </div>
                                </div>

                                {/* Validity Period */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Valid Until</label>
                                    <DatePicker
                                        date={editForm.validUntil ? new Date(editForm.validUntil) : undefined}
                                        onDateChange={(date) => setEditForm({ ...editForm, validUntil: date ? date.toISOString().split('T')[0] : '' })}
                                        placeholder="Select end date"
                                    />
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-black">
                                        Active
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Error and Success Messages */}
                        {Object.keys(formErrors).length > 0 && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                {Object.values(formErrors).map((err, i) => (
                                    <p key={i} className="text-red-600 text-sm">{err}</p>
                                ))}
                            </div>
                        )}
                        {submitSuccess && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-600 text-sm">Promo code updated successfully!</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 pt-4 lg:pt-6">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/promo-codes')}
                                className="px-4 py-2 bg-white text-black border border-gray-300 font-medium hover:bg-gray-100 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdatePromoCode}
                                disabled={saving}
                                className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-400"
                            >
                                {saving ? 'Updating...' : 'Update Promo Code'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPromoCodePage;