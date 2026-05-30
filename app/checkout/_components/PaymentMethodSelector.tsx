'use client';

import { useState, useRef } from 'react';
import type { PaymentChoice } from '../page';

type Props = {
    payment: PaymentChoice;
    onChange: (p: PaymentChoice) => void;
    codEnabled: boolean;
    codFee: number;
    error?: string;
};

export function PaymentMethodSelector({ payment, onChange, codEnabled, codFee, error }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currencySymbol = "USD";

    // ── Upload screenshot to Supabase Storage ─────────────
    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setUploadError("File size must be less than 5MB");
            return;
        }

        if (!file.type.startsWith('image/')) {
            setUploadError("Please upload an image only");
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/screenshot', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                onChange({ ...payment, screenshotUrl: data.url });
            } else {
                setUploadError(data.error || "Failed to upload image");
            }
        } catch {
            setUploadError("Error occurred while uploading image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <section>
            <h2 className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase mb-8 text-left">
                Payment Method
            </h2>

            <div className="space-y-4">
                {/* ── Cash on Delivery (Sole Option) ─────────────────── */}
                <div
                    className="w-full text-left border border-neutral-900 border-2 p-5 bg-neutral-50/50"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-4 shrink-0 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-neutral-900" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-neutral-900 mb-0.5">Cash on Delivery (COD)</p>
                            <p className="text-xs text-neutral-500">
                                {codFee > 0
                                    ? `Additional fee ${codFee.toLocaleString('en-US')} ${currencySymbol}`
                                    : "No additional fees"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
