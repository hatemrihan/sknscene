"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/models/product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ─── Types ────────────────────────────────────────────────────

type Faq = NonNullable<Product["faqs"]>[number];

interface FaqManagerProps {
    faqs: Faq[];
    onChange: (faqs: Faq[]) => void;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Manages the FAQ list for a product form.
 *
 * Uses shadcn Input, Button, Card, Label, and Separator.
 * Styled for the admin dark (stone-900) theme.
 */
export const FaqManager: React.FC<FaqManagerProps> = ({ faqs, onChange }) => {
    const updateFaq = (index: number, patch: Partial<Faq>) => {
        const next = [...faqs];
        next[index] = { ...next[index], ...patch };
        onChange(next);
    };

    const removeFaq = (index: number) => {
        onChange(faqs.filter((_, i) => i !== index));
    };

    const addFaq = () => {
        onChange([
            ...faqs,
            {
                clientId: crypto.randomUUID(),
                question: "",
                answer: "",
            },
        ]);
    };

    return (
        <div className="space-y-4">
            <Label className="text-white text-sm font-medium">
                Frequently Asked Questions
            </Label>

            {faqs.length === 0 && (
                <p className="text-sm text-stone-500 py-2">
                    No FAQs added yet. Add one below to help customers.
                </p>
            )}

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <Card
                        key={faq.clientId || index}
                        className="bg-stone-800 border-stone-700 p-4"
                    >
                        <div className="space-y-3">
                            {/* Question */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-stone-400">
                                    Question
                                </Label>
                                <Input
                                    value={faq.question}
                                    onChange={(e) =>
                                        updateFaq(index, {
                                            question: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. What is the shelf life?"
                                    className="bg-stone-900 border-stone-600 text-white placeholder:text-stone-500 focus-visible:ring-stone-500"
                                />
                            </div>

                            {/* Answer */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-stone-400">
                                    Answer
                                </Label>
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) =>
                                        updateFaq(index, {
                                            answer: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    placeholder="Provide a clear, helpful answer…"
                                    className="flex w-full rounded-md border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                />
                            </div>

                            <Separator className="bg-stone-700" />

                            {/* Remove button */}
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFaq(index)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-8"
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add FAQ button */}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaq}
                className="border-stone-900 text-stone-900 hover:bg-stone-800 hover:text-white"
            >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add FAQ
            </Button>
        </div>
    );
};

