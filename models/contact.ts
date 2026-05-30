import { supabaseAdmin } from '../lib/supabase';
import type { ContactRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type Contact = ContactRow;
export type ContactStatus = Contact['status'];

export type CreateContactInput = {
    name: string;
    email: string;
    message?: string;
};

export type UpdateContactStatusInput = {
    id: string;
    status: ContactStatus;
};

// ─── Service ──────────────────────────────────────────────────

/**
 * Fetch all contacts, newest first.
 * Used by the admin inbox.
 */
export async function getAllContacts(): Promise<Contact[]> {
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch contacts: ${error.message}`);
    return data;
}

/**
 * Fetch contacts filtered by status.
 */
export async function getContactsByStatus(status: ContactStatus): Promise<Contact[]> {
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch contacts: ${error.message}`);
    return data;
}

/**
 * Fetch a single contact by ID.
 */
export async function getContactById(id: string): Promise<Contact | null> {
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch contact: ${error.message}`);
    return data;
}

/**
 * Create a new contact submission.
 */
export async function createContact(input: CreateContactInput): Promise<Contact> {
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .insert({
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            message: input.message?.trim() ?? null,
            status: 'pending' as const,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create contact: ${error.message}`);
    return data;
}

/**
 * Update the status of a contact.
 * Returns null if contact not found.
 */
export async function updateContactStatus(
    input: UpdateContactStatusInput
): Promise<Contact | null> {
    const { data, error } = await supabaseAdmin
        .from('contacts')
        .update({ status: input.status })
        .eq('id', input.id)
        .select()
        .maybeSingle();

    if (error) throw new Error(`Failed to update contact status: ${error.message}`);
    return data;
}

/**
 * Delete a contact by ID.
 * Returns true if deleted, false if not found.
 */
export async function deleteContact(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('contacts')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete contact: ${error.message}`);
    return true;
}