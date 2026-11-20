'use client';

import { createContext, useContext } from 'react';

import type { AppUser } from '@/models/user/app-user.model';

const UserContext = createContext<AppUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/** The signed-in user (`name`, `initials`, `email`). */
export function useUser(): AppUser {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used inside <AppShell>');
  }
  return ctx;
}
