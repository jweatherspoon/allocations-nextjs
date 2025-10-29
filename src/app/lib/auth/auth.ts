'use server';

import { createSession } from '@/app/lib/auth/session';
import {
  USER_EMAIL_KEY,
  USER_PASSWORD_KEY,
} from '@/app/lib/models/auth/user-login.model';
import { cookies } from 'next/headers';

import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const email = formData.get(USER_EMAIL_KEY) as string;
  const password = formData.get(USER_PASSWORD_KEY) as string;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // TODO: Implement actual authentication logic
  await createSession(email);

  redirect('/'); // Redirect to home page after login
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');

  redirect('/login'); // Redirect to login page after logout
}
