'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';

import { setFundStatus } from '@/api/funds/funds.api';
import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { useToast } from '@/components/shell/toast-context';
import { BackIcon } from '@/components/ui/icons';
import { statusColor } from '@/lib/pace/colors';
import { formatDayUpper, money } from '@/lib/pace/format';
import {
  buildFundProjection,
  CHART_H,
  CHART_W,
  fundStats,
  projectionSentence,
} from '@/lib/pace/projection';

export function FundScreen({ fundId }: { fundId: string }) {
  const portfolio = usePortfolio();
  const { mask } = usePreferences();
  const { open } = usePanels();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const view = [...portfolio.active, ...portfolio.archived].find(
    (f) => f.id === fundId
  );
  const proj = useMemo(
    () => (view ? buildFundProjection(view, portfolio.now) : null),
    [view, portfolio.now]
  );

  if (!view || !proj) notFound();

  const { fund, pace } = view;
  const isActive = fund.status === 'active';
  const statusLabel = pace
    ? pace.status
    : isActive
      ? 'Pot · no deadline'
      : 'Archived';
  const color = pace ? statusColor(pace.status) : 'var(--muted)';
  const stats = fundStats(view);
  const { chart } = proj;
  const history = view.transactions.slice(0, 30);

  async function toggleArchive() {
    if (pending) return;
    const prev = isActive ? 'active' : 'archived';
    const next = isActive ? 'archived' : 'active';
    setPending(true);
    try {
      const ok = await setFundStatus(fundId, next);
      if (ok) {
        toast.show(
          `${next === 'archived' ? 'Archived' : 'Restored'} ${view!.name}`,
          async () => {
            await setFundStatus(fundId, prev);
          }
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className='px-[18px] pt-14 pb-[150px]'>
      <div className='mb-3 flex items-center justify-between'>
        <Link
          href='/'
          aria-label='Back'
          className='grid size-11 place-items-center rounded-full border border-line bg-surface'
        >
          <BackIcon width={18} height={18} />
        </Link>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => open({ kind: 'edit', fundId })}
            className='h-9 rounded-full bg-chip px-3.5 text-[13px] font-semibold'
          >
            Edit
          </button>
          <button
            type='button'
            onClick={toggleArchive}
            disabled={pending}
            className='h-9 rounded-full bg-chip px-3.5 text-[13px] font-semibold disabled:opacity-50'
          >
            {isActive ? 'Archive' : 'Restore'}
          </button>
        </div>
      </div>

      <div className='px-1'>
        <div
          className='text-[13px] font-semibold tracking-[.06em] uppercase'
          style={{ color }}
        >
          {statusLabel}
        </div>
        <h1 className='mt-1.5 mb-1.5 font-serif text-[40px] leading-[1.05] font-normal tracking-[-.01em]'>
          {view.name}
        </h1>
        <p className='mb-4 text-sm text-pretty text-muted'>
          {fund.description}
        </p>
        <div className='flex items-baseline gap-2 font-mono'>
          <span className='font-serif text-[56px] leading-none font-normal tracking-[-.02em]'>
            {mask(money(view.balance))}
          </span>
          {fund.targetAmount ? (
            <span className='text-sm text-muted'>
              / {mask(money(fund.targetAmount))}
            </span>
          ) : null}
        </div>
      </div>

      <div className='mt-[18px] rounded-[22px] border border-line bg-surface pt-4 pb-2.5'>
        <div className='px-4 pb-2.5 text-sm leading-[1.4] text-pretty'>
          {projectionSentence(view, proj, mask, portfolio.now)}
        </div>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          width='100%'
          style={{ display: 'block' }}
          role='img'
          aria-label={`Balance history and projection for ${view.name}`}
        >
          {chart.ty !== null && (
            <line
              x1={0}
              x2={CHART_W}
              y1={chart.ty}
              y2={chart.ty}
              strokeDasharray='3 4'
              strokeWidth={1}
              style={{ stroke: 'var(--muted)' }}
            />
          )}
          <line
            x1={chart.nx}
            x2={chart.nx}
            y1={10}
            y2={160}
            strokeWidth={1}
            style={{ stroke: 'var(--line)' }}
          />
          <path d={chart.area} style={{ fill: 'var(--accent)', opacity: 0.1 }} />
          <path
            d={chart.line}
            fill='none'
            strokeWidth={2.5}
            style={{ stroke: 'var(--accent)' }}
          />
          <path
            d={chart.proj}
            fill='none'
            strokeWidth={2.5}
            strokeDasharray='5 5'
            style={{ stroke: 'var(--accent)', opacity: 0.55 }}
          />
          <circle
            cx={chart.nx}
            cy={chart.ny}
            r={5}
            style={{ fill: 'var(--accent)' }}
          />
        </svg>
        <div className='flex justify-between px-4 pt-1 font-mono text-[11px] text-muted'>
          <span>{chart.l0}</span>
          <span>TODAY</span>
          <span>{chart.l1}</span>
        </div>
      </div>

      {stats.length > 0 && (
        <div className='mt-2 grid grid-cols-2 gap-2'>
          {stats.map((st) => (
            <div
              key={st.label}
              className='rounded-[18px] border border-line bg-surface px-4 py-3.5'
            >
              <div className='text-xs text-muted'>{st.label}</div>
              <div className='mt-1 font-mono text-lg font-semibold'>
                {st.label === 'Months left' ? st.value : mask(st.value)}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className='mx-1 mt-[22px] mb-2 text-[13px] font-semibold tracking-[.06em] text-muted uppercase'>
        History
      </h2>
      <div className='rounded-[20px] border border-line bg-surface px-4'>
        {history.map((t) => {
          const out = t.type === 'withdrawal';
          return (
            <div
              key={t.id}
              className='flex items-center justify-between border-b border-line py-[13px] last:border-b-0'
            >
              <div>
                <div className='text-sm font-medium'>
                  {t.notes || (out ? 'Withdrawal' : 'Deposit')}
                </div>
                <div className='mt-0.5 font-mono text-[11px] text-muted'>
                  {formatDayUpper(t.t)}
                </div>
              </div>
              <div
                className={`font-mono text-sm font-semibold ${out ? 'text-neg' : ''}`}
              >
                {mask(`${out ? '−' : '+'}${money(t.value, true)}`)}
              </div>
            </div>
          );
        })}
        {history.length === 0 && (
          <p className='py-4 text-sm text-muted'>No history yet.</p>
        )}
      </div>

      <div className='fixed bottom-0 left-1/2 z-10 flex w-full max-w-[440px] -translate-x-1/2 gap-2 px-[18px] pb-[max(30px,env(safe-area-inset-bottom))]'>
        <button
          type='button'
          onClick={() => open({ kind: 'quick', mode: 'deposit', fundId })}
          className='h-14 flex-1 rounded-[18px] bg-accent text-center text-base font-semibold text-on-accent shadow-[0_10px_24px_rgba(0,0,0,.15)] active:scale-[.97]'
        >
          Deposit
        </button>
        <button
          type='button'
          onClick={() => open({ kind: 'quick', mode: 'withdraw', fundId })}
          className='h-14 flex-1 rounded-[18px] border border-line bg-surface text-center text-base font-semibold active:scale-[.97]'
        >
          Withdraw
        </button>
      </div>
    </main>
  );
}
