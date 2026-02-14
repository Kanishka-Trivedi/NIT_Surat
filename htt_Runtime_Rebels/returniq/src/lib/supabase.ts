import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Browser Client (uses anon key, safe for client-side) ────────────
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
    if (browserClient) return browserClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null; // fallback to mock data

    browserClient = createClient(url, anonKey);
    return browserClient;
}

// ─── Server Client (uses service role key, for API routes only) ──────
export function getSupabaseServer(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) return null; // fallback to mock data

    return createClient(url, serviceKey);
}

// ─── Check if Supabase is configured ────────────────────────────────
export function isSupabaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
