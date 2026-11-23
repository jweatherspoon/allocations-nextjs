'use client';

import Link from 'next/link';

import { MonthRingCard } from '@/components/month/month-ring-card';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { money } from '@/lib/pace/format';
import {
  CHART_HEIGHT,
  chartMax,
  monthBuckets,
  timelineItems,
} from '@/lib/pace/insights';

const LABEL = 'text-[13px] font-semibold uppercase tracking-[.06em] text-muted';

function dayLabel(t: number): string {
  return new Date(t)
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}

/** "This month" tab: the goal ring, saved-vs-needed history and the goal timeline. */
export function MonthScreen() {
  const pf = usePortfolio();
  const { mask } = usePreferences();

  const buckets = monthBuckets(pf.active, pf.now);
  const need = pf.needThisMonth;
  const mx = chartMax(need, buckets);
  const needY = Math.round((need / mx) * CHART_HEIGHT);
  const timeline = timelineItems(pf.goals);

  return (
    <main className='px-[18px] pt-[62px] pb-32'>
      <div className='mx-1 mb-[18px]'>
        <h1 className='font-serif text-[36px] leading-none font-normal tracking-[-.01em]'>
          {pf.monthName}
        </h1>
        <p className='mt-1.5 font-mono text-[11px] tracking-[.08em] text-muted'>
          {dayLabel(pf.now)} · {pf.daysLeft}{' '}
          {pf.daysLeft === 1 ? 'DAY' : 'DAYS'} LEFT
        </p>
      </div>

      {pf.active.length === 0 ? (
        <p className='mx-1 text-muted'>
          Create a fund to start seeing how your saving stacks up.
        </p>
      ) : (
        <>
          <MonthRingCard />

          <section className='mt-6 rounded-3xl border border-line bg-surface p-[18px]'>
            <div className='flex items-baseline justify-between'>
              <h2 className={LABEL}>Saved vs. needed</h2>
              <span className='font-mono text-xs text-muted'>
                - - need {mask(money(need))}
              </span>
            </div>
            <div
              aria-hidden='true'
              className='relative mt-4'
              style={{ height: CHART_HEIGHT }}
            >
              <div
                className='absolute inset-x-0 border-t-[1.5px] border-dashed border-muted opacity-70'
                style={{ bottom: needY }}
              />
              <div className='absolute inset-0 flex items-end gap-2.5'>
                {buckets.map((m) => (
                  <div
                    key={m.label + m.current}
                    className='flex-1 rounded-t-lg rounded-b-[3px] transition-[height] duration-500'
                    style={{
                      height: Math.max(4, Math.round((m.value / mx) * CHART_HEIGHT)),
                      background: m.current
                        ? 'var(--accent)'
                        : m.value >= need
                          ? 'var(--good)'
                          : 'var(--chip)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div aria-hidden='true' className='mt-2 flex gap-2.5'>
              {buckets.map((m) => (
                <span
                  key={m.label + m.current}
                  className='flex-1 text-center font-mono text-[11px] text-muted'
                >
                  {m.label}
                </span>
              ))}
            </div>
            <table className='sr-only'>
              <caption>
                Saved per month versus {mask(money(need))} needed this month
              </caption>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Saved</th>
                </tr>
              </thead>
              <tbody>
                {buckets.map((m) => (
                  <tr key={m.label + m.current}>
                    <td>{m.label}</td>
                    <td>{mask(money(m.value))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <h2 className={`${LABEL} mx-1 mt-6 mb-3`}>
            Goal timeline · at your pace
          </h2>
          {timeline.length === 0 ? (
            <p className='mx-1 text-muted'>
              No goals yet. Add a target amount and date to a fund to see when
              you will get there.
            </p>
          ) : (
            <div className='relative pl-[22px]'>
              <div className='absolute top-2 bottom-2 left-1.5 w-0.5 bg-line' />
              {timeline.map((t) => {
                const color = t.tone === 'good' ? 'var(--good)' : 'var(--warn)';
                return (
                  <Link
                    key={t.id}
                    href={`/funds/${t.id}`}
                    className='relative block w-full pb-[18px]'
                  >
                    <span
                      aria-hidden='true'
                      className='absolute top-[5px] -left-[21px] size-3 rounded-full border-2 border-bg'
                      style={{ background: color }}
                    />
                    <div className='font-mono text-xs text-muted'>{t.date}</div>
                    <div className='my-0.5 text-base font-semibold'>
                      {t.name}
                    </div>
                    <div className='text-[13px]' style={{ color }}>
                      {t.verdict}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
