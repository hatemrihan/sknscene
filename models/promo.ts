import { supabaseAdmin } from '../lib/supabase';
import type { PromoRow, DiscountType } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type Promo = PromoRow;

export type CreatePromoInput = {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrder?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    isActive?: boolean;
    expiresAt?: Date;
    description?: string;
};

export type PromoClaimResult = {
    promo: Promo;
    discountAmount: number;
};

// ─── Service ──────────────────────────────────────────────────

/**
 * Atomically validate and claim a promo code.
 * Calls the claim_promo Postgres function — validates all rules
 * and increments used_count in a single transaction.
 * This fully replaces the TOCTOU race condition in the original orders route.
 *
 * Returns the promo and the calculated discount amount.
 * Throws with a typed error code prefix (PROMO_INVALID, PROMO_EXPIRED, etc.)
 * so the API route can return a specific user-facing message.
 */
export async function claimPromo(
    code: string,
    subtotal: number
): Promise<PromoClaimResult> {
    const { data, error } = await supabaseAdmin.rpc('claim_promo', {
        p_code: code.toUpperCase().trim(),
        p_subtotal: subtotal,
    });

    if (error) throw new Error(error.message);

    const promo = data as Promo;

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
        discountAmount = (subtotal * promo.discount_value) / 100;
        if (promo.maximum_discount) {
            discountAmount = Math.min(discountAmount, promo.maximum_discount);
        }
    } else {
        discountAmount = promo.discount_value;
    }

    return { promo, discountAmount };
}

/**
 * Get all promos for admin management.
 */
export async function getAllPromos(): Promise<Promo[]> {
    const { data, error } = await supabaseAdmin
        .from('promos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch promos: ${error.message}`);
    return (data as Promo[]) ?? [];
}

/**
 * Get a single promo by code without claiming it.
 * Used for admin preview / validation UI.
 */
export async function getPromByCode(code: string): Promise<Promo | null> {
    const { data, error } = await supabaseAdmin
        .from('promos')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch promo: ${error.message}`);
    return data as Promo | null;
}

/**
 * Get a single promo by ID.
 */
export async function getPromoById(id: string): Promise<Promo | null> {
    const { data, error } = await supabaseAdmin
        .from('promos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch promo by ID: ${error.message}`);
    return data as Promo | null;
}

/**
 * Create a new promo code.
 * Throws on duplicate code (Postgres error 23505).
 */
export async function createPromo(input: CreatePromoInput): Promise<Promo> {
    const { data, error } = await supabaseAdmin
        .from('promos')
        .insert({
            code: input.code.toUpperCase().trim(),
            discount_type: input.discountType,
            discount_value: input.discountValue,
            minimum_order: input.minimumOrder ?? null,
            maximum_discount: input.maximumDiscount ?? null,
            usage_limit: input.usageLimit ?? null,
            is_active: input.isActive ?? true,
            expires_at: input.expiresAt?.toISOString() ?? null,
            description: input.description ?? null,
            used_count: 0,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error(`Promo code "${input.code}" already exists`);
        }
        throw new Error(`Failed to create promo: ${error.message}`);
    }

    return data as Promo;
}

/**
 * Toggle a promo active/inactive.
 */
export async function togglePromo(id: string, isActive: boolean): Promise<Promo | null> {
    const { data, error } = await supabaseAdmin
        .from('promos')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw new Error(`Failed to toggle promo: ${error.message}`);
    return data as Promo | null;
}

/**
 * Delete a promo by UUID.
 */
export async function deletePromo(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('promos')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete promo: ${error.message}`);
    return true;
}

/**
 * Update a promo code's data.
 */
export async function updatePromo(id: string, updates: Partial<PromoRow>): Promise<Promo | null> {
    // If updating code, ensure uppercase
    const safeUpdates = { ...updates };
    if (safeUpdates.code) {
        safeUpdates.code = safeUpdates.code.toUpperCase().trim();
    }

    // Prevent updating id or created_at
    delete safeUpdates.id;
    delete safeUpdates.created_at;

    // Build a properly typed update object
    const typedUpdates: Partial<Omit<PromoRow, 'id' | 'created_at' | 'updated_at'>> = {};
    if (safeUpdates.code !== undefined) typedUpdates.code = safeUpdates.code;
    if (safeUpdates.discount_type !== undefined) typedUpdates.discount_type = safeUpdates.discount_type;
    if (safeUpdates.discount_value !== undefined) typedUpdates.discount_value = safeUpdates.discount_value;
    if (safeUpdates.minimum_order !== undefined) typedUpdates.minimum_order = safeUpdates.minimum_order;
    if (safeUpdates.maximum_discount !== undefined) typedUpdates.maximum_discount = safeUpdates.maximum_discount;
    if (safeUpdates.usage_limit !== undefined) typedUpdates.usage_limit = safeUpdates.usage_limit;
    if (safeUpdates.used_count !== undefined) typedUpdates.used_count = safeUpdates.used_count;
    if (safeUpdates.is_active !== undefined) typedUpdates.is_active = safeUpdates.is_active;
    if (safeUpdates.expires_at !== undefined) typedUpdates.expires_at = safeUpdates.expires_at;
    if (safeUpdates.description !== undefined) typedUpdates.description = safeUpdates.description;

    const { data, error } = await supabaseAdmin
        .from('promos')
        .update(typedUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) {
        if (error.code === '23505') {
            throw new Error(`Promo code "${safeUpdates.code}" already exists`);
        }
        throw new Error(`Failed to update promo: ${error.message}`);
    }

    return data as Promo | null;
}