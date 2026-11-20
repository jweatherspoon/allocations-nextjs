'use client';

import { useState } from 'react';

import { createFund, deleteFund } from '@/api/funds/funds.api';
import type { PanelProps } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { useToast } from '@/components/shell/toast-context';
import { PanelHeader } from '@/components/ui/panel-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Segmented } from '@/components/ui/segmented';
import { DAY_MS, formatMonthYear, money } from '@/lib/pace/format';

type Kind = 'goal' | 'pot';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function NewFundPanel({ onClose }: PanelProps<'new'>) {
  const portfolio = usePortfolio();
  const toast = useToast();
  const [kind, setKind] = useState<Kind>('goal');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [months, setMonths] = useState(12);
  const [busy, setBusy] = useState(false);

  const isGoal = kind === 'goal';
  const nt = parseFloat(target) || 0;
  const ok = name.trim().length >= 3 && (!isGoal || nt > 0);

  const deadline = new Date(portfolio.now);
  deadline.setMonth(deadline.getMonth() + months);

  // Net saved across active funds over the last 90 days, per month.
  const since = portfolio.now - 90 * DAY_MS;
  const avgSave =
    portfolio.active.reduce(
      (sum, f) =>
        sum +
        f.transactions.reduce((s, x) => (x.t > since ? s + x.net : s), 0),
      0
    ) / 3;
  const perMonth = nt / months;

  let context = 'Enter a target to see the monthly pace.';
  if (nt) {
    context =
      avgSave > 0
        ? `That's ${Math.round((perMonth / avgSave) * 100)}% of the ${money(avgSave)} you've been saving each month.`
        : "You haven't been saving recently, so there's no pace to compare yet.";
  }

  async function submit() {
    if (!ok || busy) return;
    setBusy(true);
    const trimmed = name.trim();
    try {
      const res = await createFund({
        name: trimmed,
        targetAmount: isGoal ? nt : undefined,
        targetDate: isGoal
          ? `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())}`
          : undefined,
      });
      if (!res.ok) {
        toast.show("Couldn't create fund");
        setBusy(false);
        return;
      }
      onClose();
      toast.show(`Created ${trimmed}`, () => {
        void deleteFund(res.fundId);
      });
    } catch {
      toast.show("Couldn't create fund");
      setBusy(false);
    }
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <PanelHeader title='New fund' onClose={onClose} />
      <Segmented<Kind>
        ariaLabel='Fund type'
        className='mt-5 mb-6'
        value={kind}
        onChange={setKind}
        options={[
          { value: 'goal', label: 'Goal', sub: 'Amount + deadline' },
          { value: 'pot', label: 'Pot', sub: 'No deadline' },
        ]}
      />
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <label htmlFor='nf-name' className='text-xs font-medium text-muted'>
          Name
        </label>
        <input
          id='nf-name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='e.g. Wedding'
          maxLength={20}
          autoComplete='off'
          className='mb-5 h-12 w-full border-b border-line bg-transparent text-2xl font-semibold outline-none placeholder:text-muted/60 focus:border-accent'
        />
        {isGoal && (
          <>
            <label
              htmlFor='nf-target'
              className='text-xs font-medium text-muted'
            >
              Target amount
            </label>
            <div className='mb-5 flex items-center gap-1 border-b border-line font-mono focus-within:border-accent'>
              <span aria-hidden='true' className='text-2xl text-muted'>
                $
              </span>
              <input
                id='nf-target'
                value={target}
                onChange={(e) =>
                  setTarget(e.target.value.replace(/[^0-9.]/g, ''))
                }
                inputMode='decimal'
                placeholder='0'
                className='h-12 w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted/60'
              />
            </div>
            <span className='text-xs font-medium text-muted'>Deadline</span>
            <div className='mt-2 mb-5 flex items-center justify-between'>
              <button
                type='button'
                aria-label='Earlier deadline'
                onClick={() => setMonths((m) => Math.max(1, m - 1))}
                className='grid h-12 w-12 place-items-center rounded-[14px] bg-chip text-xl'
              >
                ‹
              </button>
              <span
                aria-live='polite'
                className='font-mono text-xl font-semibold uppercase'
              >
                {formatMonthYear(deadline.getTime())}
              </span>
              <button
                type='button'
                aria-label='Later deadline'
                onClick={() => setMonths((m) => Math.min(120, m + 1))}
                className='grid h-12 w-12 place-items-center rounded-[14px] bg-chip text-xl'
              >
                ›
              </button>
            </div>
            <div className='rounded-[18px] border border-line bg-surface p-4'>
              <div className='font-mono text-2xl font-semibold text-accent'>
                {nt ? `${money(perMonth)}/mo` : '$—/mo'}
              </div>
              <p className='mt-1 text-[13px] text-pretty text-muted'>
                {context}
              </p>
            </div>
          </>
        )}
      </div>
      <PrimaryButton
        className='mt-4'
        disabled={!ok || busy}
        onClick={() => void submit()}
      >
        {isGoal ? 'Create goal' : 'Create pot'}
      </PrimaryButton>
    </div>
  );
}
