import { supabaseAdmin } from './supabase';
import { StoreSettingsRow } from './database.types';

let cachedSettings: StoreSettingsRow | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getStoreSettings(): Promise<StoreSettingsRow> {
    const now = Date.now();
    if (cachedSettings && (now - lastFetchTime < CACHE_TTL)) {
        return cachedSettings;
    }

    const { data, error } = await supabaseAdmin
        .from('store_settings')
        .select('*')
        .maybeSingle();

    if (error) {
        console.error('Error fetching store settings:', error);
    }

    // Return default settings if none found or error occurs
    if (!data) {
        const defaultSettings = {
            id: '',
            store_name: 'Sknscene',
            store_email: '',
            store_phone: '',
            social_instagram: '',
            social_tiktok: '',
            social_facebook: '',
            meta_title: 'Sknscene Store',
            meta_description: 'E-commerce store',
            announcement_bar: '',
            announcement_active: false,
            maintenance_mode: false,
            order_prefix: 'GR',
            low_stock_threshold: 5,
            auto_confirm_orders: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Cache defaults only if there was no error (table empty)
        if (!error) {
            cachedSettings = defaultSettings;
            lastFetchTime = now;
        }
        return defaultSettings;
    }

    cachedSettings = data as StoreSettingsRow;
    lastFetchTime = now;
    return cachedSettings;
}
