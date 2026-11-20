/** Pure formatting helpers shared by every screen. No React, no I/O. */

export const DAY_MS = 864e5;
/** Average month length used by all pace maths (matches the design prototype). */
export const MONTH_MS = 30.44 * DAY_MS;

/** "$1,234" / "$1,234.50" / "−$20". Pass `cents` to always show two decimals. */
export function money(n: number, cents = false): string {
  return (
    (n < 0 ? '−' : '') +
    '$' +
    Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    })
  );
}

/** Like `money`, but shows cents only when the amount is not a whole number. */
export function moneyAuto(n: number): string {
  return money(n, n % 1 !== 0);
}

/** "NOV 17, 2026" */
export function formatDayUpper(t: number): string {
  return new Date(t)
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();
}

/** "Mar 2027" */
export function formatMonthYear(t: number): string {
  return new Date(t).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
