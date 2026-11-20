import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/api/auth/auth0.api';
import { getUserFunds } from '@/api/funds/funds.api';
import { AppShell } from '@/components/shell/app-shell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [funds, user, jar] = await Promise.all([
    getUserFunds(),
    getSessionUser(),
    cookies(),
  ]);

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <AppShell
      funds={funds}
      user={user}
      initialTheme={jar.get('pace-theme')?.value === 'light' ? 'light' : 'dark'}
      initialHideBalances={jar.get('pace-hide')?.value === '1'}
    >
      {children}
    </AppShell>
  );
}
