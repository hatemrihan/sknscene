'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FAQ = { question: string; answer: string };

type Props = {
    description?: string;
    detailedDescription?: string;
    shippingInfo?: string;
    faqs?: FAQ[];
};

type Tab = {
    id: string;
    label: string;
    content: React.ReactNode;
    hasContent: boolean;
};

/**
 * Expandable accordion tabs for product details.
 * Arabic labels, smooth framer-motion animations.
 */
export const ProductDetailsTabs = memo(function ProductDetailsTabs({ description, detailedDescription, shippingInfo, faqs }: Props) {
    const [activeTab, setActiveTab] = useState<string | null>(null);

    const tabs: Tab[] = [
        {
            id: 'details',
            label: 'Details',
            content: detailedDescription || '',
            hasContent: !!detailedDescription?.trim(),
        },
        {
            id: 'description',
            label: 'Description',
            content: description || '',
            hasContent: !!description?.trim(),
        },
        {
            id: 'shipping',
            label: 'Shipping & Delivery',
            content: shippingInfo || '',
            hasContent: !!shippingInfo?.trim(),
        },
        {
            id: 'faqs',
            label: 'FAQs',
            content: faqs && faqs.length > 0 ? (
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-stone-300 pb-4 last:border-b-0">
                            <h4 className="font-semibold text-stone-950 mb-2">{faq.question}</h4>
                            <p className="text-stone-600 text-sm leading-relaxed font-medium">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            ) : null,
            hasContent: !!(faqs && faqs.length > 0),
        },
    ];

    const toggleTab = (tabId: string) => {
        setActiveTab(activeTab === tabId ? null : tabId);
    };

    // Only show tabs that have content
    const visibleTabs = tabs.filter(t => t.hasContent);
    if (visibleTabs.length === 0) return null;

    return (
        <div className="space-y-0 pt-6 border-t border-stone-300">
            {visibleTabs.map((tab) => (
                <div key={tab.id}>
                    <button
                        onClick={() => toggleTab(tab.id)}
                        className="flex justify-between items-center w-full text-left py-4 border-b border-stone-300 hover:border-stone-950 transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:outline-none focus-visible:ring-offset-2 rounded px-2"
                    >
                        <span className="text-sm font-semibold text-stone-800 group-hover:text-[#E11D00] transition-colors">
                            {tab.label}
                        </span>
                        <motion.span
                            animate={{ rotate: activeTab === tab.id ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="text-lg text-stone-400 group-hover:text-stone-950 transition-colors"
                        >
                            {activeTab === tab.id ? '−' : '+'}
                        </motion.span>
                    </button>

                    <AnimatePresence>
                        {activeTab === tab.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.25,
                                    ease: 'easeInOut',
                                    opacity: { duration: 0.15 },
                                }}
                                className="overflow-hidden"
                            >
                                <div className="py-5 text-sm text-stone-750 font-medium leading-relaxed">
                                    {typeof tab.content === 'string' ? (
                                        <div className="whitespace-pre-line">{tab.content}</div>
                                    ) : (
                                        tab.content
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
});
