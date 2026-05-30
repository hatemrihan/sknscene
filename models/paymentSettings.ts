import { supabaseAdmin, supabase } from '../lib/supabase';
import type { PaymentSettingsRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type PaymentSettings = PaymentSettingsRow;

export type UpdatePaymentSettingsInput = {
    codEnabled?: boolean;
    instaPayEnabled?: boolean;
};

// ─── Service ──────────────────────────────────────────────────

/**
 * Get the singleton payment settings row.
 * Uses public client — called at checkout to show available methods.
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
    const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

    if (error) throw new Error(`Failed to fetch payment settings: ${error.message}`);
    return data;
}

/**
 * Update payment method toggles.
 * Admin only — uses supabaseAdmin.
 */
export async function updatePaymentSettings(
    input: UpdatePaymentSettingsInput
): Promise<PaymentSettings> {
    const current = await getPaymentSettings();

    const { data, error } = await supabaseAdmin
        .from('payment_settings')
        .update({
            ...(input.codEnabled !== undefined && { cod_enabled: input.codEnabled }),
            ...(input.instaPayEnabled !== undefined && { insta_pay_enabled: input.instaPayEnabled }),
        })
        .eq('id', current.id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update payment settings: ${error.message}`);
    return data;
}