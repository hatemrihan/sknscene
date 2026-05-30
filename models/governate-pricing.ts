import { supabaseAdmin } from '../lib/supabase';
import type { GovernoratePricingRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type GovernoratePricing = {
    id: string;
    governorate: string;        // Arabic name
    shipping_cost: number;      // without COD
    cod_fee: number;            // additional fee for COD
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type CreateGovernoratePricingInput = {
    governorate: string;
    shippingCost: number;
    codFee: number;
    isActive?: boolean;
};

export type UpdateGovernoratePricingInput = {
    id: string;
    shippingCost?: number;
    codFee?: number;
    isActive?: boolean;
};

// ─── Service ──────────────────────────────────────────────────

/**
 * Fetch all governorate pricing entries.
 */
export async function getAllGovernoratePricing(): Promise<GovernoratePricing[]> {
    const { data, error } = await supabaseAdmin
        .from('governorate_pricing')
        .select('*')
        .order('governorate', { ascending: true });

    if (error) throw new Error(`Failed to fetch governorate pricing: ${error.message}`);
    return (data as GovernoratePricing[]) ?? [];
}

/**
 * Fetch pricing for a specific governorate by name.
 */
export async function getGovernorateByName(name: string): Promise<GovernoratePricing | null> {
    const { data, error } = await supabaseAdmin
        .from('governorate_pricing')
        .select('*')
        .eq('governorate', name)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch governorate: ${error.message}`);
    return data as GovernoratePricing | null;
}

/**
 * Upsert a governorate pricing entry.
 * If governorate exists, update it. Otherwise insert.
 */
export async function upsertGovernoratePricing(
    input: CreateGovernoratePricingInput
): Promise<GovernoratePricing> {
    const { data, error } = await supabaseAdmin
        .from('governorate_pricing')
        .upsert(
            {
                governorate: input.governorate,
                shipping_cost: input.shippingCost,
                cod_fee: input.codFee,
                is_active: input.isActive ?? true,
            },
            { onConflict: 'governorate' }
        )
        .select()
        .single();

    if (error) throw new Error(`Failed to upsert governorate pricing: ${error.message}`);
    return data as GovernoratePricing;
}

/**
 * Update a specific governorate pricing by ID.
 */
export async function updateGovernoratePricing(
    input: UpdateGovernoratePricingInput
): Promise<GovernoratePricing> {
    const updates: Partial<Omit<GovernoratePricingRow, 'id' | 'created_at' | 'updated_at'>> = {};

    if (input.shippingCost !== undefined) updates.shipping_cost = input.shippingCost;
    if (input.codFee !== undefined) updates.cod_fee = input.codFee;
    if (input.isActive !== undefined) updates.is_active = input.isActive;

    const { data, error } = await supabaseAdmin
        .from('governorate_pricing')
        .update(updates)
        .eq('id', input.id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update governorate pricing: ${error.message}`);
    return data as GovernoratePricing;
}

/**
 * Bulk upsert all 27 governorates.
 * Used by admin when initializing pricing.
 */
export async function bulkUpsertGovernoratePricing(
    entries: CreateGovernoratePricingInput[]
): Promise<GovernoratePricing[]> {
    const rows: Omit<GovernoratePricingRow, 'id' | 'created_at' | 'updated_at'>[] = entries.map(e => ({
        governorate: e.governorate,
        shipping_cost: e.shippingCost,
        cod_fee: e.codFee,
        is_active: e.isActive ?? true,
    }));

    const { data, error } = await supabaseAdmin
        .from('governorate_pricing')
        .upsert(rows, { onConflict: 'governorate' })
        .select();

    if (error) throw new Error(`Failed to bulk upsert governorate pricing: ${error.message}`);
    return (data as GovernoratePricing[]) ?? [];
}
