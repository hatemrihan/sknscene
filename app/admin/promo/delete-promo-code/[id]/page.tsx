'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

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

const DeletePromoCodePage = () => {
    const router = useRouter();
    const params = useParams();
    const promoCodeId = params.id as string;

    const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Fetch promo code details
    useEffect(() => {
        const fetchPromoCode = async () => {
            try {
                const response = await fetch(`/api/admin/promo/${promoCodeId}`);

                if (response.ok) {
                    const data = await response.json();
                    setPromoCode(data.promo || data);
                } else {
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

    const handleDeletePromoCode = async () => {
        if (confirmationText !== promoCode?.code) {
            setDeleteError('Please type the promo code name exactly to confirm deletion');
            return;
        }

        try {
            setDeleting(true);
            setDeleteError(null);

            const response = await fetch(`/api/admin/promo/${promoCodeId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/admin/analytics');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Delete error details:', errorData);
                setDeleteError('Failed to delete promo code');
            }
        } catch (error) {
            console.error('Error deleting promo code:', error);
            setDeleteError('Error deleting promo code');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-500"></div>
                    <span className="text-lg text-stone-400">Loading promo code details...</span>
                </div>
            </div>
        );
    }

    if (error || !promoCode) {
        return (
            <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Promo Code Not Found</h1>
                    <p className="text-stone-400 mb-6">{error || 'The requested promo code could not be found.'}</p>
                    <button
                        onClick={() => router.push('/admin/analytics')}
                        className="bg-white hover:bg-stone-200 text-stone-900 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-900 text-stone-100 p-2 md:p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors duration-300"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Warning Card */}
                    <div className="bg-stone-850 border border-stone-800 rounded-xl p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="text-red-500 text-2xl sm:text-3xl">⚠️</div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                                    Danger Zone
                                </h2>
                                <p className="text-stone-400 text-sm sm:text-base">
                                    This action cannot be undone. The promo code will be permanently removed from the database.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Promo Code Details */}
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Promo Code Details</h3>

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-stone-400">Code:</span>
                                <p className="font-bold text-white text-lg">{promoCode.code}</p>
                            </div>

                            <div>
                                <span className="text-sm text-stone-400">Discount:</span>
                                <p className="text-white font-medium">
                                    {promoCode.discountType === 'percentage'
                                        ? `${promoCode.discountValue}% OFF`
                                        : `${promoCode.discountValue} USD OFF`}
                                </p>
                            </div>

                            {promoCode.description && (
                                <div>
                                    <span className="text-sm text-stone-400">Description:</span>
                                    <p className="text-stone-300 font-medium">{promoCode.description}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {promoCode.isActive ? (
                                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-stone-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="text-sm text-stone-300 font-medium">
                                        Status: {promoCode.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-stone-400">Usage:</span>
                                <p className="text-white font-medium">
                                    {promoCode.usedCount}/{promoCode.usageLimit || '∞'} times used
                                </p>
                            </div>

                            {promoCode.expiresAt && (
                                <div>
                                    <span className="text-sm text-stone-400">Expires:</span>
                                    <p className="text-white font-medium">
                                        {new Date(promoCode.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Confirmation Section */}
                    <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                            Confirm Deletion
                        </h3>

                        <div className="bg-stone-850 border border-stone-800 rounded-lg p-4 mb-5">
                            <p className="text-stone-300 text-sm sm:text-base mb-3 font-medium">
                                To confirm deletion, please type the promo code name exactly:
                            </p>
                            <p className="font-mono font-bold text-white bg-stone-900 px-3 py-1.5 border border-stone-700 rounded-md inline-block">
                                {promoCode.code}
                            </p>
                        </div>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-xl">
                                <p className="text-red-400 text-sm font-medium">{deleteError}</p>
                            </div>
                        )}

                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type the promo code name here"
                            className="w-full p-3.5 mb-6 bg-stone-850 border border-stone-850 rounded-xl text-white placeholder:text-stone-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all duration-200 text-sm sm:text-base font-medium"
                        />

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-stone-800/50">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 bg-stone-800 text-white border border-stone-700 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium hover:bg-stone-700 transition-all duration-200 text-sm sm:text-base"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeletePromoCode}
                                disabled={deleting || confirmationText !== promoCode.code}
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold tracking-wide hover:bg-red-500 disabled:bg-stone-850 disabled:text-stone-600 border border-transparent disabled:border-stone-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:shadow-none"
                            >
                                {deleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Delete Promo Code Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeletePromoCodePage;