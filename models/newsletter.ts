import { supabaseAdmin } from '../lib/supabase';
import type { NewsletterRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type Newsletter = NewsletterRow;

// ─── Service ──────────────────────────────────────────────────

/**
 * Subscribe an email address.
 * If already subscribed but inactive, reactivates it.
 * If already active, returns the existing row without error.
 */
export async function subscribe(email: string): Promise<Newsletter> {
    const normalised = email.trim().toLowerCase();

    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .upsert(
            {
                email: normalised,
                is_active: true,
                subscribed_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
        )
        .select()
        .single();

    if (error) throw new Error(`Failed to subscribe: ${error.message}`);
    return data;
}

/**
 * Unsubscribe an email (soft delete — keeps the row, sets is_active = false).
 * Returns null if email not found.
 */
export async function unsubscribe(email: string): Promise<Newsletter | null> {
    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .update({ is_active: false })
        .eq('email', email.trim().toLowerCase())
        .select()
        .maybeSingle();

    if (error) throw new Error(`Failed to unsubscribe: ${error.message}`);
    return data;
}

/**
 * Get all active subscribers.
 * Used for sending broadcast emails.
 */
export async function getActiveSubscribers(): Promise<Newsletter[]> {
    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
    return data;
}

/**
 * Get all subscribers (admin view — includes inactive).
 */
export async function getAllSubscribers(): Promise<Newsletter[]> {
    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
    return data;
}

/**
 * Check if an email is currently subscribed.
 */
export async function isSubscribed(email: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from('newsletters')
        .select('id, is_active')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

    if (error) throw new Error(`Failed to check subscription: ${error.message}`);
    return data?.is_active === true;
}