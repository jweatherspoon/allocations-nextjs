/** Smart split: pure port of the prototype's `suggest(active, amount)`. */
import type { FundView } from '@/lib/pace/pace';

const roundDown5 = (x: number) => Math.floor(x / 5) * 5;

/**
 * Suggests how to divide `amount` across the active funds.
 * - amount <= total monthly need: shared across unfunded goals in proportion to need.
 * - otherwise: every unfunded goal gets its need, the rest is spread over the pots.
 * Everything is rounded down to $5; the remainder lands on the first unfunded goal
 * (or the first fund if there are none) so the total always equals `amount`.
 */
export function suggestSplit(
  active: FundView[],
  amount: number
): Record<string, number> {
  const alloc: Record<string, number> = {};
  if (!active.length || !(amount > 0)) return alloc;

  const goals = active.filter((f) => f.pace && f.pace.status !== 'Funded');
  const needs = goals.map((f) => f.pace!.need);
  const totalNeed = needs.reduce((a, b) => a + b, 0);

  if (amount <= totalNeed) {
    goals.forEach((f, i) => {
      alloc[f.id] = roundDown5((amount * needs[i]) / totalNeed);
    });
  } else {
    goals.forEach((f, i) => {
      alloc[f.id] = roundDown5(needs[i]);
    });
    const rest = amount - goals.reduce((x, f) => x + alloc[f.id], 0);
    const pots = active.filter((f) => !f.pace);
    pots.forEach((f) => {
      alloc[f.id] = (alloc[f.id] || 0) + roundDown5(rest / pots.length);
    });
  }

  const used = Object.values(alloc).reduce((x, y) => x + y, 0);
  const first = goals[0] ?? active[0];
  alloc[first.id] = +((alloc[first.id] || 0) + amount - used).toFixed(2);
  return alloc;
}

/** Amount not yet assigned (positive) or over-assigned (negative), 2dp-safe. */
export function splitLeft(
  active: FundView[],
  alloc: Record<string, number>,
  amount: number
): number {
  const allocated = active.reduce((a, f) => a + (alloc[f.id] || 0), 0);
  return +(amount - allocated).toFixed(2);
}
