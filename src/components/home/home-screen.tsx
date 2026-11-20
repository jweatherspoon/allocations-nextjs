'use client';

import Link from 'next/link';

import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { useUser } from '@/components/shell/user-context';
import { fundColor, statusColor } from '@/lib/pace/colors';
import { money } from '@/lib/pace/format';
import { RING_CIRCUMFERENCE, type FundView } from '@/lib/pace/pace';

/** Round so server and client renders agree despite a differing `now`. */
const r1 = (n: number) => Math.round(n * 10) / 10;

const LABEL = 'font-mono text-[10.5px] tracking-[.1em] text-muted';

function dayLabel(t: number): string {
  return new Date(t)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase();
}

export function HomeScreen() {
  const p = usePortfolio();
  const { open } = usePanels();
  const user = useUser();
  const { theme, mask, hideBalances, toggleHideBalances } = usePreferences();

  const col = (hue: number) => fundColor(hue, theme);
  const { ring } = p;
  const byId = new Map(p.active.map((f) => [f.id, f]));
  const hasGap = ring.gap > 0;
  const gapSum = Object.values(ring.gapAllocations).reduce((a, b) => a + b, 0);
  const dayWord = p.daysLeft === 1 ? 'day' : 'days';

  const header = (
    <div className='flex items-center justify-between px-1'>
      <div>
        <h1 className='font-serif text-[36px] leading-none font-normal tracking-[-.01em]'>
          {p.monthName}
        </h1>
        <p className='mt-1.5 font-mono text-[11px] tracking-[.08em] text-muted'>
          {dayLabel(p.now)} · {p.daysLeft} {dayWord.toUpperCase()} LEFT
        </p>
      </div>
      <button
        type='button'
        aria-label='Settings'
        onClick={() => open({ kind: 'settings' })}
        className='grid size-10 place-items-center rounded-full border border-line bg-chip text-[13px] font-semibold'
      >
        {user.initials}
      </button>
    </div>
  );

  if (p.active.length === 0 && p.archived.length === 0) {
    return (
      <main className='px-[18px] pt-[62px] pb-32'>
        {header}
        <div className='mt-10 rounded-[30px] border border-line bg-hero px-6 py-12 text-center'>
          <p className='font-serif text-[28px] leading-tight'>
            Nothing saved for yet
          </p>
          <p className='mt-2 text-[13px] text-muted'>
            Create your first goal or pot and start putting money toward it.
          </p>
          <button
            type='button'
            onClick={() => open({ kind: 'new' })}
            className='mt-6 h-[52px] rounded-2xl bg-accent px-6 text-[15px] font-semibold text-on-accent active:scale-[.98]'
          >
            Create your first goal
          </button>
        </div>
      </main>
    );
  }

  const legend = ring.segments
    .map((s) => byId.get(s.fundId))
    .filter((f): f is FundView => !!f);

  return (
    <main className='px-[18px] pt-[62px] pb-32'>
      {header}

      <section
        aria-label='This month'
        className='relative mt-[18px] overflow-hidden rounded-[30px] border border-line bg-hero px-[18px] pt-[26px] pb-[18px]'
      >
        <div
          aria-hidden
          className='pointer-events-none absolute top-[-10px] left-1/2 size-[340px] -translate-x-1/2 rounded-full'
          style={{
            background:
              'radial-gradient(closest-side, var(--glow), transparent)',
          }}
        />
        <div className='relative mx-auto size-[228px]'>
          <svg
            aria-hidden
            width='228'
            height='228'
            viewBox='0 0 228 228'
            className='absolute inset-0 -rotate-90'
          >
            {ring.segments.map((s) => {
              const c = col(s.hue);
              return (
                <g key={s.fundId} fill='none' strokeWidth='12'>
                  <circle
                    cx='114'
                    cy='114'
                    r='100'
                    stroke={c}
                    opacity={0.2}
                    strokeDasharray={`${r1(s.trackLen)} ${r1(RING_CIRCUMFERENCE)}`}
                    strokeDashoffset={r1(s.offset)}
                  />
                  <circle
                    cx='114'
                    cy='114'
                    r='100'
                    stroke={c}
                    strokeDasharray={`${r1(s.fillLen)} ${r1(RING_CIRCUMFERENCE)}`}
                    strokeDashoffset={r1(s.offset)}
                    style={{
                      transition:
                        'stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)',
                    }}
                  />
                </g>
              );
            })}
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
            <div className={LABEL}>SAVED THIS MONTH</div>
            <div className='my-1.5 mb-1 font-serif text-[56px] leading-none tracking-[-.02em]'>
              {mask(money(ring.saved))}
            </div>
            <div className='font-mono text-xs text-muted'>
              of {mask(money(ring.need))} needed
            </div>
          </div>
        </div>

        <div className='relative mt-4 text-center'>
          <div
            className='text-base font-medium'
            style={{ color: hasGap ? 'var(--ink)' : 'var(--good)' }}
          >
            {ring.goalCount === 0
              ? 'No goals yet'
              : hasGap
                ? `${ring.coveredCount} of ${ring.goalCount} goals covered`
                : 'Every goal is covered this month'}
          </div>
          <div className='mt-1 text-[13px] text-muted'>
            {hasGap
              ? `${mask(money(ring.gap))} to go · about ${mask(money(ring.gap / p.daysLeft))}/day for ${p.daysLeft} ${dayWord}`
              : 'Anything extra pulls your deadlines closer'}
          </div>
        </div>

        {legend.length > 0 && (
          <div className='relative mt-[18px] grid grid-cols-2 gap-1.5'>
            {legend.map((f) => {
              const short = ring.gapAllocations[f.id] ?? 0;
              const ok = short <= 0;
              return (
                <Link
                  key={f.id}
                  href={`/funds/${f.id}`}
                  className='flex items-center gap-2.5 rounded-[14px] bg-chip px-3 py-2.5 text-left active:scale-[.97]'
                >
                  <span
                    className='size-2 flex-none rounded-full'
                    style={{ background: col(f.hue) }}
                  />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-medium'>
                      {f.name}
                    </span>
                    <span
                      className='mt-0.5 block font-mono text-[10.5px] tracking-[.04em]'
                      style={{ color: ok ? 'var(--good)' : 'var(--muted)' }}
                    >
                      {ok ? 'COVERED' : `${mask(money(short))} TO GO`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {hasGap && (
          <button
            type='button'
            onClick={() =>
              open({
                kind: 'split',
                amount: gapSum,
                allocations: ring.gapAllocations,
                gapMode: true,
              })
            }
            className='relative mt-2.5 h-[52px] w-full rounded-2xl bg-accent text-center text-[15px] font-semibold text-on-accent active:scale-[.98]'
          >
            Cover the gap · {mask(money(ring.gap))}
          </button>
        )}
      </section>

      <section className='px-1 pt-[26px] pb-2'>
        <div className='flex items-baseline justify-between'>
          <span className={LABEL}>TOTAL SAVED</span>
          <button type='button' onClick={toggleHideBalances} className={LABEL}>
            {hideBalances ? 'SHOW' : 'HIDE'}
          </button>
        </div>
        <button
          type='button'
          onClick={toggleHideBalances}
          className='mt-1 mb-3.5 block font-serif text-[46px] leading-[1.1] tracking-[-.02em]'
        >
          {mask(money(p.total))}
        </button>
        {p.composition.length > 0 && (
          <>
            <div className='flex h-1.5 gap-[3px]' aria-hidden>
              {p.composition.map((c) => (
                <div
                  key={c.fundId}
                  className='h-full rounded-[3px] transition-[width] duration-[600ms]'
                  style={{
                    width: `${r1(c.share * 100)}%`,
                    background: col(c.hue),
                  }}
                />
              ))}
            </div>
            <ul className='mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5'>
              {p.composition.map((c) => (
                <li
                  key={c.fundId}
                  className='flex items-center gap-1.5 text-xs text-muted'
                >
                  <span
                    className='size-1.5 rounded-full'
                    style={{ background: col(c.hue) }}
                  />
                  {c.name}
                  <span className='font-mono text-[11px]'>
                    {Math.round(c.share * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className='mx-1 mt-[22px] mb-2.5 flex items-center justify-between'>
        <h2 className={LABEL}>GOALS · BY DEADLINE</h2>
        <button
          type='button'
          onClick={() => open({ kind: 'new' })}
          className='h-8 rounded-2xl border border-line bg-chip px-3 text-[13px] font-semibold'
        >
          + New
        </button>
      </div>
      <div className='flex flex-col gap-2'>
        {p.goals.map((g) => {
          const pace = g.pace;
          const funded = pace?.status === 'Funded';
          return (
            <Link
              key={g.id}
              href={`/funds/${g.id}`}
              className='block w-full rounded-[20px] border border-line bg-surface p-4 active:scale-[.985]'
            >
              <div className='flex items-center justify-between gap-2.5'>
                <span className='flex min-w-0 items-center gap-2.5 text-base font-medium'>
                  <span
                    className='size-2 flex-none rounded-full'
                    style={{ background: col(g.hue) }}
                  />
                  <span className='truncate'>{g.name}</span>
                </span>
                {pace && (
                  <span
                    className='rounded-lg bg-chip px-2 py-1 text-[11px] font-semibold tracking-[.05em] whitespace-nowrap uppercase'
                    style={{ color: statusColor(pace.status) }}
                  >
                    {pace.status}
                  </span>
                )}
              </div>
              <div className='my-2.5 flex items-baseline justify-between'>
                <span className='font-serif text-[28px] leading-none'>
                  {mask(money(g.balance))}
                </span>
                {pace && (
                  <span className='font-mono text-[11px] text-muted'>
                    {funded
                      ? 'GOAL MET'
                      : `${mask(money(pace.need))}/MO · ${Math.max(0, Math.ceil(pace.months))} MO LEFT`}
                  </span>
                )}
              </div>
              {pace && (
                <div className='relative h-1 rounded-sm bg-chip' aria-hidden>
                  <div
                    className='absolute inset-y-0 left-0 rounded-sm transition-[width] duration-[600ms]'
                    style={{
                      width: `${r1(Math.min(1, pace.pct) * 100)}%`,
                      background: col(g.hue),
                    }}
                  />
                  <div
                    className='absolute -top-1 -bottom-1 w-0.5 rounded-[1px] bg-ink'
                    style={{ left: `${r1(Math.min(1, pace.expected) * 100)}%` }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {p.pots.length > 0 && (
        <>
          <h2 className={`${LABEL} mx-1 mt-6 mb-2.5`}>POTS · NO DEADLINE</h2>
          <div className='flex flex-col gap-2'>
            {p.pots.map((g) => (
              <Link
                key={g.id}
                href={`/funds/${g.id}`}
                className='flex w-full items-center justify-between rounded-[20px] border border-line bg-surface p-4'
              >
                <span className='flex items-center gap-2.5 text-base font-medium'>
                  <span
                    className='size-2 rounded-full'
                    style={{ background: col(g.hue) }}
                  />
                  {g.name}
                </span>
                <span className='font-serif text-[24px]'>
                  {mask(money(g.balance))}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      {p.archived.length > 0 && (
        <div className='mt-2'>
          {p.archived.map((g) => (
            <Link
              key={g.id}
              href={`/funds/${g.id}`}
              className='flex w-full justify-between px-1 py-3 text-[13px] text-muted'
            >
              <span>Archived · {g.name}</span>
              <span className='font-mono'>{mask(money(g.balance))}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
