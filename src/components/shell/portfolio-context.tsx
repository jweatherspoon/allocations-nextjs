'use client';

import { createContext, useContext, useMemo } from 'react';

import { buildPortfolio, type Portfolio } from '@/lib/pace/pace';
import type { FundDetails } from '@/models/funds/fund.model';

const PortfolioContext = createContext<Portfolio | null>(null);

export function PortfolioProvider({
  funds,
  children,
}: {
  funds: FundDetails[];
  children: React.ReactNode;
}) {
  // Rebuilt whenever the server re-renders the layout with fresh funds (after a server action).
  const portfolio = useMemo(
    // "Now" is intentionally sampled whenever `funds` changes.
    // eslint-disable-next-line react-hooks/purity
    () => buildPortfolio(funds, Date.now()),
    [funds]
  );

  return (
    <PortfolioContext.Provider value={portfolio}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): Portfolio {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used inside <AppShell>');
  }
  return ctx;
}
