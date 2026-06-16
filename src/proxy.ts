import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Next.js 16 Proxy Middleware replacing the deprecated middleware convention.
 * The runtime defaults to nodejs. This intercepts and secures all matching routes.
 */
export async function proxy(request: NextRequest) {
  // Initialize the response so we can modify its headers/cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a server-side Supabase client for proxy context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Retrieve the authenticated user session.
  // getUser() is more secure than getSession() as it validates the session with the Supabase API.
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmailEnv = process.env.ADMIN_EMAIL || '';
  const adminEmails = adminEmailEnv.split(',').map(email => email.trim().toLowerCase());

  // Since matcher restricts execution to /admin/:path*, we perform the security checks here.
  if (!user) {
    // Unauthenticated user attempting to access admin route
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
    // Authenticated user is not an allowed administrator. Sign out immediately.
    await supabase.auth.signOut();
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// Config to secure every route under /admin
export const config = {
  matcher: ['/admin/:path*'],
};
