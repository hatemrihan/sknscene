import { supabaseAdmin } from '../lib/supabase';
import type { CategoryRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type Category = CategoryRow;

export type CreateCategoryInput = {
    name: string;
    image_url?: string | null;
    visible?: boolean;
};

export type UpdateCategoryInput = {
    name?: string;
    image_url?: string | null;
    visible?: boolean;
};

// ─── Service ──────────────────────────────────────────────────

/**
 * Fetch all categories, ordered alphabetically.
 */
export async function getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    return data;
}

/**
 * Fetch only visible categories for the storefront.
 */
export async function getVisibleCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('visible', true)
        .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch visible categories: ${error.message}`);
    return data;
}

/**
 * Toggle visibility of a single category.
 */
export async function toggleCategoryVisibility(id: string, visible: boolean): Promise<Category> {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .update({ visible })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Failed to toggle category visibility: ${error.message}`);
    return data;
}

/**
 * Find a single category by name (case-insensitive).
 */
export async function getCategoryByName(name: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .ilike('name', name.trim())
        .maybeSingle();

    if (error) throw new Error(`Failed to fetch category: ${error.message}`);
    return data;
}

/**
 * Create a new category.
 * Throws with a clear message on duplicate name (Postgres error 23505).
 */
export async function createCategory(input: CreateCategoryInput): Promise<Category> {
    const row = {
        name: input.name.trim(),
        image_url: input.image_url ?? null,
        visible: input.visible ?? true,
    };

    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert(row)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error(`Category "${input.name}" already exists`);
        }
        throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
}

/**
 * Delete a category by ID.
 * Returns true if deleted, false if not found.
 */
export async function deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete category: ${error.message}`);
    return true;
}

/**
 * Update a category by ID.
 * Returns the updated category. Throws if not found or on duplicate name.
 */
export async function updateCategory(
    id: string,
    input: UpdateCategoryInput,
): Promise<Category> {
    const updates: Partial<Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'>> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.image_url !== undefined) updates.image_url = input.image_url;
    if (input.visible !== undefined) updates.visible = input.visible;

    if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update');
    }

    const { data, error } = await supabaseAdmin
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error(`Category "${input.name}" already exists`);
        }
        if (error.code === 'PGRST116') {
            throw new Error('Category not found');
        }
        throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
}