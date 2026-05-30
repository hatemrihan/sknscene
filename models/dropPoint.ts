import { supabaseAdmin } from '../lib/supabase';
import type { DropPointRow } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────

export type DropPoint = {
    id: string;
    name: string;
    address: string;
    governorate: string;
    city: string;
    lat: number;
    lng: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type CreateDropPointInput = {
    name: string;
    address: string;
    governorate: string;
    city: string;
    lat: number;
    lng: number;
    isActive?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Haversine formula — distance between two lat/lng points in km.
 */
function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ─── Service ──────────────────────────────────────────────────

/**
 * Fetch all active drop points.
 */
export async function getActiveDropPoints(): Promise<DropPoint[]> {
    const { data, error } = await supabaseAdmin
        .from('drop_points')
        .select('*')
        .eq('is_active', true)
        .order('governorate', { ascending: true });

    if (error) throw new Error(`Failed to fetch drop points: ${error.message}`);
    return (data as DropPoint[]) ?? [];
}

/**
 * Fetch all drop points (including inactive) for admin.
 */
export async function getAllDropPoints(): Promise<DropPoint[]> {
    const { data, error } = await supabaseAdmin
        .from('drop_points')
        .select('*')
        .order('governorate', { ascending: true });

    if (error) throw new Error(`Failed to fetch drop points: ${error.message}`);
    return (data as DropPoint[]) ?? [];
}

/**
 * Fetch drop points near a lat/lng, sorted by distance.
 */
export async function getNearbyDropPoints(
    lat: number,
    lng: number,
    limit = 10,
): Promise<(DropPoint & { distance: number })[]> {
    const all = await getActiveDropPoints();

    const withDistance = all.map(dp => ({
        ...dp,
        distance: haversineDistance(lat, lng, dp.lat, dp.lng),
    }));

    withDistance.sort((a, b) => a.distance - b.distance);
    return withDistance.slice(0, limit);
}

/**
 * Create a new drop point.
 */
export async function createDropPoint(input: CreateDropPointInput): Promise<DropPoint> {
    const { data, error } = await supabaseAdmin
        .from('drop_points')
        .insert({
            name: input.name,
            address: input.address,
            governorate: input.governorate,
            city: input.city,
            lat: input.lat,
            lng: input.lng,
            is_active: input.isActive ?? true,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create drop point: ${error.message}`);
    return data as DropPoint;
}

/**
 * Update a drop point.
 */
export async function updateDropPoint(
    id: string,
    updates: Partial<CreateDropPointInput>,
): Promise<DropPoint> {
    const mapped: Partial<Omit<DropPointRow, 'id' | 'created_at' | 'updated_at'>> = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.address !== undefined) mapped.address = updates.address;
    if (updates.governorate !== undefined) mapped.governorate = updates.governorate;
    if (updates.city !== undefined) mapped.city = updates.city;
    if (updates.lat !== undefined) mapped.lat = updates.lat;
    if (updates.lng !== undefined) mapped.lng = updates.lng;
    if (updates.isActive !== undefined) mapped.is_active = updates.isActive;

    const { data, error } = await supabaseAdmin
        .from('drop_points')
        .update(mapped)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update drop point: ${error.message}`);
    return data as DropPoint;
}

/**
 * Delete a drop point.
 */
export async function deleteDropPoint(id: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from('drop_points')
        .delete()
        .eq('id', id);

    if (error) throw new Error(`Failed to delete drop point: ${error.message}`);
}
