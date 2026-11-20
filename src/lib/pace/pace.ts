/**
 * Pace maths: turns raw funds into the derived "portfolio" every screen renders.
 * Ported 1:1 from the design prototype (`pace()` + `renderVals()`); pure, no React.
 */
import { fundHue } from '@/lib/pace/colors';
import { DAY_MS, MONTH_MS } from '@/lib/pace/format';
import type { FundDetails } from '@/models/funds/fund.model';
import type { TransactionType } from '@/models/funds/transaction.model';

export type PaceStatus = 'On track' | 'Ahead' | 'Behind' | 'Funded' | 'Overdue';

export interface FundPace {
  /** Amount still missing (>= 0). */
  left: number;
  /** Months until the deadline (can be negative once overdue). */
  months: number;
  /** Amount needed per month to hit the target on time. */
  need: number;
  /** Average net saved per month over the last 90 days. */
  recent: number;
  /** Progress 0..1. */
  pct: number;
  /** Fraction 0..1 of the time between first transaction and deadline that has elapsed. */
  expected: number;
  status: PaceStatus;
  /** Deadline timestamp (ms). */
  end: number;
  /** Projected finish timestamp at the recent pace, or null with no recent savings. */
  finish: number | null;
}

export interface TxPoint {
  id: string;
  t: number;
  type: TransactionType;
  value: number;
  /** Signed value: negative for withdrawals. */
  net: number;
  notes: string;
}

export interface FundView {
  fund: FundDetails;
  id: string;
  name: string;
  hue: number;
  balance: number;
  isGoal: boolean;
  pace: FundPace | null;
  savedThisMonth: number;
  /** Completed transactions only, newest first. */
  transactions: TxPoint[];
}

export interface RingSegment {
  fundId: string;
  hue: number;
  /** stroke-dasharray length of the (faint) track, `${trackLen} ${RING_CIRCUMFERENCE}`. */
  trackLen: number;
  /** stroke-dasharray length of the filled part. */
  fillLen: number;
  /** stroke-dashoffset (negative cumulative start). */
  offset: number;
}

export interface Portfolio {
  now: number;
  monthStart: number;
  /** Days left in the month, minimum 1. */
  daysLeft: number;
  /** "November" */
  monthName: string;
  active: FundView[];
  archived: FundView[];
  /** Active goals sorted by deadline (includes funded ones). */
  goals: FundView[];
  pots: FundView[];
  total: number;
  /** Sum of monthly need over goals that are not yet funded. */
  needThisMonth: number;
  ring: {
    segments: RingSegment[];
    saved: number;
    need: number;
    /** ceil of the total shortfall this month. */
    gap: number;
    coveredCount: number;
    goalCount: number;
    /** fundId → ceil(shortfall), only funds still short. */
    gapAllocations: Record<string, number>;
  };
  /** Active funds with balance > 0. `share` is a fraction 0..1. */
  composition: { fundId: string; name: string; hue: number; share: number }[];
  defaultQuickFundId: string | null;
}

/** Circumference of the 100px-radius ring (SVG stroke-dasharray base). */
export const RING_CIRCUMFERENCE = 2 * Math.PI * 100;
const RING_GAP = 5;

export function parseTargetDate(s: string): number {
  return Date.parse(s.length <= 10 ? `${s}T12:00:00` : s);
}

function toTxPoints(fund: FundDetails): TxPoint[] {
  return (fund.transactions ?? [])
    .filter((x) => x.status === 'completed')
    .map((x) => ({
      id: x.id,
      t: Date.parse(x.createdAt),
      type: x.type,
      value: x.value,
      net: x.type === 'withdrawal' ? -x.value : x.value,
      notes: x.notes ?? '',
    }))
    .filter((x) => !Number.isNaN(x.t))
    .sort((a, b) => b.t - a.t);
}

function computePace(
  targetAmount: number,
  targetDate: string,
  balance: number,
  txs: TxPoint[],
  now: number
): FundPace {
  const left = Math.max(0, targetAmount - balance);
  const end = parseTargetDate(targetDate);
  const months = (end - now) / MONTH_MS;
  const recent =
    txs.filter((x) => x.t > now - 90 * DAY_MS).reduce((a, x) => a + x.net, 0) /
    3;
  const start = txs.length ? txs[txs.length - 1].t : now;
  const expected = Math.min(
    1,
    Math.max(0, (now - start) / Math.max(1, end - start))
  );
  const pct = Math.min(1, balance / targetAmount);
  const need = left / Math.max(months, 0.5);
  const finish = recent > 0 ? now + (left / recent) * MONTH_MS : null;

  let status: PaceStatus;
  if (pct >= 1) status = 'Funded';
  else if (months <= 0) status = 'Overdue';
  else if (recent >= need * 1.2) status = 'Ahead';
  else if (recent >= need * 0.92) status = 'On track';
  else status = 'Behind';

  return { left, months, need, recent, pct, expected, status, end, finish };
}

export function buildFundView(
  fund: FundDetails,
  now: number,
  monthStart: number
): FundView {
  const balance = fund.currentAmount ?? 0;
  const transactions = toTxPoints(fund);
  const isGoal = !!fund.targetAmount && !!fund.targetDate;
  const pace = isGoal
    ? computePace(
        fund.targetAmount as number,
        fund.targetDate as string,
        balance,
        transactions,
        now
      )
    : null;
  return {
    fund,
    id: fund.id,
    name: fund.name,
    hue: fundHue(fund),
    balance,
    isGoal,
    pace,
    savedThisMonth: transactions
      .filter((x) => x.t >= monthStart)
      .reduce((a, x) => a + x.net, 0),
    transactions,
  };
}

export function buildPortfolio(
  funds: FundDetails[],
  now: number = Date.now()
): Portfolio {
  const d = new Date(now);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - d.getDate());
  const monthName = d.toLocaleDateString('en-US', { month: 'long' });

  const views = funds.map((f) => buildFundView(f, now, monthStart));
  const active = views.filter((v) => v.fund.status === 'active');
  const archived = views.filter((v) => v.fund.status !== 'active');
  const total = active.reduce((a, v) => a + v.balance, 0);

  const goals = active
    .filter((v) => v.pace)
    .sort((a, b) => (a.pace as FundPace).end - (b.pace as FundPace).end);
  const pots = active.filter((v) => !v.pace);

  const open = goals.filter((v) => (v.pace as FundPace).status !== 'Funded');
  const need = open.reduce((a, v) => a + (v.pace as FundPace).need, 0);
  const tn = need || 1;

  let start = 0;
  const segments: RingSegment[] = open.map((v) => {
    const vn = (v.pace as FundPace).need;
    const seg = (vn / tn) * RING_CIRCUMFERENCE;
    const len = Math.max(1, seg - RING_GAP);
    const fr = Math.min(1, Math.max(0, v.savedThisMonth) / vn);
    const s: RingSegment = {
      fundId: v.id,
      hue: v.hue,
      trackLen: len,
      fillLen: len * fr,
      offset: -start,
    };
    start += seg;
    return s;
  });

  const saved = open.reduce((a, v) => a + Math.max(0, v.savedThisMonth), 0);
  const gapAllocations: Record<string, number> = {};
  let shortTotal = 0;
  open.forEach((v) => {
    const short = Math.max(
      0,
      (v.pace as FundPace).need - Math.max(0, v.savedThisMonth)
    );
    shortTotal += short;
    if (short > 0) gapAllocations[v.id] = Math.ceil(short);
  });
  const coveredCount = open.filter(
    (v) => v.savedThisMonth >= (v.pace as FundPace).need * 0.999
  ).length;

  const composition = active
    .filter((v) => v.balance > 0)
    .map((v) => ({
      fundId: v.id,
      name: v.name,
      hue: v.hue,
      share: v.balance / total,
    }));

  const defaultQuick =
    goals.find((v) => v.pace?.status === 'Behind') ?? active[0] ?? null;

  return {
    now,
    monthStart,
    daysLeft,
    monthName,
    active,
    archived,
    goals,
    pots,
    total,
    needThisMonth: need,
    ring: {
      segments,
      saved,
      need,
      gap: Math.ceil(shortTotal),
      coveredCount,
      goalCount: open.length,
      gapAllocations,
    },
    composition,
    defaultQuickFundId: defaultQuick ? defaultQuick.id : null,
  };
}
