/** Pure insights maths: six-month saved buckets and goal timeline verdicts. */
import { MONTH_MS, formatMonthYear } from '@/lib/pace/format';
import type { FundView } from '@/lib/pace/pace';

export const CHART_HEIGHT = 150;

export interface MonthBucket {
  label: string;
  /** Net saved across all active funds in the month. */
  value: number;
  current: boolean;
}

export function monthBuckets(
  active: FundView[],
  now: number,
  count = 6
): MonthBucket[] {
  const out: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - i);
    const a = d.getTime();
    const e = new Date(d);
    e.setMonth(e.getMonth() + 1);
    const end = e.getTime();
    const value = active.reduce(
      (sum, f) =>
        sum +
        f.transactions
          .filter((t) => t.t >= a && t.t < end)
          .reduce((y, t) => y + t.net, 0),
      0
    );
    out.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      value,
      current: i === 0,
    });
  }
  return out;
}

/** Chart scale: the value that maps to the full chart height. */
export function chartMax(need: number, buckets: MonthBucket[]): number {
  return Math.max(need, ...buckets.map((b) => b.value), 1) * 1.1;
}

export interface TimelineItem {
  id: string;
  name: string;
  date: string;
  verdict: string;
  tone: 'good' | 'warn';
}

export function timelineItems(goals: FundView[]): TimelineItem[] {
  return goals.flatMap((f) => {
    const p = f.pace;
    if (!p) return [];
    let verdict: string;
    let tone: 'good' | 'warn';
    if (p.status === 'Funded') {
      verdict = 'Funded';
      tone = 'good';
    } else if (!p.finish) {
      verdict = 'No recent deposits';
      tone = 'warn';
    } else {
      const d = Math.round((p.end - p.finish) / MONTH_MS);
      const proj = `Projected ${formatMonthYear(p.finish)}`;
      verdict =
        d > 0
          ? `${proj} · ${d} mo early`
          : d === 0
            ? `${proj} · right on time`
            : `${proj} · ${-d} mo late`;
      tone = d >= 0 ? 'good' : 'warn';
    }
    return [
      {
        id: f.id,
        name: f.name,
        date: formatMonthYear(p.end).toUpperCase(),
        verdict,
        tone,
      },
    ];
  });
}
