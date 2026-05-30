import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) are required.'
    );
}

if (typeof window === 'undefined' && !supabaseServiceKey) {
    console.warn(
        '[supabase] SUPABASE_SERVICE_ROLE_KEY is missing — server-side admin operations will fail. Add it to .env.local'
    );
}

/**
 * Public client — for client-side usage.
 * Respects Row Level Security (RLS) policies.
 * Safe to use in browser context.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

/**
 * Admin client — for server-side API routes only.
 * Uses the service role key which BYPASSES RLS.
 * NEVER expose this to the client/browser.
 */
export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey || 'DUMMY_KEY_TO_PREVENT_CRASH_ON_CLIENT',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);