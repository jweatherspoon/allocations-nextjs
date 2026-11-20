'use client';

import { createContext, useContext, useMemo } from 'react';

import { buildPortfolio, type Portfolio } from '@/lib/pace/pace';
import type { FundDetails } from '@/models/funds/fund.model';

const PortfolioContext = createContext<Portfolio | null>(null);

export function PortfolioProvider({
  funds,
  now,
  children,
}: {
  funds: FundDetails[];
  /** Server-sampled timestamp (ms); identical on the server and client render. */
  now: number;
  children: React.ReactNode;
}) {
  // Rebuilt whenever the server re-renders the layout with fresh funds (after a server action).
  const portfolio = useMemo(() => buildPortfolio(funds, now), [funds, now]);

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
