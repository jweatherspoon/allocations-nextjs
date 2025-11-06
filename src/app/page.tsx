import { auth0 } from '../lib/auth/auth0';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth0.getSession();
  redirect(session ? '/funds' : '/auth/login');

  return null;
}
