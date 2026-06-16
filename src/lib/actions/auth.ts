'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type AuthState = {
  error?: string;
  success?: boolean;
} | null;

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please fill out both email and password fields.' };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  if (
    email.trim().toLowerCase() !== adminEmail ||
    password !== adminPassword
  ) {
    return { error: 'Invalid email or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session', sessionToken!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/admin');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}


export type AuthState = {
  error?: string;
  success?: boolean;
} | null;

/**
 * Server Action to handle admin authentication.
 * Verifies credentials, checks against ADMIN_EMAIL, and redirects on success.
 */
export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please fill out both email and password fields.' };
  }

  let success = false;

  try {
    const supabase = await createClient();
    
    // Sign in using Supabase email/password auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    const user = data.user;
    const adminEmailEnv = process.env.ADMIN_EMAIL || '';
    const adminEmails = adminEmailEnv.split(',').map(email => email.trim().toLowerCase());

    // Multi-admin email verification
    if (!user || !user.email || !adminEmails.includes(user.email.toLowerCase())) {
      // Immediately sign out to clear session cookies
      await supabase.auth.signOut();
      return { error: 'Unauthorized account. Access is restricted.' };
    }

    success = true;
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred during login.' };
  }

  // Next.js redirect MUST be called outside the try/catch block to function correctly
  if (success) {
    redirect('/admin');
  }

  return null;
}

/**
 * Server Action to sign out the user and redirect to login page.
 */
export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Failed to log out:', err);
  }
  redirect('/login');
}
