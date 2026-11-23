'use client';

import Link from 'next/link';

import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { fundColor } from '@/lib/pace/colors';
import { money } from '@/lib/pace/format';
import { RING_CIRCUMFERENCE, type FundView } from '@/lib/pace/pace';

const LABEL = 'font-mono text-[10.5px] tracking-[.1em] text-muted';

/**
 * This month's ring: each arc is a goal's share of the month's need, filled by how
 * much of it is covered. Status line, goal chips and the "Cover the gap" shortcut.
 */
export function MonthRingCard() {
  const p = usePortfolio();
  const { open } = usePanels();
  const { theme, mask } = usePreferences();

  const col = (hue: number) => fundColor(hue, theme);
  const { ring } = p;
  const byId = new Map(p.active.map((f) => [f.id, f]));
  const itemById = new Map(ring.items.map((i) => [i.fundId, i]));
  const hasGap = ring.gap > 0;
  const gapSum = Object.values(ring.gapAllocations).reduce((a, b) => a + b, 0);
  const dayWord = p.daysLeft === 1 ? 'day' : 'days';
  const legend = ring.segments
    .map((s) => byId.get(s.fundId))
    .filter((f): f is FundView => !!f);

  return (
    <section
      aria-label='This month'
      className='relative overflow-hidden rounded-[30px] border border-line bg-hero px-[18px] pt-[26px] pb-[18px]'
    >
      <div
        aria-hidden
        className='pointer-events-none absolute top-[-10px] left-1/2 size-[340px] -translate-x-1/2 rounded-full'
        style={{
          background: 'radial-gradient(closest-side, var(--glow), transparent)',
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
                  strokeDasharray={`${s.trackLen} ${RING_CIRCUMFERENCE}`}
                  strokeDashoffset={s.offset}
                />
                <circle
                  cx='114'
                  cy='114'
                  r='100'
                  stroke={c}
                  strokeDasharray={`${s.fillLen} ${RING_CIRCUMFERENCE}`}
                  strokeDashoffset={s.offset}
                  style={{
                    transition: 'stroke-dasharray .9s cubic-bezier(.2,.8,.2,1)',
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
            const item = itemById.get(f.id);
            const short = ring.gapAllocations[f.id] ?? 0;
            const ok = item?.covered ?? true;
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
  );
}
