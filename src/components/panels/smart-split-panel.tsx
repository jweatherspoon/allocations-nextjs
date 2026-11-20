'use client';

import { useState } from 'react';

import { recordSplit, undoSplit } from '@/api/plans/plans.api';
import { AllocationRow } from '@/components/panels/split/allocation-row';
import type { PanelProps } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { useToast } from '@/components/shell/toast-context';
import { Keypad } from '@/components/ui/keypad';
import { PanelHeader } from '@/components/ui/panel-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAmountInput } from '@/components/ui/use-amount-input';
import { money, moneyAuto } from '@/lib/pace/format';
import { splitLeft, suggestSplit } from '@/lib/pace/split';

export function SmartSplitPanel({ request, onClose }: PanelProps<'split'>) {
  const portfolio = usePortfolio();
  const toast = useToast();
  const { active, needThisMonth } = portfolio;

  const preset = !!request.allocations;
  const amount = useAmountInput(
    request.amount && request.amount > 0 ? String(request.amount) : ''
  );
  const [step, setStep] = useState<1 | 2>(preset ? 2 : 1);
  const [alloc, setAlloc] = useState<Record<string, number>>(
    request.allocations ?? {}
  );
  const [gapMode, setGapMode] = useState(!!request.gapMode);
  const [pending, setPending] = useState(false);

  const v = amount.value;
  const left = splitLeft(active, alloc, v);
  const balanced = left === 0;
  const max = Math.max(5, Math.ceil(v / 5) * 5);

  const explain = gapMode
    ? 'Exactly what each goal still needs to stay on pace this month.'
    : v >= needThisMonth
      ? `Covers every goal's monthly need (${money(needThisMonth)}); the extra goes to your safety net and pots.`
      : `Less than this month's ${money(needThisMonth)} need, so it's shared in proportion to each goal's need.`;

  const submit = async () => {
    if (!balanced || !(v > 0) || pending) return;
    const picked = Object.fromEntries(
      active.filter((f) => alloc[f.id] > 0).map((f) => [f.id, alloc[f.id]])
    );
    const count = Object.keys(picked).length;
    if (!count) return;
    setPending(true);
    try {
      const res = await recordSplit(v, picked);
      if (!res.ok) {
        toast.show("Couldn't record that split. Try again.");
        setPending(false);
        return;
      }
      onClose();
      toast.show(
        `Split ${moneyAuto(v)} into ${count} fund${count === 1 ? '' : 's'}`,
        async () => {
          await undoSplit(res.planId, res.refs);
        }
      );
    } catch {
      toast.show("Couldn't record that split. Try again.");
      setPending(false);
    }
  };

  if (step === 1) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        <PanelHeader title='Smart split' onClose={onClose} />
        <h2 className='mt-[18px] text-2xl font-semibold tracking-[-.02em]'>
          How much are you saving from this paycheck?
        </h2>
        <div
          className={`flex flex-1 items-center justify-center font-serif text-[80px] tracking-[-.02em] ${
            v ? 'text-ink' : 'text-muted'
          }`}
        >
          {amount.display}
        </div>
        <Keypad className='mb-3' onPress={amount.press} />
        <PrimaryButton
          disabled={!(v > 0) || !active.length}
          onClick={() => {
            setAlloc(suggestSplit(active, v));
            setGapMode(false);
            setStep(2);
          }}
        >
          Suggest a split
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <PanelHeader title='Smart split' onClose={onClose} />
      <div className='mt-3.5 font-serif text-[52px] leading-none tracking-[-.02em]'>
        {amount.display}
      </div>
      <p className='mt-1 mb-3 text-sm text-pretty text-muted'>{explain}</p>
      <div className='mb-1.5 flex items-center justify-between rounded-[14px] bg-chip px-3.5 py-2.5 text-[13px] font-semibold'>
        <span
          style={{ color: balanced ? 'var(--good)' : 'var(--warn)' }}
          aria-live='polite'
        >
          {balanced
            ? 'Fully allocated'
            : left > 0
              ? `${money(left, left % 1 !== 0)} unassigned`
              : `${money(-left, left % 1 !== 0)} over`}
        </span>
        <button
          type='button'
          className='font-semibold text-accent'
          onClick={() => {
            setAlloc(suggestSplit(active, v));
            setGapMode(false);
          }}
        >
          Re-suggest
        </button>
      </div>
      <div className='-mx-[18px] min-h-0 flex-1 overflow-y-auto px-[18px]'>
        {active.map((f) => (
          <AllocationRow
            key={f.id}
            fund={f}
            value={alloc[f.id] || 0}
            max={max}
            onChange={(val) => setAlloc((a) => ({ ...a, [f.id]: val }))}
          />
        ))}
      </div>
      <PrimaryButton
        className='mt-3'
        disabled={!balanced || !(v > 0) || pending}
        onClick={submit}
      >
        {balanced ? 'Confirm split' : `Adjust to ${money(v, v % 1 !== 0)}`}
      </PrimaryButton>
    </div>
  );
}
