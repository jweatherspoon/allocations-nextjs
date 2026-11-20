import { Auth0Client } from '@auth0/nextjs-auth0/server';

import { DEMO_MODE } from '@/api/demo/demo-mode';
import { DEMO_USER, DEMO_USER_ID } from '@/api/demo/demo-store';
import type { AppUser } from '@/models/user/app-user.model';

export const auth0 = new Auth0Client({});

export async function getUserId(): Promise<string> {
  if (DEMO_MODE) return DEMO_USER_ID;

  const session = await auth0.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  if (!session.user.sub) {
    throw new Error('User ID not found in session');
  }

  return session.user.sub;
}

function initialsOf(name: string): string {
  const parts = name
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters =
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : (parts[0] ?? '').slice(0, 2);
  return letters.toUpperCase() || '?';
}

/** The signed-in user for display, or null when there is no session. */
export async function getSessionUser(): Promise<AppUser | null> {
  if (DEMO_MODE) return DEMO_USER;

  const session = await auth0.getSession();
  const user = session?.user;
  if (!user) return null;

  const email = user.email ?? '';
  const name = user.name ?? user.nickname ?? email ?? '';
  return { name, email, initials: initialsOf(name || email) };
}
