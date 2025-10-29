import { auth0 } from '@/app/lib/auth/auth0';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  // const session = await auth0.getSession();
  // redirect(session ? '/funds' : '/auth/login');

  return (
    <Link href='/auth/login'>login</Link>
  )
}