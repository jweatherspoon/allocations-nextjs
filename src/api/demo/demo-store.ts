/**
 * In-memory store backing demo mode (`NODE_ENV=development` + `PACE_DEMO=1`).
 * Stashed on `globalThis` so it survives module reloads and separate route bundles in dev.
 */
import { DEMO_MODE } from '@/api/demo/demo-mode';
import { buildDemoUserData, DEMO_USER_ID } from '@/api/demo/demo-seed';
import type { AppUser } from '@/models/user/app-user.model';
import type { UserData } from '@/models/user/userData.model';

export { DEMO_USER_ID };

export const DEMO_USER: AppUser = {
  name: 'Jordan W.',
  initials: 'JW',
  email: 'jordan@example.com',
};

type DemoGlobal = typeof globalThis & { __paceDemoStore?: { user: UserData } };

function store(): { user: UserData } {
  if (!DEMO_MODE) {
    throw new Error('Demo store is only available in demo mode');
  }
  const g = globalThis as DemoGlobal;
  g.__paceDemoStore ??= { user: buildDemoUserData() };
  return g.__paceDemoStore;
}

/** A copy of the demo user's data (mutating it does not touch the store). */
export function getDemoUserData(): UserData {
  return structuredClone(store().user);
}

export function setDemoUserData(data: UserData): void {
  store().user = structuredClone(data);
}
