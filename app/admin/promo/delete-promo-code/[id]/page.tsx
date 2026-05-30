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
                router.push('/admin/promo-codes');
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
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Warning Card */}
                    <div className="bg-gray-100 border-2 border-black p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="text-black text-2xl sm:text-3xl">⚠️</div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-black mb-2">
                                    Danger Zone
                                </h2>
                                <p className="text-gray-700 text-sm sm:text-base">
                                    This action cannot be undone. The promo code will be permanently removed from the database.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Promo Code Details */}
                    <div className="bg-white border-2 border-black p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-black mb-4">Promo Code Details</h3>

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-gray-600">Code:</span>
                                <p className="font-semibold text-black text-lg">{promoCode.code}</p>
                            </div>

                            <div>
                                <span className="text-sm text-gray-600">Discount:</span>
                                <p className="text-black">
                                    {promoCode.discountType === 'percentage'
                                        ? `${promoCode.discountValue}% OFF`
                                        : `${promoCode.discountValue} USD OFF`}
                                </p>
                            </div>

                            {promoCode.description && (
                                <div>
                                    <span className="text-sm text-gray-600">Description:</span>
                                    <p className="text-black">{promoCode.description}</p>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {promoCode.isActive ? (
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="text-sm text-black">
                                        Status: {promoCode.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-600">Usage:</span>
                                <p className="text-black">
                                    {promoCode.usedCount}/{promoCode.usageLimit || '∞'} times used
                                </p>
                            </div>

                            {promoCode.expiresAt && (
                                <div>
                                    <span className="text-sm text-gray-600">Expires:</span>
                                    <p className="text-black">
                                        {new Date(promoCode.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Confirmation Section */}
                    <div className="lg:col-span-2 bg-white border-2 border-black p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-black mb-4">
                            Confirm Deletion
                        </h3>

                        <div className="bg-gray-100 border-2 border-gray-400 p-4 mb-4">
                            <p className="text-gray-800 text-sm sm:text-base mb-3">
                                To confirm deletion, please type the promo code name exactly:
                            </p>
                            <p className="font-mono font-bold text-black bg-white px-2 py-1 border border-gray-300 inline-block">
                                {promoCode.code}
                            </p>
                        </div>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-600 text-sm">{deleteError}</p>
                            </div>
                        )}

                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type the promo code name here"
                            className="w-full p-3 mb-4 bg-white border-2 border-gray-300 text-black focus:border-black focus:outline-none text-sm sm:text-base"
                        />

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                onClick={() => router.push('/admin/promo-codes')}
                                className="flex-1 bg-white text-black border-2 border-black px-4 py-2 sm:px-6 sm:py-3 font-medium hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeletePromoCode}
                                disabled={deleting || confirmationText !== promoCode.code}
                                className="flex-1 bg-black text-white px-4 py-2 sm:px-6 sm:py-3 font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
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