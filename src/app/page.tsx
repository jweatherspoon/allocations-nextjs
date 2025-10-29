import { redirect } from 'next/navigation';
import { verifySession } from '@/app/lib/auth/session';

export default async function Home() {
  const session = await verifySession();
  redirect(session ? '/funds/' : '/login/');
}