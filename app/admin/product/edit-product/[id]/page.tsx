"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import type { Product } from '@/models/product';

import { CategorySelector } from '@/app/admin/_components/CategorySelector';
import { MediaManager } from '@/app/admin/_components/MediaManager';
import { FaqManager } from '@/app/admin/_components/FaqManager';
import { VariantManager } from '@/app/admin/_components/VariantManager';

const STEPS = [
    { id: 'media', num: '01', title: 'Product Media' },
    { id: 'general', num: '02', title: 'General Info' },
    { id: 'pricing', num: '03', title: 'Pricing & Status' },
    { id: 'variants', num: '04', title: 'Options & Variants' },
    { id: 'additional', num: '05', title: 'Additional Details' }
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

const DEFAULT_PRODUCT: Product = {
    id: '',
    slug: '',
    detailed_description: '',
    name: '',
    price: 0,
    original_price: 0,
    discount: 0,
    main_image: '',
    images: [],
    videos: [],
    description: '',
    promo_code: '',
    variants: [],
    option_groups: [],
    stock: 0,
    is_active: true,
    is_featured: false,
    order: 0,
    sizes: '',
    size_guide: '',
    shipping_info: '',
    faqs: [],
    categories: [],
    city_pricing: [],
    show_out_of_stock_badge: false,
    show_preorder_badge: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState<boolean>(true);
    const [savingProduct, setSavingProduct] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [product, setProduct] = useState<Product>(DEFAULT_PRODUCT);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/admin/products/${productId}`);

                if (response.ok) {
                    const data = await response.json();
                    setProduct({ ...DEFAULT_PRODUCT, ...data.product });
                } else {
                    setFormErrors({ submit: 'Failed to load product. The product may have been deleted.' });
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                setFormErrors({ submit: 'Failed to connect to the server. Please check your internet.' });
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleUpdateProduct = async () => {
        const errors: Record<string, string> = {};
        if (!product.name?.trim()) errors.name = 'Product name is required';
        if (!product.main_image) errors.mainImage = 'Please upload a main image';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setSavingProduct(true);

        try {
            const payload = {
                name: product.name,
                slug: product.slug,
                price: product.price || 0,
                originalPrice: product.original_price,
                discount: product.discount,
                mainImage: product.main_image,
                images: product.images,
                videos: product.videos,
                description: product.description,
                promoCode: product.promo_code,
                variants: product.variants,
                optionGroups: product.option_groups,
                stock: product.stock,
                isActive: product.is_active,
                isFeatured: product.is_featured,
                order: product.order,
                detailedDescription: product.detailed_description,
                shippingInfo: product.shipping_info,
                sizes: '',
                sizeGuide: '',
                faqs: product.faqs,
                categories: product.categories,
                showOutOfStockBadge: product.show_out_of_stock_badge,
                showPreorderBadge: product.show_preorder_badge
            };

            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await response.json();
                router.push('/admin/products?refresh=true');
                router.refresh();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown response format' }));
                console.error('Update failed:', errorData);
                setFormErrors(prev => ({ ...prev, submit: `Failed to update product: ${errorData.error || errorData.details || 'Unknown error'}` }));
            }
        } catch (error) {
            console.error('Error updating product:', error);
            setFormErrors(prev => ({ ...prev, submit: 'Error updating product: ' + (error as Error).message }));
        } finally {
            setSavingProduct(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-stone-900 min-h-screen justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-500"></div>
            </div>
        );
    }

    return (
        <div dir="ltr" className="bg-stone-900 text-stone-100 min-h-screen">
            {/* Header Area */}
            <div className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-md text-stone-100 sticky top-0 lg:top-0 z-30 pt-16 lg:pt-4">
                <div className="px-6 pb-4 flex flex-col gap-1.5">
                    <button
                        onClick={() => router.back()}
                        className="text-stone-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-medium w-fit"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
                    </button>

                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">Edit Product</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">Catalog Management</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-12 flex items-start gap-8">
                <LeftStepper />

                <main className="w-full max-w-3xl shrink min-w-0 space-y-12 pb-32 z-10">

                    <div id="media" className="scroll-mt-32">
                        <Section title="01. Product Media">
                            <p className="text-[13px] text-stone-400 mb-6 font-medium">Main Image & Gallery</p>
                            <div className="pt-2">
                                <MediaManager
                                    mainImage={product.main_image}
                                    images={product.images || []}
                                    videos={product.videos || []}
                                    onMainImageChange={url => setProduct(prev => ({ ...prev, main_image: url }))}
                                    onImagesChange={imgs => setProduct(prev => ({ ...prev, images: imgs }))}
                                    onVideosChange={vids => setProduct(prev => ({ ...prev, videos: vids }))}
                                    onUploadError={msg => setFormErrors(prev => ({ ...prev, mainImage: msg }))}
                                    error={formErrors.mainImage}
                                />
                            </div>
                        </Section>
                    </div>

                    <div id="general" className="scroll-mt-32">
                        <Section title="02. General Information">
                            <div className="space-y-5">
                                <div>
                                    <InputLabel>Product Name *</InputLabel>
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="Enter product name"
                                    />
                                    {formErrors.name && <p className="text-red-400 text-xs mt-1.5">{formErrors.name}</p>}
                                </div>

                                <div>
                                    <InputLabel>Product Description *</InputLabel>
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="Enter product description"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <InputLabel>Product Categories</InputLabel>
                                    <div className="pt-2">
                                        <CategorySelector
                                            selected={product.categories || []}
                                            onChange={cats => setProduct(prev => ({ ...prev, categories: cats }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>

                    <div id="pricing" className="scroll-mt-32">
                        <Section title="03. Pricing & Status">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-1">Product Status</h4>
                                    <p className="text-xs text-stone-400">
                                        {product.is_active ? 'Product will be visible in the store.' : 'Product will be hidden from the store.'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={product.is_active}
                                        onChange={(e) => setProduct(prev => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-stone-900"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="text-sm font-medium text-white mb-1">Featured Product</h4>
                                    <p className="text-xs text-stone-400">
                                        {product.is_featured ? 'Product will be shown in featured lists.' : 'Standard catalog sorting.'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={product.is_featured}
                                        onChange={(e) => setProduct(prev => ({ ...prev, is_featured: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-stone-900"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <InputLabel>Price (USD) *</InputLabel>
                                    <input
                                        type="number"
                                        value={product.price || ''}
                                        onChange={(e) => setProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="10000"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <InputLabel>Original Price (optional, for strikethrough)</InputLabel>
                                    <input
                                        type="number"
                                        value={product.original_price || ''}
                                        onChange={(e) => setProduct(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="12000"
                                        min="0"
                                    />
                                    <p className="text-[11px] text-stone-500 mt-1">Set higher than price to show a strikethrough discount</p>
                                </div>
                                <div>
                                    <InputLabel>Current Stock</InputLabel>
                                    <input
                                        type="number"
                                        value={product.stock || 0}
                                        onChange={(e) => setProduct(prev => ({ ...prev, stock: parseFloat(e.target.value) || 0 }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="Enter inventory amount"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </Section>
                    </div>

                    <div id="variants" className="scroll-mt-32">
                        <Section title="04. Options & Variants">
                            <VariantManager
                                optionGroups={product.option_groups || []}
                                variants={product.variants || []}
                                onOptionGroupsChange={groups => setProduct(prev => ({ ...prev, option_groups: groups }))}
                                onVariantsChange={newVariants => {
                                    setProduct(prev => ({
                                        ...prev,
                                        variants: newVariants,
                                        // Auto-sync total stock from variant stocks
                                        stock: newVariants.length > 0
                                            ? newVariants.reduce((sum, v) => sum + v.stock, 0)
                                            : prev.stock,
                                    }));
                                }}
                            />
                        </Section>
                    </div>

                    <div id="additional" className="scroll-mt-32">
                        <Section title="05. Additional Details">
                            <div className="space-y-6">
                                <div>
                                    <InputLabel>Detailed Description</InputLabel>
                                    <textarea
                                        value={product.detailed_description || ''}
                                        onChange={(e) => setProduct(prev => ({ ...prev, detailed_description: e.target.value }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        rows={4}
                                        placeholder="Enter detailed product description..."
                                    />
                                </div>

                                <div>
                                    <InputLabel>Shipping Information</InputLabel>
                                    <textarea
                                        value={product.shipping_info || ''}
                                        onChange={(e) => setProduct(prev => ({ ...prev, shipping_info: e.target.value }))}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        rows={3}
                                        placeholder="Enter shipping information..."
                                    />
                                </div>

                                <div>
                                    <InputLabel>Frequently Asked Questions</InputLabel>
                                    <div className="pt-2">
                                        <FaqManager
                                            faqs={product.faqs || []}
                                            onChange={faqs => setProduct(prev => ({ ...prev, faqs }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {formErrors.submit && (
                        <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-sm text-center font-medium">{formErrors.submit}</p>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-stone-800 flex justify-end">
                        <button
                            onClick={handleUpdateProduct}
                            disabled={savingProduct}
                            className="bg-white hover:bg-stone-200 text-stone-900 px-8 py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {savingProduct ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-900" />
                                    Saving...
                                </>
                            ) : 'Update Product'}
                        </button>
                    </div>

                </main>

            </div>
        </div>
    );
}
