import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/api/auth/auth0.api';
import { getUserFunds } from '@/api/funds/funds.api';
import { AppShell } from '@/components/shell/app-shell';
import { currentTime } from '@/lib/pace/format';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sampled once on the server; the client reuses it so both renders agree.
  const now = currentTime();
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
      now={now}
      user={user}
      initialTheme={jar.get('pace-theme')?.value === 'light' ? 'light' : 'dark'}
      initialHideBalances={jar.get('pace-hide')?.value === '1'}
    >
      {children}
    </AppShell>
  );
}
