/**
 * Self-check for the pure pace maths.
 *
 *   npx tsx scripts/pace-selfcheck.ts
 *
 * (`tsx` is fetched by npx on first use.) Builds the demo data for several different
 * "today" dates, runs `buildPortfolio` on it and asserts a few invariants.
 * Exits non-zero on the first failure.
 */
import assert from 'node:assert/strict';

import { buildDemoUserData } from '../src/api/demo/demo-seed';
import { applyLogEntry, applyVoid } from '../src/api/funds/ledger';
import { fundColor, fundHue, HUES, statusColor } from '../src/lib/pace/colors';
import { money, moneyAuto } from '../src/lib/pace/format';
import { buildPortfolio, RING_CIRCUMFERENCE } from '../src/lib/pace/pace';

const STATUSES = ['On track', 'Ahead', 'Behind', 'Funded', 'Overdue'];
const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n);

// format
assert.equal(money(1234), '$1,234');
assert.equal(money(-20), '−$20');
assert.equal(money(5, true), '$5.00');
assert.equal(moneyAuto(12.5), '$12.50');
assert.equal(moneyAuto(12), '$12');

// colors
assert.equal(fundHue({ id: 'x', hue: 42 }), 42);
assert.ok((HUES as readonly number[]).includes(fundHue({ id: 'abc' })));
assert.equal(fundHue({ id: 'abc' }), fundHue({ id: 'abc' }));
assert.equal(fundColor(160, 'dark'), 'oklch(0.76 0.09 160)');
assert.equal(fundColor(160, 'light'), 'oklch(0.58 0.11 160)');
assert.equal(statusColor('Behind'), 'var(--warn)');
assert.equal(statusColor('On track'), 'var(--accent)');

// portfolio over a spread of dates (start, middle, end of month, new year)
const dates = [
  new Date(2026, 10, 20, 12),
  new Date(2026, 0, 1, 0, 5),
  new Date(2026, 1, 28, 23, 30),
  new Date(2027, 5, 15, 9),
  new Date(),
];

for (const d of dates) {
  const now = d.getTime();
  const user = buildDemoUserData(now);
  const funds = user.funds ?? [];
  const p = buildPortfolio(funds, now);
  const tag = d.toISOString();

  assert.equal(p.now, now);
  assert.ok(p.daysLeft >= 1, `${tag}: daysLeft`);
  assert.ok(p.monthName.length > 2);
  assert.equal(p.active.length + p.archived.length, funds.length);
  assert.ok(p.archived.length >= 1, `${tag}: has an archived fund`);
  assert.ok(p.pots.length >= 1, `${tag}: has a pot`);
  assert.ok(p.goals.length >= 3, `${tag}: has goals`);
  assert.ok(finite(p.total) && finite(p.needThisMonth), `${tag}: totals`);
  assert.ok(
    Math.abs(p.total - p.active.reduce((a, v) => a + v.balance, 0)) < 1e-6
  );

  for (const v of [...p.active, ...p.archived]) {
    assert.ok(finite(v.balance) && finite(v.savedThisMonth), `${tag}: ${v.id}`);
    assert.equal(v.isGoal, v.pace !== null);
    // newest first
    for (let i = 1; i < v.transactions.length; i++) {
      assert.ok(v.transactions[i - 1].t >= v.transactions[i].t);
    }
    if (v.pace) {
      for (const k of ['left', 'months', 'need', 'recent', 'pct', 'expected'] as const) {
        assert.ok(finite(v.pace[k]), `${tag}: ${v.id}.${k}`);
      }
      assert.ok(STATUSES.includes(v.pace.status), `${tag}: status ${v.pace.status}`);
      assert.ok(v.pace.pct >= 0 && v.pace.pct <= 1);
      assert.ok(v.pace.expected >= 0 && v.pace.expected <= 1);
      assert.ok(v.pace.finish === null || finite(v.pace.finish));
    }
  }

  // goals sorted by deadline
  for (let i = 1; i < p.goals.length; i++) {
    assert.ok(p.goals[i - 1].pace!.end <= p.goals[i].pace!.end);
  }

  // ring
  const { segments } = p.ring;
  assert.ok(finite(p.ring.saved) && finite(p.ring.need) && finite(p.ring.gap));
  assert.equal(segments.length, p.ring.goalCount);
  let prev = 1;
  for (const s of segments) {
    assert.ok(finite(s.trackLen) && finite(s.fillLen) && finite(s.offset));
    assert.ok(s.trackLen >= 1 && s.fillLen >= 0 && s.fillLen <= s.trackLen + 1e-9);
    assert.ok(s.offset <= 0 && s.offset < prev, `${tag}: ring offsets monotonic`);
    assert.ok(-s.offset + s.trackLen <= RING_CIRCUMFERENCE + 1e-6);
    prev = s.offset;
  }
  assert.ok(p.ring.coveredCount <= p.ring.goalCount);
  for (const [id, amt] of Object.entries(p.ring.gapAllocations)) {
    assert.ok(funds.some((f) => f.id === id) && Number.isInteger(amt) && amt > 0);
  }

  // composition
  const share = p.composition.reduce((a, c) => a + c.share, 0);
  assert.ok(Math.abs(share - 1) < 1e-9, `${tag}: composition sums to 1`);
  assert.ok(p.defaultQuickFundId && p.active.some((v) => v.id === p.defaultQuickFundId));

  if (d === dates[0]) {
    // The demo reproduces the prototype's picture on its own date.
    const statuses = new Set(p.goals.map((g) => g.pace!.status));
    assert.ok(statuses.has('Behind'), 'demo has a Behind goal');
    console.log(
      `${tag}: ${p.monthName}, ${p.daysLeft} days left, total ${money(p.total)}, ` +
        `need ${money(p.needThisMonth)}, saved ${money(p.ring.saved)}, gap ${money(p.ring.gap)}, ` +
        `${p.ring.coveredCount}/${p.ring.goalCount} covered`
    );
    console.log(
      p.goals.map((g) => `  ${g.name}: ${g.pace!.status}`).join('\n')
    );
  }
}

// empty portfolio
const empty = buildPortfolio([], Date.now());
assert.equal(empty.total, 0);
assert.equal(empty.defaultQuickFundId, null);
assert.equal(empty.ring.segments.length, 0);

// ledger: log then void restores the balance
{
  const funds = buildDemoUserData().funds!;
  const fund = funds[0];
  const before = fund.currentAmount;
  const ref = applyLogEntry(
    fund,
    { fundId: fund.id, type: 'withdrawal', value: 12.34 },
    new Date().toISOString()
  );
  assert.equal(fund.currentAmount, Math.round((before - 12.34) * 100) / 100);
  applyVoid(funds, [ref], new Date().toISOString());
  assert.equal(fund.currentAmount, before);
  assert.equal(applyVoid(funds, [ref], new Date().toISOString()).length, 0);
}

console.log('pace-selfcheck: OK');
