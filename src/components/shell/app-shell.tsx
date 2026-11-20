'use client';

import { BottomNav } from '@/components/shell/bottom-nav';
import {
  PanelProvider,
  usePanelHostState,
} from '@/components/shell/panel-context';
import { PanelHost } from '@/components/shell/panel-host';
import { PortfolioProvider } from '@/components/shell/portfolio-context';
import { PreferencesProvider } from '@/components/shell/preferences-context';
import { ToastHost, ToastProvider } from '@/components/shell/toast-context';
import { UserProvider } from '@/components/shell/user-context';
import type { Theme } from '@/lib/pace/colors';
import type { FundDetails } from '@/models/funds/fund.model';
import type { AppUser } from '@/models/user/app-user.model';

function ShellBody({ children }: { children: React.ReactNode }) {
  const { rendered } = usePanelHostState();
  return (
    <>
      {/* While a panel is open the page behind it is inert (no focus, no clicks). */}
      <div inert={rendered !== null}>
        <div className='mx-auto min-h-dvh w-full max-w-[440px]'>{children}</div>
        <BottomNav />
      </div>
      <PanelHost />
      <ToastHost />
    </>
  );
}

/** Client shell: providers + page container + bottom nav + panel sheet + toasts. */
export function AppShell({
  funds,
  user,
  initialTheme = 'dark',
  initialHideBalances = false,
  children,
}: {
  funds: FundDetails[];
  user: AppUser;
  initialTheme?: Theme;
  initialHideBalances?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PreferencesProvider
      initialTheme={initialTheme}
      initialHideBalances={initialHideBalances}
    >
      <UserProvider user={user}>
        <PortfolioProvider funds={funds}>
          <ToastProvider>
            <PanelProvider>
              <ShellBody>{children}</ShellBody>
            </PanelProvider>
          </ToastProvider>
        </PortfolioProvider>
      </UserProvider>
    </PreferencesProvider>
  );
}
