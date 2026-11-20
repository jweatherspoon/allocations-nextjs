/**
 * Demo data: the design prototype's `DEFS`, re-anchored to the real current date.
 * Pure (no globals), so scripts and tests can build the same data.
 *
 * The prototype is set on 20 Nov 2026 (day 19.5 of the month). To keep the same
 * "this month" picture on any day, transaction ages that fall inside the prototype's
 * current month are scaled into the real current month; older ones keep their gap
 * to the month start. Deadlines keep their distance from "today".
 */
import type { FundDetails } from '@/models/funds/fund.model';
import type { TransactionDetails } from '@/models/funds/transaction.model';
import type { UserData } from '@/models/user/userData.model';

export const DEMO_USER_ID = 'demo-user';

const DAY = 864e5;
const PROTO_TODAY = Date.parse('2026-11-20T12:00:00Z');
const PROTO_DAY_OF_MONTH = 19.5;

interface Def {
  id: string;
  hue: number;
  name: string;
  description: string;
  targetAmount?: number;
  targetDate?: string;
  open: number;
  dep: number;
  every: number;
  n: number;
  wd: [number, number, string][];
  status?: 'active' | 'archived';
  startAgo?: number;
}

const DEFS: Def[] = [
  {
    id: 'emergency',
    hue: 160,
    name: 'Emergency Fund',
    description:
      'Six months of essentials. Untouchable unless it really is an emergency.',
    targetAmount: 15000,
    targetDate: '2027-09-01',
    open: 1000,
    dep: 350,
    every: 14,
    n: 22,
    wd: [[120, 600, 'Car repair']],
  },
  {
    id: 'japan',
    hue: 25,
    name: 'Japan Trip',
    description: 'Two weeks in Kyoto & Tokyo for cherry blossom season.',
    targetAmount: 5200,
    targetDate: '2027-03-25',
    open: 0,
    dep: 250,
    every: 14,
    n: 14,
    wd: [],
  },
  {
    id: 'car',
    hue: 255,
    name: 'New Car',
    description: 'Down payment on something electric.',
    targetAmount: 12000,
    targetDate: '2027-12-31',
    open: 2000,
    dep: 250,
    every: 14,
    n: 12,
    wd: [],
  },
  {
    id: 'gifts',
    hue: 330,
    name: 'Holiday Gifts',
    description: 'Family, friends, and the white elephant swap.',
    targetAmount: 900,
    targetDate: '2026-12-15',
    open: 0,
    dep: 80,
    every: 14,
    n: 8,
    wd: [[10, 95, 'Early-bird deal']],
  },
  {
    id: 'home',
    hue: 85,
    name: 'Home Projects',
    description: 'Paint, plants, and eventually the deck.',
    open: 400,
    dep: 120,
    every: 28,
    n: 7,
    wd: [[50, 260, 'Paint & supplies']],
  },
  {
    id: 'laptop',
    hue: 210,
    name: 'Laptop',
    description: 'Replaced the old one.',
    targetAmount: 2400,
    targetDate: '2026-06-01',
    open: 0,
    dep: 200,
    every: 14,
    n: 12,
    wd: [],
    status: 'archived',
    startAgo: 180,
  },
];

function isoDate(t: number): string {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

export function buildDemoUserData(now: number = Date.now()): UserData {
  const d = new Date(now);
  const monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const dayOfMonth = (now - monthStart) / DAY;

  const mapAgo = (ago: number) =>
    ago < PROTO_DAY_OF_MONTH
      ? (ago * dayOfMonth) / PROTO_DAY_OF_MONTH
      : dayOfMonth + (ago - PROTO_DAY_OF_MONTH);

  const funds: FundDetails[] = DEFS.map((def) => {
    const startAgo = def.startAgo ?? 0;
    const txs: TransactionDetails[] = [];
    const add = (
      id: string,
      type: 'deposit' | 'withdrawal',
      value: number,
      ago: number,
      notes?: string
    ) => {
      const at = new Date(now - mapAgo(ago) * DAY).toISOString();
      txs.push({
        id,
        type,
        value,
        status: 'completed',
        createdAt: at,
        modifiedAt: at,
        ...(notes ? { notes } : {}),
      });
    };

    if (def.open) {
      add(
        `${def.id}-open`,
        'deposit',
        def.open,
        startAgo + def.n * def.every + 5,
        'Opening balance'
      );
    }
    for (let i = 0; i < def.n; i++) {
      add(
        `${def.id}-d${i}`,
        'deposit',
        def.dep,
        startAgo + i * def.every + 3,
        i % 3 === 0 ? 'Paycheck split' : undefined
      );
    }
    def.wd.forEach(([ago, value, notes], j) =>
      add(`${def.id}-w${j}`, 'withdrawal', value, ago, notes)
    );

    txs.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const balance = txs.reduce(
      (a, x) => a + (x.type === 'withdrawal' ? -x.value : x.value),
      0
    );

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      status: def.status ?? 'active',
      hue: def.hue,
      currentAmount: balance,
      transactions: txs,
      createdAt: txs[txs.length - 1]?.createdAt ?? new Date(now).toISOString(),
      modifiedAt: txs[0]?.createdAt ?? new Date(now).toISOString(),
      ...(def.targetAmount && def.targetDate
        ? {
            targetAmount: def.targetAmount,
            targetDate: isoDate(
              now + (Date.parse(`${def.targetDate}T12:00:00Z`) - PROTO_TODAY)
            ),
          }
        : {}),
    };
  });

  return { id: DEMO_USER_ID, funds, plans: [] };
}
