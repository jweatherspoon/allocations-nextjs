import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({});

export async function getUserId(): Promise<string> {
  const session = await auth0.getSession();
  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  if (!session.user.sub) {
    throw new Error('User ID not found in session');
  }

  return session.user.sub;
}
