import { supabaseAdmin } from '../lib/supabase';
import type { ReturnRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type Return = ReturnRow;
export type ReturnStatus = Return['status'];

export type CreateReturnInput = {
    email: string;
    orderNumber: string;
};

// ─── Service ──────────────────────────────────────────────────

/**
 * Submit a new return request.
 */
export async function createReturn(input: CreateReturnInput): Promise<Return> {
    const { data, error } = await supabaseAdmin
        .from('returns')
        .insert({
            email: input.email.trim().toLowerCase(),
            order_number: input.orderNumber.trim().toUpperCase(),
            status: 'pending' as const,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create return request: ${error.message}`);
    return data;
}

/**
 * Get all return requests for admin.
 */
export async function getAllReturns(): Promise<Return[]> {
    const { data, error } = await supabaseAdmin
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch returns: ${error.message}`);
    return data;
}

/**
 * Get returns filtered by status.
 */
export async function getReturnsByStatus(status: ReturnStatus): Promise<Return[]> {
    const { data, error } = await supabaseAdmin
        .from('returns')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch returns: ${error.message}`);
    return data;
}

/**
 * Get all returns for a specific order number.
 */
export async function getReturnsByOrderNumber(orderNumber: string): Promise<Return[]> {
    const { data, error } = await supabaseAdmin
        .from('returns')
        .select('*')
        .eq('order_number', orderNumber.trim().toUpperCase());

    if (error) throw new Error(`Failed to fetch returns: ${error.message}`);
    return data;
}

/**
 * Update return status (admin action).
 */
export async function updateReturnStatus(
    id: string,
    status: ReturnStatus
): Promise<Return | null> {
    const { data, error } = await supabaseAdmin
        .from('returns')
        .update({ status })
        .eq('id', id)
        .select()
        .maybeSingle();

    if (error) throw new Error(`Failed to update return status: ${error.message}`);
    return data;
}

/**
 * Delete a return by UUID.
 */
export async function deleteReturn(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('returns')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete return: ${error.message}`);
    return true;
}