'use client';

import { useState } from 'react';

import { logTransactions, voidTransactions } from '@/api/funds/funds.api';
import type { PanelProps } from '@/components/shell/panel-context';
import { usePanels } from '@/components/shell/panel-context';
import { usePortfolio } from '@/components/shell/portfolio-context';
import { usePreferences } from '@/components/shell/preferences-context';
import { useToast } from '@/components/shell/toast-context';
import { ChipButton } from '@/components/ui/chip-button';
import { Keypad } from '@/components/ui/keypad';
import { PanelHeader } from '@/components/ui/panel-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Segmented } from '@/components/ui/segmented';
import { useAmountInput } from '@/components/ui/use-amount-input';
import { money, moneyAuto } from '@/lib/pace/format';

type Mode = 'deposit' | 'withdraw';

export function QuickLogPanel({ request, onClose }: PanelProps<'quick'>) {
  const portfolio = usePortfolio();
  const { open } = usePanels();
  const { mask } = usePreferences();
  const toast = useToast();
  const amount = useAmountInput();
  const { active } = portfolio;

  const [mode, setMode] = useState<Mode>(request.mode ?? 'deposit');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [picked, setPicked] = useState<string | undefined>(() => {
    const isActive = (id?: string | null) =>
      !!id && active.some((f) => f.id === id);
    if (isActive(request.fundId)) return request.fundId;
    if (isActive(portfolio.defaultQuickFundId))
      return portfolio.defaultQuickFundId ?? undefined;
    return active[0]?.id;
  });

  const target = active.find((f) => f.id === picked) ?? active[0];

  if (!target) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        <PanelHeader onClose={onClose} />
        <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
          <p className='font-serif text-4xl'>No funds yet</p>
          <p className='text-sm text-muted'>
            Create a goal or pot to start logging money.
          </p>
          <ChipButton onClick={() => open({ kind: 'new' })}>
            Create a fund
          </ChipButton>
        </div>
      </div>
    );
  }

  const v = amount.value;
  const out = mode === 'withdraw';
  const over = out && v > target.balance + 1e-9;
  const pace = target.pace;

  let hint = '';
  let hintColor = 'var(--muted)';
  if (over) {
    hint = `Only ${money(target.balance)} in ${target.name}`;
    hintColor = 'var(--neg)';
  } else if (pace && !out && pace.status !== 'Funded') {
    hint =
      v > 0
        ? `Covers ${Math.min(100, Math.round((v / pace.need) * 100))}% of this month's ${money(pace.need)}`
        : `${money(pace.need)}/mo keeps ${target.name} on pace`;
  }

  const valid = v > 0 && !over;
  const cta =
    (out ? 'Withdraw ' : 'Deposit ') +
    (v ? moneyAuto(v) + ' ' : '') +
    (out ? 'from ' : 'to ') +
    target.name;

  const submit = async () => {
    if (!valid || pending) return;
    setPending(true);
    const name = target.name;
    const label = moneyAuto(v);
    try {
      const res = await logTransactions([
        {
          fundId: target.id,
          type: out ? 'withdrawal' : 'deposit',
          value: v,
          notes: note.trim() || undefined,
        },
      ]);
      if (!res.ok) {
        toast.show("Couldn't log that. Try again.");
        setPending(false);
        return;
      }
      onClose();
      toast.show(
        out ? `Withdrew ${label} from ${name}` : `Deposited ${label} to ${name}`,
        async () => {
          await voidTransactions(res.refs);
        }
      );
    } catch {
      toast.show("Couldn't log that. Try again.");
      setPending(false);
    }
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <PanelHeader
        onClose={onClose}
        right={
          <ChipButton onClick={() => open({ kind: 'split' })}>
            Split a paycheck →
          </ChipButton>
        }
      />
      <Segmented<Mode>
        className='mt-4'
        ariaLabel='Transaction type'
        value={mode}
        onChange={setMode}
        options={[
          { value: 'deposit', label: 'Deposit' },
          { value: 'withdraw', label: 'Withdraw' },
        ]}
      />
      <div className='flex min-h-0 flex-1 flex-col items-center justify-center'>
        <div
          className={`font-serif text-[80px] leading-none tracking-[-.02em] ${
            v ? 'text-ink' : 'text-muted'
          }`}
        >
          {(out && v ? '−' : '') + amount.display}
        </div>
        <div
          className='mt-1.5 min-h-[18px] text-[13px]'
          style={{ color: hintColor }}
          aria-live='polite'
        >
          {hint}
        </div>
      </div>
      <div className='-mx-[18px] flex gap-2 overflow-x-auto px-[18px] pb-1'>
        {active.map((f) => (
          <ChipButton
            key={f.id}
            variant='card'
            selected={f.id === target.id}
            onClick={() => setPicked(f.id)}
          >
            <div className='text-sm font-semibold'>{f.name}</div>
            <div className='mt-0.5 font-mono text-[11px] opacity-75'>
              {mask(money(f.balance))}
            </div>
          </ChipButton>
        ))}
      </div>
      <div className='mt-1.5 mb-2'>
        <label htmlFor='quick-note' className='sr-only'>
          Note (optional)
        </label>
        <input
          id='quick-note'
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='Note (optional)'
          maxLength={80}
          className='h-11 w-full border-b border-line bg-transparent text-[15px] outline-none placeholder:text-muted'
        />
      </div>
      <Keypad className='mb-3' onPress={amount.press} />
      <PrimaryButton disabled={!valid || pending} onClick={submit}>
        {cta}
      </PrimaryButton>
    </div>
  );
}
