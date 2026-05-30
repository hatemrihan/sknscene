"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { Product } from '@/models/product';
import { SideBarNav } from '@/app/admin/sections/SideBarNav';
import { MobileNav } from '@/app/admin/sections/MobileNav';

const DeleteProductPage = () => {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [confirmInput, setConfirmInput] = useState('');

    const isConfirmed = product ? confirmInput === product.name : false;

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/admin/products/${productId}`);

                if (response.ok) {
                    const data = await response.json();
                    setProduct(data.product);
                } else {
                    setErrorMessage('Failed to load product data');
                    router.back();
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setErrorMessage('Error loading product data');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, router]);

    // Function to delete product
    const handleDeleteProduct = async () => {
        if (!product || deleting) return;

        setDeleting(true);

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await response.json();
                router.push('/admin/products');
                router.refresh();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                setErrorMessage(`Failed to delete product: ${errorData.error || errorData.details || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            setErrorMessage('Error deleting product. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <>
                <div className="hidden lg:block"><SideBarNav /></div>
                <MobileNav />
                <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-stone-900 text-stone-100 p-2 md:p-4">
                    <div className="w-full">
                        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[350px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-stone-500 mx-auto mb-3 sm:mb-4"></div>
                                <p className="text-stone-400 text-sm sm:text-base">Loading product data...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <div className="hidden lg:block"><SideBarNav /></div>
                <MobileNav />
                <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-stone-900 text-stone-100 p-2 md:p-4">
                    <div className="w-full">
                        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                            <div className="text-center">
                                <p className="text-stone-400 text-sm sm:text-base mb-3 sm:mb-4">Product not found</p>
                                <button
                                    onClick={() => router.back()}
                                    className="bg-white text-stone-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-stone-200 transition-all duration-300 text-sm sm:text-base"
                                >
                                    ← Back to Products
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="hidden lg:block"><SideBarNav /></div>
            <MobileNav />
            <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-stone-900 text-stone-100 p-2 md:p-4">
                <div className="w-full max-w-4xl mx-auto py-8 lg:py-12">
                    {/* Header */}
                    <div className="mb-6 border-b border-stone-800 pb-6">
                        <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm sm:text-base"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Back to Products
                            </button>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight font-bold text-white mb-2 text-center">
                            Delete Product
                        </h1>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 sm:mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-sm text-center font-medium">{errorMessage}</p>
                        </div>
                    )}

                    {/* Warning Card */}
                    <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 sm:p-5 md:p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Warning: This action cannot be undone!</h2>
                                <p className="text-stone-400 text-sm sm:text-base">
                                    You are about to permanently delete this product. This will remove it from your store,
                                    customer orders, and all associated data. Please make sure you want to proceed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 sm:p-5 md:p-6 mb-8">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 pb-4 border-b border-stone-800">Product to be deleted:</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 pl-2">
                            {/* Product Image */}
                            <div className="flex justify-center md:justify-start">
                                <div className="w-full max-w-xs sm:max-w-sm rounded-xl overflow-hidden border border-stone-800">
                                    <div className="relative w-full aspect-square bg-stone-800">
                                        <Image
                                            src={product.main_image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Information */}
                            <div className="space-y-4">
                                <div className="mb-6">
                                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">{product.name}</h4>
                                    <p className="text-stone-400 text-sm sm:text-base leading-relaxed line-clamp-3">{product.description}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-stone-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-400 text-sm font-medium">Price</span>
                                        <span className="text-white font-bold text-sm tracking-wide">{product.price.toLocaleString()} USD</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-400 text-sm font-medium">Stock</span>
                                        <span className={`font-bold text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {product.stock} units {product.stock > 0 ? '✓' : '✗'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-400 text-sm font-medium">Status</span>
                                        <span className={`font-bold text-sm ${product.is_active ? 'text-green-400' : 'text-stone-500'}`}>
                                            {product.is_active ? 'Active ✓' : 'Inactive ✗'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-stone-400 text-sm font-medium">Featured</span>
                                        <span className={`font-bold text-sm ${product.is_featured ? 'text-yellow-400' : 'text-stone-500'}`}>
                                            {product.is_featured ? 'Yes ⭐' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Section */}
                    <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4 sm:p-5 md:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">Confirm Deletion</h3>

                        <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 sm:p-5 mb-5 sm:mb-6">
                            <p className="text-stone-300 text-sm sm:text-base mb-2">
                                Please type the product name to confirm deletion:
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-stone-400 text-sm">Target:</span>
                                <span className="font-mono bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-md text-white text-sm font-medium tracking-wide">
                                    {product.name}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6 sm:mb-8">
                            <input
                                type="text"
                                id="confirmInput"
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder={`Type "${product.name}"`}
                                className="w-full p-3 sm:p-4 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder:text-stone-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all duration-200 text-sm sm:text-base font-medium"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isConfirmed) {
                                        handleDeleteProduct();
                                    }
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-stone-800/50">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-stone-800 text-white border border-stone-700 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-stone-700 hover:text-white transition-all duration-200 text-sm sm:text-base"
                            >
                                Cancel
                            </button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        type="button"
                                        disabled={deleting || !isConfirmed}
                                        className="bg-red-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold tracking-wide hover:bg-red-500 disabled:bg-stone-800 disabled:text-stone-600 border border-transparent disabled:border-stone-700 transition-all duration-200 text-sm sm:text-base shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:shadow-none"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-stone-900 border-stone-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-stone-400">
                                            This action cannot be undone. This will permanently delete the product &quot;{product.name}&quot;
                                            and remove it from your store, customer orders, and all associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-stone-800 text-white border-stone-700 hover:bg-stone-700 hover:text-white">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 text-white hover:bg-red-500">
                                            Delete Product
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteProductPage;
