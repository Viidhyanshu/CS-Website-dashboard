import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a client-side Supabase client for use in browser environments.
 * This client is safe to use in Client Components ('use client').
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
