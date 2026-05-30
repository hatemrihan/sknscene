"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

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
    const router = useRouter();
    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            // Adjusted scroll offset for headers
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            router.replace(`#${id}`, { scroll: false });
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

export default function AddProductPage() {
    const router = useRouter();
    const [savingProduct, setSavingProduct] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    type NewProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

    const [product, setProduct] = useState<NewProduct>(() => ({
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
        show_preorder_badge: false,
        show_out_of_stock_badge: false
    }));


    const updateField = useCallback(<K extends keyof NewProduct>(
        key: K,
        value: NewProduct[K]
    ) => {
        setProduct(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleAddProduct = async () => {
        const errors: Record<string, string> = {};
        if (!product.name.trim()) errors.name = 'Product name is required';
        if (!product.main_image) errors.mainImage = 'Please upload a main image';
        if (!product.price || product.price <= 0) errors.price = 'Price is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        setSavingProduct(true);

        try {
            const payload = {
                ...product,
            };

            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                router.push(`/admin/products`);
                router.refresh();
            } else {
                const error = await response.json();
                setFormErrors(prev => ({ ...prev, submit: `Failed to add product: ${error.error || 'Unknown error'}` }));
            }
        } catch (error) {
            console.error('Error adding product:', error);
            setFormErrors(prev => ({ ...prev, submit: 'Failed to add product. Please try again.' }));
        } finally {
            setSavingProduct(false);
        }
    };

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
                        <h1 className="text-lg font-bold text-white tracking-tight">Add New Product</h1>
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
                                    onMainImageChange={url => updateField('main_image', url)}
                                    onImagesChange={imgs => updateField('images', imgs)}
                                    onVideosChange={vids => updateField('videos', vids)}
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
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="Enter product name"
                                    />
                                    {formErrors.name && <p className="text-red-400 text-xs mt-1.5">{formErrors.name}</p>}
                                </div>

                                <div>
                                    <InputLabel>Product Description *</InputLabel>
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => updateField('description', e.target.value)}
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
                                            onChange={cats => updateField('categories', cats)}
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
                                        onChange={(e) => updateField('is_active', e.target.checked)}
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
                                        onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="10000"
                                        min="0"
                                    />
                                    {formErrors.price && <p className="text-red-400 text-xs mt-1.5">{formErrors.price}</p>}
                                </div>
                                <div>
                                    <InputLabel>Original Price (optional, for strikethrough)</InputLabel>
                                    <input
                                        type="number"
                                        value={product.original_price || ''}
                                        onChange={(e) => updateField('original_price', parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        placeholder="12000"
                                        min="0"
                                    />
                                    <p className="text-[11px] text-stone-500 mt-1">Set higher than price to show a strikethrough discount</p>
                                </div>
                                <div>
                                    <InputLabel>Initial Stock</InputLabel>
                                    <input
                                        type="number"
                                        value={product.stock || 0}
                                        onChange={(e) => updateField('stock', parseFloat(e.target.value) || 0)}
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
                                optionGroups={product.option_groups}
                                variants={product.variants}
                                onOptionGroupsChange={groups => updateField('option_groups', groups)}
                                onVariantsChange={newVariants => {
                                    updateField('variants', newVariants);
                                    // Auto-sync total stock from variant stocks
                                    if (newVariants.length > 0) {
                                        const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
                                        updateField('stock', totalStock);
                                    }
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
                                        onChange={(e) => updateField('detailed_description', e.target.value)}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        rows={4}
                                        placeholder="Enter detailed product description..."
                                    />
                                </div>

                                <div>
                                    <InputLabel>Shipping Information</InputLabel>
                                    <textarea
                                        value={product.shipping_info || ''}
                                        onChange={(e) => updateField('shipping_info', e.target.value)}
                                        className="w-full p-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                                        rows={3}
                                        placeholder="Enter shipping information..."
                                    />
                                </div>

                                <div>
                                    <div className="pt-2">
                                        <FaqManager
                                            faqs={product.faqs || []}
                                            onChange={faqs => updateField('faqs', faqs)}
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
                            onClick={handleAddProduct}
                            disabled={savingProduct}
                            className="bg-white hover:bg-stone-200 text-stone-900 px-8 py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {savingProduct ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : 'Publish Product'}
                        </button>
                    </div>

                </main>

            </div>
        </div>
    );
}