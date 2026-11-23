'use client';

import Link from 'next/link';

import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { useUser } from '@/components/shell/user-context';
import { fundColor, statusColor } from '@/lib/pace/colors';
import { money } from '@/lib/pace/format';

const LABEL = 'font-mono text-[10.5px] tracking-[.1em] text-muted';

function countLabel(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 'S'}`;
}

export function HomeScreen() {
  const p = usePortfolio();
  const { open } = usePanels();
  const user = useUser();
  const { theme, mask, hideBalances, toggleHideBalances } = usePreferences();

  const col = (hue: number) => fundColor(hue, theme);

  const header = (
    <div className='flex items-center justify-between px-1'>
      <div>
        <h1 className='font-serif text-[36px] leading-none font-normal tracking-[-.01em]'>
          Plan
        </h1>
        <p className='mt-1.5 font-mono text-[11px] tracking-[.08em] text-muted'>
          {countLabel(p.goals.length, 'GOAL')} · {countLabel(p.pots.length, 'POT')}
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

  return (
    <main className='px-[18px] pt-[62px] pb-32'>
      {header}

      <section className='px-1 pt-[22px] pb-2'>
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
                    width: `${c.share * 100}%`,
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
                      width: `${Math.min(1, pace.pct) * 100}%`,
                      background: col(g.hue),
                    }}
                  />
                  <div
                    className='absolute -top-1 -bottom-1 w-0.5 rounded-[1px] bg-ink'
                    style={{ left: `${Math.min(1, pace.expected) * 100}%` }}
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
                <span className='flex items-baseline gap-1.5'>
                  <span className='font-serif text-[24px]'>
                    {mask(money(g.balance))}
                  </span>
                  {g.fund.targetAmount ? (
                    <span className='font-mono text-[11px] text-muted'>
                      / {mask(money(g.fund.targetAmount))}
                    </span>
                  ) : null}
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
