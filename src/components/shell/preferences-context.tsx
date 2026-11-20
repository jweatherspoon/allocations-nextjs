'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { Theme } from '@/lib/pace/colors';

export const THEME_COOKIE = 'pace-theme';
export const HIDE_COOKIE = 'pace-hide';
const ONE_YEAR = 60 * 60 * 24 * 365;

export interface Preferences {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  hideBalances: boolean;
  toggleHideBalances: () => void;
  /** Returns '••••' while balances are hidden, otherwise the string unchanged. */
  mask: (s: string) => string;
}

const PreferencesContext = createContext<Preferences | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

export function PreferencesProvider({
  initialTheme,
  initialHideBalances,
  children,
}: {
  initialTheme: Theme;
  initialHideBalances: boolean;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [hideBalances, setHide] = useState(initialHideBalances);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeCookie(THEME_COOKIE, next);
    document.documentElement.dataset.theme = next;
  }, []);

  const toggleHideBalances = useCallback(() => {
    setHide((prev) => {
      writeCookie(HIDE_COOKIE, prev ? '0' : '1');
      return !prev;
    });
  }, []);

  const value = useMemo<Preferences>(
    () => ({
      theme,
      setTheme,
      hideBalances,
      toggleHideBalances,
      mask: (s: string) => (hideBalances ? '••••' : s),
    }),
    [theme, setTheme, hideBalances, toggleHideBalances]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used inside <AppShell>');
  }
  return ctx;
}
