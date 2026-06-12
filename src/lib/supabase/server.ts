import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a server-side Supabase client.
 * Note: Since Next.js 16, cookies() is fully asynchronous and must be awaited.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware is handling session refresh.
          }
        },
      },
    }
  );
}

/**
 * Helper utility to get the authenticated user session on the server.
 */
export async function getSessionUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error: any) {
    // Rethrow Next.js dynamic server usage errors so the build engine knows to compile the page dynamically
    if (error && (error.message?.includes('Dynamic server usage') || error.digest === 'DYNAMIC_SERVER_USAGE')) {
      throw error;
    }
    console.error('Failed to retrieve session user:', error);
    return null;
  }
}
