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
  const adminEmail1 = process.env.ADMIN_EMAIL1?.trim().toLowerCase();
  const adminPassword1 = process.env.ADMIN_PASSWORD1?.trim();
  const adminEmail2 = process.env.ADMIN_EMAIL2?.trim().toLowerCase();
  const adminPassword2 = process.env.ADMIN_PASSWORD2?.trim();
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  const validCredentials = [
    { email: adminEmail, password: adminPassword },
    { email: adminEmail1, password: adminPassword1 },
    { email: adminEmail2, password: adminPassword2 },
  ];

  const isValidLogin = validCredentials.some(
    cred => email.trim().toLowerCase() === cred.email && password === cred.password
  );

  if (!isValidLogin) {
    return { error: 'Invalid email or password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session', sessionToken!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/admin');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/login');
}
