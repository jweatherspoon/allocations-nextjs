/**
 * Fund-detail chart geometry, projection sentence and stat tiles.
 * Ported from the prototype's `// fund detail` block; pure, no React.
 */
import {
  DAY_MS,
  formatMonthYear,
  money,
  MONTH_MS,
} from '@/lib/pace/format';
import type { FundView } from '@/lib/pace/pace';

export const CHART_W = 352;
export const CHART_H = 170;

export interface FundChart {
  line: string;
  area: string;
  proj: string;
  nx: string;
  ny: string;
  /** y of the target line, or null when there is no target. */
  ty: string | null;
  l0: string;
  l1: string;
}

export interface FundProjection {
  chart: FundChart;
  /** Raw numbers so callers can format/mask them. */
  rate: number;
  projEnd: number;
  endT: number;
}

export interface StatTile {
  label: string;
  value: string;
}

const f1 = (n: number) => n.toFixed(1);

export function buildFundProjection(
  view: FundView,
  now: number
): FundProjection {
  const p = view.pace;
  const t0 = now - 180 * DAY_MS;
  const t1 = p ? Math.max(p.end, now + 60 * DAY_MS) : now + 180 * DAY_MS;
  const X = (t: number) => ((t - t0) / (t1 - t0)) * CHART_W;

  // Oldest-first; anchor so the series ends exactly at the balance
  // (legacy funds may lack an opening transaction).
  const txs = [...view.transactions].reverse();
  const offset = view.balance - txs.reduce((a, x) => a + x.net, 0);
  const pts: { t: number; v: number }[] = [];
  for (let i = 0; i <= 30; i++) {
    const t = i === 30 ? now : t0 + ((now - t0) * i) / 30 + 1;
    let v = offset;
    for (const x of txs) if (x.t <= t) v += x.net;
    pts.push({ t, v: i === 30 ? view.balance : v });
  }

  const rate = p
    ? p.recent
    : Math.max(
        0,
        view.transactions
          .filter((x) => x.t > now - 90 * DAY_MS)
          .reduce((a, x) => a + x.net, 0) / 3
      );
  const projEnd = view.balance + (rate * (t1 - now)) / MONTH_MS;
  const target = view.fund.targetAmount ?? 0;
  const max = Math.max(target, projEnd, ...pts.map((q) => q.v), 1) * 1.1;
  const Y = (v: number) => 10 + (CHART_H - 20) * (1 - v / max);

  let line = '';
  pts.forEach((q, i) => {
    line += `${i ? 'L' : 'M'}${f1(X(q.t))} ${f1(Y(q.v))}`;
  });
  const nx = X(now);
  const ny = Y(view.balance);

  return {
    rate,
    projEnd,
    endT: t1,
    chart: {
      line,
      area: `${line}L${f1(nx)} ${CHART_H}L${f1(X(pts[0].t))} ${CHART_H}Z`,
      proj: `M${f1(nx)} ${f1(ny)}L${CHART_W} ${f1(Y(projEnd))}`,
      nx: f1(nx),
      ny: f1(ny),
      ty: target ? f1(Y(target)) : null,
      l0: formatMonthYear(t0).toUpperCase(),
      l1: formatMonthYear(t1).toUpperCase(),
    },
  };
}

/** The sentence at the top of the chart card. `fmt` lets callers mask money. */
export function projectionSentence(
  view: FundView,
  proj: FundProjection,
  fmt: (s: string) => string,
  now: number
): string {
  const p = view.pace;
  const target = view.fund.targetAmount;
  if (!p && target) {
    // A pot with a target but no deadline: no monthly pace, but say when it gets there.
    if (view.balance >= target)
      return 'Target reached. Archive it, or keep it growing.';
    if (proj.rate <= 0)
      return `No recent deposits. Add one to see when you'll reach ${fmt(
        money(target)
      )}.`;
    const finish = now + ((target - view.balance) / proj.rate) * MONTH_MS;
    return `At ${fmt(money(proj.rate))}/mo you'll reach ${fmt(
      money(target)
    )} around ${formatMonthYear(finish)}. Add a deadline to track pace.`;
  }
  if (!p) {
    return `Growing about ${fmt(money(proj.rate))}/mo. At this pace: ${fmt(
      money(proj.projEnd)
    )} by ${formatMonthYear(proj.endT)}.`;
  }
  if (p.status === 'Funded')
    return 'Goal reached. Archive it, or keep it growing.';
  if (!p.finish) return 'No recent deposits — add one to get a projection.';
  const diff =
    p.finish <= p.end
      ? `${Math.max(0, Math.round((p.end - p.finish) / MONTH_MS))} mo before`
      : `${Math.round((p.finish - p.end) / MONTH_MS)} mo after`;
  return `At ${fmt(money(p.recent))}/mo you'll reach ${fmt(
    money(view.fund.targetAmount ?? 0)
  )} in ${formatMonthYear(p.finish)} — ${diff} your ${formatMonthYear(
    p.end
  )} deadline.`;
}

export function fundStats(view: FundView): StatTile[] {
  const p = view.pace;
  if (!p) return [];
  return [
    { label: 'Remaining', value: money(p.left) },
    { label: 'Months left', value: Math.max(0, p.months).toFixed(1) },
    { label: 'Needed / mo', value: money(p.need) },
    { label: 'Your pace / mo', value: money(p.recent) },
  ];
}
