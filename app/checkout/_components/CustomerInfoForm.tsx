'use client';

import type { CustomerInfo } from '../page';
import { EGYPT_GOVERNORATES, getCitiesForGovernorate } from '@/lib/data/egypt-governates';
import { LocationDetector } from './LocationDetector';

type Props = {
    customer: CustomerInfo;
    onChange: (c: CustomerInfo) => void;
    errors: Record<string, string>;
    onLocationDetected: (governorate: string, city: string, lat?: number, lng?: number) => void;
};

// ── Zara-style underline input ───────────────────────────────

function ZaraInput({
    label,
    optional,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    dir,
}: {
    label: string;
    optional?: boolean;
    value: string;
    onChange: (val: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
    dir?: string;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5 text-left">
                {label}
                {optional && <span className="text-neutral-300 ml-2 normal-case tracking-normal text-[10px]">(Optional)</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                dir={dir}
                className={`w-full pb-2.5 pt-1 border-b bg-transparent text-neutral-900 text-sm font-light outline-none transition-colors placeholder:text-neutral-300 ${error ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900'
                    } text-left`}
            />
            {error && <p className="text-red-500 text-xs mt-1.5 text-left">{error}</p>}
        </div>
    );
}

function ZaraSelect({
    label,
    value,
    onChange,
    options,
    error,
    placeholder = '--',
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    error?: string;
    placeholder?: string;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5 text-left">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    dir="ltr"
                    className={`w-full pb-2.5 pt-1 border-b bg-transparent text-neutral-900 text-sm font-light outline-none appearance-none cursor-pointer transition-colors ${error ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900'
                        } ${!value ? 'text-neutral-400' : ''} text-left pr-6`}
                >
                    <option value="">{placeholder}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {error && <p className="text-red-500 text-xs mt-1.5 text-left">{error}</p>}
        </div>
    );
}

// ── Component ────────────────────────────────────────────────

export function CustomerInfoForm({ customer, onChange, errors, onLocationDetected }: Props) {
    const update = (field: keyof CustomerInfo, value: string) => {
        const updated = { ...customer, [field]: value };
        // Reset city when governorate changes
        if (field === 'governorate') updated.city = '';
        onChange(updated);
    };

    const cities = customer.governorate
        ? getCitiesForGovernorate(customer.governorate)
        : [];

    return (
        <div>
            <div className="space-y-7">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <ZaraInput
                        label="First Name"
                        value={customer.firstName}
                        onChange={(v) => update('firstName', v)}
                        error={errors.firstName}
                    />
                    <ZaraInput
                        label="Last Name"
                        value={customer.lastName}
                        onChange={(v) => update('lastName', v)}
                        error={errors.lastName}
                    />
                </div>

                {/* Address row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <ZaraInput
                        label="Address"
                        value={customer.address}
                        onChange={(v) => update('address', v)}
                        error={errors.address}
                    />
                    <ZaraInput
                        label="More Info"
                        optional
                        value={customer.moreInfo}
                        onChange={(v) => update('moreInfo', v)}
                    />
                </div>

                {/* Delivery Section Header */}
                <div className="flex items-center justify-between pt-8 pb-2 flex-row">
                    <h2 className="text-[13px] font-medium tracking-widest text-neutral-900 uppercase">
                        Delivery Details
                    </h2>
                    <LocationDetector onLocationDetected={onLocationDetected} customer={customer} />
                </div>

                {/* Governorate + City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <ZaraSelect
                        label="Governorate"
                        value={customer.governorate}
                        onChange={(v) => update('governorate', v)}
                        options={EGYPT_GOVERNORATES.map(g => ({
                            value: g.name,
                            label: g.nameEn || g.name,
                        }))}
                        error={errors.governorate}
                    />
                    <ZaraSelect
                        label="City"
                        value={customer.city}
                        onChange={(v) => update('city', v)}
                        options={cities.map(c => ({ value: c, label: c }))}
                        error={errors.city}
                        placeholder={customer.governorate ? '--' : "Select Governorate first"}
                    />
                </div>

                {/* Region (fixed) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5 text-left">
                            Country
                        </label>
                        <p className="pb-2.5 pt-1 border-b border-neutral-200 text-neutral-900 text-sm font-light text-left">
                            Lebanon
                        </p>
                    </div>
                </div>

                {/* Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <div className="flex flex-col">
                        <label className="text-[11px] font-medium tracking-widest text-neutral-500 uppercase mb-1.5 text-left">
                            Phone Number
                        </label>
                        <div className="flex items-end gap-3 flex-row" dir="ltr">
                            <span className="pb-2.5 pt-1 border-b border-neutral-200 text-neutral-900 text-sm font-light w-14 shrink-0 text-center" dir="ltr">
                                +961
                            </span>
                            <input
                                type="tel"
                                value={customer.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                dir="ltr"
                                placeholder="70xxxxxx"
                                className={`flex-1 pb-2.5 pt-1 border-b bg-transparent text-neutral-900 text-sm font-light outline-none transition-colors placeholder:text-neutral-300 ${errors.phone ? 'border-red-400' : 'border-neutral-300 focus:border-neutral-900'
                                    } text-left`}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1.5 text-left">{errors.phone}</p>}
                    </div>

                    <ZaraInput
                        label="Email"
                        optional
                        value={customer.email}
                        onChange={(v) => update('email', v)}
                        error={errors.email}
                        type="email"
                        dir="ltr"
                        placeholder="email@example.com"
                    />
                </div>
            </div>
        </div>
    );
}
